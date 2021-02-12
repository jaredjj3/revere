import { flags } from '@oclif/command';
import cronstrue from 'cronstrue';
import { $formats, $notifiers } from '../../helpers';
import { simple } from '../../helpers/messages';
import { ExitImmediatelyCommand } from '../ExitImmediatelyCommand';
import { $flags } from '../flags';

export default class Cronstr extends ExitImmediatelyCommand {
  static description = 'translate a cron expression';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
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
      simple({ description: `${$formats.mdInlineCodeBlock(cronExpression)} translates to: _"${humanReadableStr}"_` })
    );
  }
}
