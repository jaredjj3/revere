import Command from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';
import { RevereError } from '../errors';

const CWD_COMMANDS_DIR = path.join('src', 'commands');
const REL_COMMANDS_DIR = path.join('..', 'commands');

const isCommand = (thing: unknown): thing is typeof Command => {
  return typeof thing === 'function' && thing.prototype instanceof Command;
};

const getAllowedNames = (): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(CWD_COMMANDS_DIR, (err, files) => {
      if (err) {
        reject(err);
      }
      const names = files.filter((file) => path.extname(file) === '.ts').map((file) => file.slice(0, -3));
      resolve(names);
    });
  });
};

export const getCommandClass = async (name: string): Promise<typeof Command> => {
  const allowedNames = await getAllowedNames();
  if (!allowedNames.includes(name)) {
    throw new RevereError(`name not allowed: ${name}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CommandClass = require(path.join(REL_COMMANDS_DIR, `${name}.ts`)).default as unknown;
  if (!isCommand(CommandClass)) {
    throw new RevereError(`name not command: ${name}`);
  }

  return CommandClass;
};
