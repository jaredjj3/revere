import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { TickerThresholdDetector } from '../../../detectors';
import { RevereError } from '../../../errors';
import { $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { BaseCommand } from '../../../oclif';
import { $flags } from '../../flags';

export default class Tickerthreshold extends BaseCommand {
  static description = 'runs specified detectors and notifiers';

  static flags = {
    help: flags.help({ char: 'h' }),
    objectiveId: flags.integer({ required: true }),
    notifiers: $flags.notifiers(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Tickerthreshold);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
    const detector = container.get<TickerThresholdDetector>(TYPES.TickerThresholdDetector);

    const objective = await prisma.tickerThresholdObjective.findFirst({ where: { id: flags.objectiveId } });
    if (!objective) {
      throw new RevereError(`objective not found, id: ${flags.objectiveId}`);
    }

    await detector.detect(notifiers, objective);

    this.exit(0);
  }
}
