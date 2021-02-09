import Command from '@oclif/command';
import { CommandRun, CommandRunSrc, CommandRunStatus, GitCommitStatus, Prisma, PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { RevereError } from '../errors';
import { TYPES } from '../inversify.constants';
import { getGitCommitHash, getGitCommitStatus, logger } from '../util';

const CWD_COMMANDS_DIR = path.join('src', 'commands');
const REL_COMMANDS_DIR = path.join('..', '..', 'commands');
const DEFAULT_RUN_OPTIONS: RunOptions = { src: CommandRunSrc.UNKNOWN, timeoutMs: 30000 };

type RunOptions = {
  src: CommandRunSrc;
  timeoutMs: number;
};

@injectable()
export class CommandRunner {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async run(argv: string[], runOpts: Partial<RunOptions>): Promise<CommandRun> {
    const opts: RunOptions = { ...DEFAULT_RUN_OPTIONS, ...runOpts };
    const [gitCommitHash, gitCommitStatus] = await Promise.all([getGitCommitHash(), getGitCommitStatus()]);
    const commandRun = this.buildCommandRun({
      command: argv.join(' '),
      gitCommitHash,
      gitCommitStatus,
      src: opts.src,
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
    const run = spawn('bin/run', argv, { shell: false, env: { ...process.env, CMD_INPUT_SRC: opts.src } });

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
        if (run.exitCode === 0) {
          resolve();
        } else {
          console.log('wtf');
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
      logger.error(err);
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
      const CommandClass = this.getCommandClass(str);
      return (await CommandClass).hidden;
    } catch (err) {
      logger.error(err);
      return false;
    }
  }

  private async getCommandClass(name: string): Promise<typeof Command> {
    const allowedNames = await this.getAllowedNames();
    if (!allowedNames.includes(name)) {
      throw new RevereError(`name not allowed: ${name}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CommandClass = require(path.join(REL_COMMANDS_DIR, `${name}.ts`)).default as unknown;
    if (!this.isCommand(CommandClass)) {
      throw new RevereError(`name not command: ${name}`);
    }

    return CommandClass;
  }

  private getAllowedNames(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(CWD_COMMANDS_DIR, (err, files) => {
        if (err) {
          reject(err);
        }
        const names = files.filter((file) => path.extname(file) === '.ts').map((file) => file.slice(0, -3));
        resolve(names);
      });
    });
  }

  private isCommand(thing: unknown): thing is typeof Command {
    return typeof thing === 'function' && thing.prototype instanceof Command;
  }
}
