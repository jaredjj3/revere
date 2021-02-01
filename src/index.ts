import yargs from 'yargs';
import { DETECTORS } from './detectors';
import { NOTIFIERS } from './notifiers';

const argv = yargs(process.argv.slice(2)).options({
  detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DETECTORS },
  notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: NOTIFIERS },
}).argv;

const main = () => {
  const detectors = Array.from(new Set(argv.detectors)).sort();
  const notifiers = Array.from(new Set(argv.notifiers)).sort();

  console.log(`running detectors: ${detectors.join(', ')}`);
  console.log(`running notifiers: ${notifiers.join(', ')}`);
};

if (require.main === module) {
  main();
}
