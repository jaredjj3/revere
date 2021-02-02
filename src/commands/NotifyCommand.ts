import { injectable, multiInject } from 'inversify';
import { sortBy, uniq } from 'lodash';
import yargs from 'yargs';
import { Detector, DetectorName } from '../detectors';
import { RevereError } from '../errors';
import { TYPES } from '../inversify.types';
import { Message } from '../messages';
import { Notifier, NotifierName } from '../notifiers';
import { Command, CommandName } from './types';

const DETECTORS = [DetectorName.Squoze];
const NOTIFIERS = [NotifierName.Console, NotifierName.Discord];
const DEFAULT_DETECTORS = DETECTORS;
const DEFAULT_NOTIFIERS = [NotifierName.Console];

type NotifyArgs = {
  detectorNames: DetectorName[];
  notifierNames: NotifierName[];
};

@injectable()
export class NotifyCommand implements Command<NotifyArgs> {
  name = CommandName.Notify;
  description = 'Runs the specified detectors and pipes it to the specified notifiers';

  constructor(
    @multiInject(TYPES.Detector) private detectors: Detector[],
    @multiInject(TYPES.Notifier) private notifiers: Notifier[]
  ) {}

  parse(argv: string[]): NotifyArgs {
    const parsed = yargs(argv).options({
      detectors: { alias: 'd', type: 'array', choices: DETECTORS, default: DEFAULT_DETECTORS },
      notifiers: { alias: 'n', type: 'array', choices: NOTIFIERS, default: DEFAULT_NOTIFIERS },
    }).argv;
    const detectorNames = uniq(parsed.detectors).sort();
    const notifierNames = uniq(parsed.notifiers).sort();
    return { detectorNames, notifierNames };
  }

  async run(args: NotifyArgs): Promise<void> {
    console.log(`running detectors: ${args.detectorNames.join(', ')}`);
    console.log(`running notifiers: ${args.notifierNames.join(', ')}`);
    const messages = await this.getMessages(args.detectorNames);
    await this.sendMessages(args.notifierNames, messages);
    console.log('done');
  }

  private async getMessages(detectorNames: DetectorName[]): Promise<Message[]> {
    const detectors = detectorNames.map(this.getDetector.bind(this));
    const result = await Promise.all(detectors.map((detector) => detector.detect()));
    const messages = result.flat();
    return sortBy(messages, (message) => message.detectedAt);
  }

  private async sendMessages(notifierNames: NotifierName[], messages: Message[]): Promise<void> {
    const notifiers = notifierNames.map(this.getNotifier.bind(this));
    const combos = new Array<{ notifier: Notifier; message: Message }>();
    for (const notifier of notifiers) {
      for (const message of messages) {
        combos.push({ notifier, message });
      }
    }
    await Promise.all(combos.map(({ notifier, message }) => notifier.notify(message)));
  }

  private getDetector(detectorName: DetectorName): Detector {
    const detector = this.detectors.find((detector) => detector.name === detectorName);
    if (!detector) {
      throw new RevereError(`could not find detector for: '${detectorName}'`);
    }
    return detector;
  }

  private getNotifier(notifierName: NotifierName): Notifier {
    const notifier = this.notifiers.find((notifier) => notifier.name === notifierName);
    if (!notifier) {
      throw new RevereError(`could not find notifier for: '${notifierName}'`);
    }
    return notifier;
  }
}
