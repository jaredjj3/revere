import dotenv from 'dotenv';
import yargs from 'yargs';
import { Detector, DetectorName, DETECTORS } from './detectors';
import { SquozeDetector } from './detectors/SquozeDetector';
import { RevereError } from './errors';
import { Message } from './messages';
import { Notifier, NotifierName, NOTIFIERS } from './notifiers';
import { ConsoleNotifier } from './notifiers/ConsoleNotifier';
import { DiscordNotifier } from './notifiers/DiscordNotifier';

const argv = yargs(process.argv.slice(2)).options({
  detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DETECTORS },
  notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: [NotifierName.Console] },
}).argv;

const getDetector = (detector: DetectorName): Detector<Message> => {
  switch (detector) {
    case DetectorName.Squoze:
      return new SquozeDetector();
    default:
      throw new RevereError(`unmapped detector: ${detector}`);
  }
};

const getNotifier = (notifier: NotifierName): Notifier => {
  switch (notifier) {
    case NotifierName.Discord:
      return new DiscordNotifier();
    case NotifierName.Console:
      return new ConsoleNotifier();
    default:
      throw new RevereError(`unmapped notifier: ${notifier}`);
  }
};

const main = async () => {
  console.log('loading .env file');
  dotenv.config();

  const detectorNames = Array.from(new Set(argv.detectors)).sort();
  const notifierNames = Array.from(new Set(argv.notifiers)).sort();

  console.log(`running detectors: ${detectorNames.join(', ')}`);
  console.log(`running notifiers: ${notifierNames.join(', ')}`);

  const detectors = detectorNames.map(getDetector);
  const notifiers = notifierNames.map(getNotifier);

  const messages = (await Promise.all(detectors.map((detector) => detector.detect()))).flat();
  messages.sort((m1, m2) => m1.detectedAt.getSeconds() - m2.detectedAt.getSeconds());

  await Promise.all(notifiers.flatMap((notifier) => messages.map((message) => notifier.notify(message))));

  console.log('done');
  process.exit(0);
};

if (require.main === module) {
  main();
}
