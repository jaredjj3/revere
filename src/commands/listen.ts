import { Command, flags } from '@oclif/command';
import { uniq } from 'lodash';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';
import { Listener } from '../listeners';
import { Notifier } from '../notifiers';
import { env } from '../util';

const ALLOWED_LISTENERS = [NAMES.console, NAMES.discord];
const ALLOWED_NOTIFIERS = [NAMES.console, NAMES.discord];
const DEFAULT_LISTENERS = [NAMES.console];
const DEFAULT_NOTIFIERS = [NAMES.console];

export default class Listen extends Command {
  static description = 'setup a listener to wait for commands';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
    listeners: flags.string({ char: 'l', multiple: true, default: DEFAULT_LISTENERS }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Listen);

    console.log('DATABASE_URL', env('DATABASE_URL'));

    const notifiers = uniq(flags.notifiers).map(this.getNotifier);
    const listeners = uniq(flags.listeners).map(this.getListener);

    await Promise.all(listeners.map((listener) => listener.listen(notifiers)));

    console.log(`running notifiers: ${uniq(flags.notifiers).join(', ')}`);
    console.log(`running listeners: ${uniq(flags.listeners).join(', ')}`);
  }

  private getListener(listenerName: string): Listener {
    if (!ALLOWED_LISTENERS.includes(listenerName)) {
      throw new RevereError(`listener not allowed: ${listenerName}`);
    }
    return container.getNamed<Listener>(TYPES.Listener, listenerName);
  }

  private getNotifier(notifierName: string): Notifier {
    if (!ALLOWED_NOTIFIERS.includes(notifierName)) {
      throw new RevereError(`notifier not allowed: ${notifierName}`);
    }
    return container.getNamed<Notifier>(TYPES.Notifier, notifierName);
  }
}
