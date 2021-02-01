import yargs from 'yargs';
import { Detector, DetectorName, DETECTORS } from './detectors';
import { SquozeDetector } from './detectors/SquozeDetector';
import { NOTIFIERS } from './notifiers';

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

const main = async () => {
  const detectors = Array.from(new Set(argv.detectors)).sort();
  const notifiers = Array.from(new Set(argv.notifiers)).sort();

  console.log(`running detectors: ${detectors.join(', ')}`);
  console.log(`running notifiers: ${notifiers.join(', ')}`);

  const messages = (await Promise.all(detectors.map(getDetector).map((detector) => detector.detect()))).flat();
  messages.sort((m1, m2) => m1.detectedAt.getSeconds() - m2.detectedAt.getSeconds());

  console.log(messages);
};

if (require.main === module) {
  main();
}
