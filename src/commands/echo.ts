import { flags } from '@oclif/command';
import { $messages, $notifiers } from '../helpers';
import { BaseCommand } from '../oclif';

export default class Echo extends BaseCommand {
  static description = 'prints the arguments to stdout';

  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: $notifiers.DEFAULT_NOTIFIERS }),
  };

  static args = [{ name: 'string', required: true }];

  async run(): Promise<void> {
    const { argv, flags } = this.parse(Echo);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, $messages.createStdoutMessage({ content: argv.join(' ') }));
    this.exit(0);
  }
}
