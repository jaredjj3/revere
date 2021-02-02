import dotenv from 'dotenv';
import 'reflect-metadata';
import { run } from './commands';
import { CommandName } from './commands/types';
import { container } from './inversify.config';

const main = async () => {
  console.log('loading .env file');
  dotenv.config();
  await run(CommandName.Notify, process.argv.slice(2), container);
  process.exit(0);
};

if (require.main === module) {
  main();
}
