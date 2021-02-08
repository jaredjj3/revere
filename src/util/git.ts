import { GitCommitStatus } from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { RevereError } from '../errors';
import { env } from './env';

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
