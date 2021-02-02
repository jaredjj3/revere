import dotenv from 'dotenv';
import 'reflect-metadata';
import yargs from 'yargs';
import { Detector, DETECTORS } from './detectors';
import { container } from './inversify.config';
import { Message } from './messages';
import { Notifier, NotifierName, NOTIFIERS } from './notifiers';

const argv = yargs(process.argv.slice(2)).options({
  detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DETECTORS },
  notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: [NotifierName.Console] },
}).argv;

const main = async () => {
  console.log('loading .env file');
  dotenv.config();

  const detectorNames = Array.from(new Set(argv.detectors)).sort();
  const notifierNames = Array.from(new Set(argv.notifiers)).sort();

  console.log(`running detectors: ${detectorNames.join(', ')}`);
  console.log(`running notifiers: ${notifierNames.join(', ')}`);

  const detectors = detectorNames.map((detectorName) => container.get<Detector<Message>>(detectorName));
  const notifiers = notifierNames.map((notifierName) => container.get<Notifier>(notifierName));

  const messages = (await Promise.all(detectors.map((detector) => detector.detect()))).flat();
  messages.sort((m1, m2) => m1.detectedAt.getSeconds() - m2.detectedAt.getSeconds());

  await Promise.all(notifiers.flatMap((notifier) => messages.map((message) => notifier.notify(message))));

  console.log('done');
  process.exit(0);
};

if (require.main === module) {
  main();
}
