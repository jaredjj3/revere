import { spawn } from 'child_process';
import { RevereError } from '../errors';
import { MessageType, Severity } from '../messages';
import { Notifier } from '../notifiers';

const DEFAULT_COMMAND_TIMEOUT_MS = 5000;

export const spawnRun = async (argv: string[], timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS): Promise<string> => {
  const run = spawn('bin/run', argv, { shell: false });

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

export const notify = async (notifiers: Notifier[], content: string): Promise<void> => {
  const timestamp = new Date();
  await Promise.all(
    notifiers.map((notifier) =>
      notifier.notify({ type: MessageType.Stdout, content, severity: Severity.Info, timestamp })
    )
  );
};
