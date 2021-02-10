import { flags } from '@oclif/command';
import { SquozeDetector } from '../../../detectors';
import { $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { BaseCommand } from '../../../oclif';
import { $flags } from '../../flags';

export default class Squoze extends BaseCommand {
  static description = 'runs specified detectors and notifiers';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Squoze);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    const squozeDetector = container.get<SquozeDetector>(TYPES.SquozeDetector);
    await squozeDetector.detect(notifiers);
    this.exit(0);
  }
}
