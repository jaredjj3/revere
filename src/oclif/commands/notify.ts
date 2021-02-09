import { flags } from '@oclif/command';
import { flatten, sortBy, uniq } from 'lodash';
import { Detector } from '../../detectors';
import { $detectors, $notifiers } from '../../helpers';
import { Message } from '../../messages';
import { Notifier } from '../../notifiers';
import { BaseCommand } from '../../oclif';
import { $flags } from '../flags';

export default class Notify extends BaseCommand {
  static description = 'runs specified detectors and notifiers';

  static flags = {
    help: flags.help({ char: 'h' }),
    detectors: flags.string({ char: 'd', multiple: true, default: $detectors.DEFAULT_DETECTORS }),
    notifiers: $flags.notifiers(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Notify);

    const detectors = uniq(flags.detectors).map($detectors.getDetector);
    const notifiers = uniq(flags.notifiers).map($notifiers.getNotifier);

    this.log(`running detectors: ${uniq(flags.detectors).join(', ')}`);
    this.log(`running notifiers: ${uniq(flags.notifiers).join(', ')}`);

    const messages = await this.getMessages(detectors);
    await this.sendMessages(notifiers, messages);
    this.exit(0);
  }

  private async getMessages(detectors: Detector[]): Promise<Message[]> {
    const result = await Promise.all(detectors.map((detector) => detector.detect()));
    const messages = flatten(result);
    return sortBy(messages, (message) => message.timestamp.getMilliseconds());
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
}
