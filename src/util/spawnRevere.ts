import { spawn } from 'child_process';
import { RevereError } from '../errors';
import { env } from './env';
import { getCommandClass } from './getCommandClass';

const DEFAULT_COMMAND_TIMEOUT_MS = 5000;
const ALLOWED_CMD_SRC = ['console', 'discord'];

const isHiddenCommand = async (str: string | undefined): Promise<boolean> => {
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
    const CommandClass = await getCommandClass(str);
    return CommandClass.hidden;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const spawnRevere = async (argv: string[], timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS): Promise<string> => {
  const cmdInputSrc = env('CMD_INPUT_SRC');
  if (!ALLOWED_CMD_SRC.includes(cmdInputSrc)) {
    throw new RevereError(`invalid CMD_INPUT_SRC: ${cmdInputSrc}`);
  }

  if (await isHiddenCommand(argv[0])) {
    // A regular error is thrown to make it indistinguishable from an missing command error thrown by oclif
    throw Error(`command ${argv[0]} not found`);
  }

  const run = spawn('bin/run', argv, { shell: false, env: { ...process.env, CMD_INPUT_SRC: cmdInputSrc } });

  const buffer = new Array<string>();

  run.stdout.on('data', (chunk: Buffer) => {
    buffer.push(chunk.toString());
  });

  run.stderr.on('data', (chunk: Buffer) => {
    buffer.push(chunk.toString());
  });

  const close = new Promise<string>((resolve, reject) => {
    run.on('close', () => {
      const str = buffer.join('');
      if (run.exitCode === 0) {
        resolve(str);
      } else {
        reject(new RevereError(`${str}\n\nnon-zero exit code: ${run.exitCode}`));
      }
    });
  });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      run.kill();
      reject(new RevereError(`timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return await Promise.race<string>([close, timeout]);
};
