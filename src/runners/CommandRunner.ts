import Command from '@oclif/command';
import {
  CallerType,
  CommandRun,
  CommandRunSrc,
  CommandRunStatus,
  GitCommitStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { flattenDeep, last, reject } from 'lodash';
import * as path from 'path';
import { RevereError } from '../errors';
import { $util } from '../helpers';
import { TYPES } from '../inversify.constants';
import { logger } from '../logger';
import { HELP_EXIT_CODE } from '../oclif/constants';

const CWD_COMMANDS_DIR = path.join('src', 'oclif', 'commands');
const REL_COMMANDS_DIR = path.join('..', 'oclif', 'commands');
const DEFAULT_RUN_OPTIONS: RunOptions = { src: CommandRunSrc.UNKNOWN, timeoutMs: 30000 };

type RunOptions = {
  src: CommandRunSrc;
  timeoutMs: number;
  callerId?: string;
  callerType?: CallerType;
};

@injectable()
export class CommandRunner {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async run(argv: string[], runOpts: Partial<RunOptions>): Promise<CommandRun> {
    const opts: RunOptions = { ...DEFAULT_RUN_OPTIONS, ...runOpts };
    const [gitCommitHash, gitCommitStatus] = await Promise.all([$util.getGitCommitHash(), $util.getGitCommitStatus()]);
    const commandRun = this.buildCommandRun({
      command: argv.join(' '),
      gitCommitHash,
      gitCommitStatus,
      src: opts.src,
      callerId: opts.callerId,
      callerType: opts.callerType,
    });

    // prevent hidden commands from being run
    if (await this.isHiddenCommand(argv[0])) {
      // A regular error is thrown to make it indistinguishable from an missing command error thrown by oclif
      commandRun.status = CommandRunStatus.NOT_RUN;
      await this.prisma.commandRun.create({ data: commandRun });
      throw Error(` ›   Error: command ${argv[0]} not found`);
    }

    // run the command
    commandRun.startedAt = new Date();
    logger.debug(`running '${argv.join(' ')}' with opts: ${JSON.stringify(opts)}`);
    const run = spawn('bin/run', argv, {
      shell: false,
      env: { ...process.env, CMD_INPUT_SRC: opts.src, LOG_LEVEL: 'DEBUG' },
    });

    // handle command events
    const stdout = new Array<string>();
    const stderr = new Array<string>();
    run.stdout.on('data', (chunk: Buffer) => {
      stdout.push(chunk.toString());
    });
    run.stderr.on('data', (chunk: Buffer) => {
      stderr.push(chunk.toString());
    });
    const runClose = new Promise<void>((resolve, reject) => {
      run.on('close', () => {
        commandRun.endedAt = new Date();
        commandRun.exitCode = typeof run.exitCode === 'number' ? run.exitCode : -1;
        commandRun.stdout = stdout.join('');
        commandRun.stderr = stderr.join('');
        if (run.exitCode === 0 || run.exitCode === HELP_EXIT_CODE) {
          resolve();
        } else {
          reject(new RevereError(commandRun.stderr));
        }
      });
    });
    const timeout =
      opts.timeoutMs > 0
        ? new Promise<never>((_, reject) => {
            setTimeout(() => {
              run.kill();
              reject(new RevereError(`timed out after ${opts.timeoutMs}ms`));
            }, opts.timeoutMs);
          })
        : new Promise<never>(() => undefined);

    // wait for runClose promise to resolve
    try {
      await Promise.race<void>([runClose, timeout]);
      commandRun.status = CommandRunStatus.SUCCESS;
    } catch (err) {
      commandRun.status = CommandRunStatus.ERROR;
    }

    // create the command run and return
    return await this.prisma.commandRun.create({ data: commandRun });
  }

  private buildCommandRun(input: Partial<Prisma.CommandRunCreateInput>): Prisma.CommandRunCreateInput {
    const epoch = new Date(0);
    return {
      startedAt: epoch,
      endedAt: epoch,
      command: '',
      src: CommandRunSrc.UNKNOWN,
      status: CommandRunStatus.UNKNOWN,
      gitCommitHash: '',
      gitCommitStatus: GitCommitStatus.UNKNOWN,
      stderr: '',
      stdout: '',
      exitCode: -1,
      callerId: undefined,
      callerType: CallerType.UNKNOWN,
      ...input,
    };
  }

  private async isHiddenCommand(str: string | undefined): Promise<boolean> {
    if (!str) {
      return false;
    }
    if (str === 'help') {
      return false;
    }
    const isFlag = str.startsWith('-');
    if (isFlag) {
      return false;
    }
    try {
      const CommandClass = await this.getCommandClass(str);
      return CommandClass.hidden;
    } catch (err) {
      return false;
    }
  }

  private async getCommandClass(name: string): Promise<typeof Command> {
    const allowedNames = await this.getAllowedNames();
    if (!allowedNames.includes(name)) {
      throw new RevereError(`name not allowed: ${name}`);
    }

    const parts = name.split(':');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parts[parts.length - 1] = `${last(parts)!}.ts`;
    const commandPath = path.join(REL_COMMANDS_DIR, ...parts);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CommandClass = require(commandPath).default as unknown;
    if (!this.isCommand(CommandClass)) {
      throw new RevereError(`name not command: ${name}`);
    }

    return CommandClass;
  }

  private async getAllowedNames(dir = CWD_COMMANDS_DIR, prefix = ''): Promise<string[]> {
    const objs = await new Promise<string[]>((resolve, reject) => {
      fs.readdir(dir, (err, objs) => {
        if (err) {
          reject(err);
        }
        resolve(objs);
      });
    });

    const infos = await Promise.all(
      objs.map((obj) => {
        return new Promise<{ obj: string; stats: fs.Stats }>((resolve) => {
          fs.lstat(path.join(dir, obj), (err, stats) => {
            if (err) {
              reject(err);
            }
            resolve({ obj, stats });
          });
        });
      })
    );

    const withPrefix = (str: string): string => (prefix ? `${prefix}:${str}` : str);

    const files = infos
      .filter((info) => info.stats.isFile() && path.extname(info.obj) === '.ts')
      .map((info) => withPrefix(info.obj));
    let cmds = files.map((file) => file.slice(0, -3)); // '.ts' is 3 chars

    const dirs = infos.filter((info) => info.stats.isDirectory()).map((info) => info.obj);
    const nestedCmds = await Promise.all(
      dirs.map((nestedDir) => this.getAllowedNames(path.join(dir, nestedDir), withPrefix(nestedDir)))
    );

    cmds = cmds.concat(dirs.map((dir) => withPrefix(dir)));
    cmds = cmds.concat(flattenDeep(nestedCmds));

    return cmds;
  }

  private isCommand(thing: unknown): thing is typeof Command {
    return typeof thing === 'function' && thing.prototype instanceof Command;
  }
}
