import { Command, flags } from '@oclif/command';
import { DEFAULT_NOTIFIERS, getNotifier, notify } from '../util';

export default class Echo extends Command {
  static description = 'prints the arguments to stdout';

  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
  };

  static args = [{ name: 'string', required: true }];

  async run(): Promise<void> {
    const { argv, flags } = this.parse(Echo);
    const notifiers = flags.notifiers.map(getNotifier);
    await notify(notifiers, argv.join(' '));
    this.exit(0);
  }
}
