import { Container } from 'inversify';
import { TYPES } from '../inversify.types';
import { Command, CommandName } from './types';

export const run = async (commandName: CommandName, argv: string[], container: Container): Promise<void> => {
  const command = container.getNamed<Command>(TYPES.Command, commandName);
  const args = command.parse(argv);
  await command.run(args);
};
