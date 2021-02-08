import { Command, flags } from '@oclif/command';
import { $notifiers } from '../helpers';
import { getCommitHash, getGitCommitStatus, logger } from '../util';

export default class Echo extends Command {
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

    const [gitCommitHash, gitCommitStatus] = await Promise.all([getCommitHash(), getGitCommitStatus()]);
    logger.info(`gitCommitHash: ${gitCommitHash}, gitCommitStatus: ${gitCommitStatus}`);
    await $notifiers.notify(notifiers, argv.join(' '));
    this.exit(0);
  }
}
