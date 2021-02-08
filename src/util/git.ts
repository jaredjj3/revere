import { GitCommitStatus } from '@prisma/client';
import { spawn } from 'child_process';
import { RevereError } from '../errors';

export const getCommitHash = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
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
