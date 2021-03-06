import { flags } from '@oclif/command';
import { uniq } from 'lodash';
import { $listeners, $notifiers } from '../../helpers';
import { logger } from '../../logger';
import { $flags } from '../flags';
import { LongRunningCommand } from '../LongRunningCommand';

export default class Listen extends LongRunningCommand {
  static hidden = true;
  static description = 'setup a listener to wait for commands';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    listeners: flags.string({ char: 'l', multiple: true, default: $listeners.DEFAULT_LISTENERS }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Listen);
    const notifiers = uniq(flags.notifiers).map($notifiers.getNotifier);
    const listeners = uniq(flags.listeners).map($listeners.getListener);
    await $listeners.listenAll(listeners, notifiers);
    logger.info(`running listeners: ${flags.listeners.join(',')}`);
    logger.info(`running notifiers: ${flags.notifiers.join(',')}`);
  }
}
