import { flags } from '@oclif/command';
import { uniq } from 'lodash';
import { $listeners, $notifiers } from '../helpers';
import { BaseCommand } from '../oclif';
import { logger } from '../util';

export default class Listen extends BaseCommand {
  static hidden = true;
  static description = 'setup a listener to wait for commands';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: $notifiers.DEFAULT_NOTIFIERS }),
    listeners: flags.string({ char: 'l', multiple: true, default: $listeners.DEFAULT_LISTENERS }),
    showGreeting: flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Listen);

    const notifiers = uniq(flags.notifiers).map($notifiers.getNotifier);
    const listeners = uniq(flags.listeners).map($listeners.getListener);

    await Promise.all(listeners.map((listener) => listener.listen(notifiers)));

    logger.info(`running notifiers: ${uniq(flags.notifiers).join(', ')}`);
    logger.info(`running listeners: ${uniq(flags.listeners).join(', ')}`);
  }
}
