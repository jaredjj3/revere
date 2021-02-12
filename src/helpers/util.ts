import { GitCommitStatus } from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { MissingEnvError, RevereError } from '../errors';
import { logger } from '../logger';

export const env = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new MissingEnvError(key);
  }
  return val;
};

const GIT_DIR = path.join('..', '.git');

export const gitDirExists = (): boolean => fs.existsSync(GIT_DIR);

export const getGitCommitHash = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    if (!gitDirExists()) {
      return resolve(env('GIT_COMMIT_HASH'));
    }

    const git = spawn('git', ['rev-parse', 'HEAD']);

    const stdout = new Array<string>();
    const stderr = new Array<string>();

    git.stdout.on('data', (chunk: Buffer) => {
      stdout.push(chunk.toString());
    });

    git.stderr.on('data', (chunk: Buffer) => {
      stderr.push(chunk.toString());
    });

    git.on('close', () => {
      if (git.exitCode === 0) {
        resolve(stdout.join(''));
      } else {
        reject(new RevereError(stderr.join('')));
      }
    });
  });

export const getGitCommitStatus = (): Promise<GitCommitStatus> =>
  new Promise<GitCommitStatus>((resolve) => {
    if (!gitDirExists()) {
      try {
        switch (env('GIT_COMMIT_STATUS')) {
          case 'CLEAN':
            return resolve(GitCommitStatus.CLEAN);
          case 'DIRTY':
            return resolve(GitCommitStatus.DIRTY);
          default:
            return resolve(GitCommitStatus.UNKNOWN);
        }
      } catch (e) {
        return resolve(GitCommitStatus.UNKNOWN);
      }
    }

    const git = spawn('git', ['status', '-s']);

    const stdout = new Array<string>();
    const stderr = new Array<string>();

    git.stdout.on('data', (chunk: Buffer) => {
      stdout.push(chunk.toString());
    });

    git.stderr.on('data', (chunk: Buffer) => {
      stderr.push(chunk.toString());
    });

    git.on('close', () => {
      if (git.exitCode === 0) {
        resolve(stdout.length ? GitCommitStatus.DIRTY : GitCommitStatus.CLEAN);
      } else {
        resolve(GitCommitStatus.UNKNOWN);
      }
    });
  });

type CleanupCallback = () => Promise<void>;

const catchAll = async (callback: CleanupCallback): Promise<void> => {
  try {
    await callback();
  } catch (err) {
    logger.error('error caught while cleaning up', err);
  }
};

/**
 * IFFE that "globally" tracks callbacks without polluting the global namespace.
 * Each invocation of onCleanup returns an cleanup callback that can be manually called
 * to cleanup resources.
 */
export const onCleanup = (() => {
  const callbacks = new Set<CleanupCallback>();

  const cleanup = async () => {
    logger.debug('cleanup started');
    await Promise.all(Array.from(callbacks).map((callback) => catchAll(callback)));
    logger.debug('cleanup done');
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  return (callback?: CleanupCallback): CleanupCallback => {
    if (callback) {
      callbacks.add(callback);
    }
    return cleanup;
  };
})();
