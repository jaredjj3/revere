import { flags } from '@oclif/command';
import { $messages, $notifiers } from '../../helpers';
import { ExitImmediatelyCommand } from '../ExitImmediatelyCommand';
import { $flags } from '../flags';

export default class Echo extends ExitImmediatelyCommand {
  static description = 'prints the arguments to stdout';

  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
  };

  static args = [{ name: 'string', required: true }];

  async run(): Promise<void> {
    const { argv, flags } = this.parse(Echo);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, $messages.stdout(argv.join(' ')));
  }
}
