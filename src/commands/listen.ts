import { Command, flags } from '@oclif/command';
import { capitalize, uniq } from 'lodash';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { Listener } from '../listeners';
import { Notifier } from '../notifiers';

const ALLOWED_LISTENERS = ['discord'];
const ALLOWED_NOTIFIERS = ['console', 'discord'];
const DEFAULT_LISTENERS = ['discord'];
const DEFAULT_NOTIFIERS = ['discord'];

export default class Listen extends Command {
  static description = 'setup a listener to wait for commands';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
    listeners: flags.string({ char: 'l', multiple: true, default: DEFAULT_LISTENERS }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Listen);

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
    const serviceIdentifier = `${capitalize(listenerName)}Listener`;
    return container.get<Listener>(serviceIdentifier);
  }

  private getNotifier(notifierName: string): Notifier {
    if (!ALLOWED_NOTIFIERS.includes(notifierName)) {
      throw new RevereError(`notifier not allowed: ${notifierName}`);
    }
    const serviceIdentifier = `${capitalize(notifierName)}Notifier`;
    return container.get<Notifier>(serviceIdentifier);
  }
}
