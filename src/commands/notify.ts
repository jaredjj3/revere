import { Command, flags } from '@oclif/command';
import { flatten, sortBy } from 'lodash';
import { Detector } from '../detectors';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { Message } from '../messages';
import { Notifier } from '../notifiers';
import { capitalize } from '../util';

const ALLOWED_DETECTORS = ['squoze'];
const ALLOWED_NOTIFIERS = ['console', 'discord'];
const DEFAULT_DETECTORS = ['squoze'];
const DEFAULT_NOTIFIERS = ['console'];

export default class Notify extends Command {
  static description = 'runs specified detectors and notifiers';

  static flags = {
    help: flags.help({ char: 'h' }),
    detectors: flags.string({ char: 'd', multiple: true, default: DEFAULT_DETECTORS }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Notify);

    const detectors = flags.detectors.map(this.getDetector.bind(this));
    const notifiers = flags.notifiers.map(this.getNotifier.bind(this));

    this.log(`running detectors: ${flags.detectors.join(', ')}`);
    this.log(`running notifiers: ${flags.notifiers.join(', ')}`);

    const messages = await this.getMessages(detectors);
    await this.sendMessages(notifiers, messages);
  }

  private async getMessages(detectors: Detector[]): Promise<Message[]> {
    const result = await Promise.all(detectors.map((detector) => detector.detect()));
    const messages = flatten(result);
    return sortBy(messages, (message) => message.detectedAt.getMilliseconds());
  }

  private async sendMessages(notifiers: Notifier[], messages: Message[]): Promise<void> {
    const combos = new Array<{ notifier: Notifier; message: Message }>();
    for (const notifier of notifiers) {
      for (const message of messages) {
        combos.push({ notifier, message });
      }
    }
    await Promise.all(combos.map(({ notifier, message }) => notifier.notify(message)));
  }

  private getDetector(detectorName: string): Detector {
    if (!ALLOWED_DETECTORS.includes(detectorName)) {
      throw new RevereError(`detector not allowed: ${detectorName}`);
    }
    const serviceIdentifier = `${capitalize(detectorName)}Detector`;
    return container.get<Detector>(serviceIdentifier);
  }

  private getNotifier(notifierName: string): Notifier {
    if (!ALLOWED_NOTIFIERS.includes(notifierName)) {
      throw new RevereError(`notifier not allowed: ${notifierName}`);
    }
    const serviceIdentifier = `${capitalize(notifierName)}Notifier`;
    return container.get<Notifier>(serviceIdentifier);
  }
}
