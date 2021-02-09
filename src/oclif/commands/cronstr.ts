import { flags } from '@oclif/command';
import cronstrue from 'cronstrue';
import { $notifiers } from '../../helpers';
import { createMessage } from '../../helpers/messages';
import { toInlineCodeStr } from '../../util';
import { BaseCommand } from '../BaseCommand';

export default class Cronstr extends BaseCommand {
  static description = 'translate a cron expression';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: $notifiers.DEFAULT_NOTIFIERS }),
  };

  static args = [{ name: 'cron expression' }];

  static strict = false;

  async run(): Promise<void> {
    const { flags, argv } = this.parse(Cronstr);
    const cronExpression = argv.join(' ');
    const humanReadableStr = cronstrue.toString(cronExpression);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(
      notifiers,
      createMessage({ content: `${toInlineCodeStr(cronExpression)} translates to: _"${humanReadableStr}"_` })
    );
    this.exit(0);
  }
}
