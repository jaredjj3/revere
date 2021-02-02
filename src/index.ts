import dotenv from 'dotenv';
import 'reflect-metadata';
import { CommandName, run } from './commands';
import { RevereError } from './errors';
import { container } from './inversify.config';

const toCmdName = (str: string | undefined): CommandName => {
  const cmdNames = Object.values(CommandName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!str || !cmdNames.includes(str as any)) {
    throw new RevereError(`invalid command: ${str}`);
  }
  return str as CommandName;
};

const main = async () => {
  console.log('loading .env file');
  dotenv.config();

  const cmdName = toCmdName(process.argv[2]);
  const argv = process.argv.slice(3);
  await run(cmdName, argv, container);

  process.exit(0);
};

if (require.main === module) {
  main();
}
