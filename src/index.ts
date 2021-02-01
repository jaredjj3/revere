import dotenv from 'dotenv';
import yargs from 'yargs';
import { Detector, DetectorName, DETECTORS } from './detectors';
import { SquozeDetector } from './detectors/SquozeDetector';
import { Message } from './messages';
import { Notifier, NotifierName, NOTIFIERS } from './notifiers';
import { ConsoleNotifier } from './notifiers/ConsoleNotifier';
import { DiscordNotifier } from './notifiers/DiscordNotifier';
import { Env } from './types';

const argv = yargs(process.argv.slice(2)).options({
  detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DETECTORS },
  notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: NOTIFIERS },
}).argv;

const getDetector = (detector: DetectorName): Detector<Message> => {
  switch (detector) {
    case DetectorName.Squoze:
      return new SquozeDetector();
    default:
      throw new Error(`unrecognized detector: ${detector}`);
  }
};

const getNotifier = (notifier: NotifierName): Notifier => {
  switch (notifier) {
    case NotifierName.Discord:
      return new DiscordNotifier();
    case NotifierName.Console:
      return new ConsoleNotifier();
    default:
      throw new Error(`unrecognized notifier: ${notifier}`);
  }
};

const getEnv = () => {
  const env: Partial<Env> = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
  };

  const missing = new Array<string>();
  for (const [key, val] of Object.entries(env)) {
    if (!val) {
      missing.push(key);
    }
  }
  if (missing.length) {
    throw new Error(`missing env vars, please add to root level .env file: ${missing.join(', ')}`);
  }

  return env as Env;
};

const toString = (message: Message): string => {
  return `${message.detectedAt}\n\n${message.content}`;
};

const main = async () => {
  console.log('loading env from .env file');
  dotenv.config();
  const env = getEnv();
  console.log('env loaded');

  const detectorNames = Array.from(new Set(argv.detectors)).sort();
  const notifierNames = Array.from(new Set(argv.notifiers)).sort();

  console.log(`running detectors: ${detectorNames.join(', ')}`);
  console.log(`running notifiers: ${notifierNames.join(', ')}`);

  const detectors = detectorNames.map(getDetector);
  const notifiers = notifierNames.map(getNotifier);

  const messages = (await Promise.all(detectors.map((detector) => detector.detect()))).flat();
  messages.sort((m1, m2) => m1.detectedAt.getSeconds() - m2.detectedAt.getSeconds());
  const strs = messages.map(toString);

  await Promise.all(notifiers.flatMap((notifier) => strs.map((str) => notifier.notify(str))));

  console.log('done');
  process.exit(0);
};

if (require.main === module) {
  main();
}
