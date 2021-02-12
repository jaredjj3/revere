import { flags } from '@oclif/command';
import { SquozeDetector } from '../../../detectors';
import { $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class Squoze extends ExitImmediatelyCommand {
  static description = 'runs the squoze detector';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Squoze);
    const squozeDetector = container.get<SquozeDetector>(TYPES.SquozeDetector);
    const messages = await squozeDetector.detect();

    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, ...messages);
  }
}
