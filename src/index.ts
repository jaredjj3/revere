import yargs from 'yargs';
import { Detector, DetectorName, DETECTORS } from './detectors';
import { SquozeDetector } from './detectors/SquozeDetector';
import { Message } from './messages';
import { Notifier, NotifierName, NOTIFIERS } from './notifiers';
import { DiscordNotifier } from './notifiers/DiscordNotifier';

const argv = yargs(process.argv.slice(2)).options({
  detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DETECTORS },
  notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: NOTIFIERS },
}).argv;

const getDetector = (detector: DetectorName): Detector => {
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
    default:
      throw new Error(`unrecognized notifier: ${notifier}`);
  }
};

const toString = (message: Message): string => {
  return `${message.detectedAt}\n\n${message.content}`;
};

const main = async () => {
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
