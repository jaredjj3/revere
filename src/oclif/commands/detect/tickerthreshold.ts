import { flags } from '@oclif/command';
import { CommandRunSrc, PrismaClient } from '@prisma/client';
import { TickerThresholdDetector } from '../../../detectors';
import { RevereError } from '../../../errors';
import { $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { env } from '../../../util';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

// when the job is spawned from a JOB context, we want to deduct the numNotifications
// field on an objective
const CMD_INPUT_SRC = env('CMD_INPUT_SRC').toUpperCase();
const DEFAULT_DEDUCT = CMD_INPUT_SRC === CommandRunSrc.JOB;
const DEFAULT_NOTIFICATION_OVERRIDE = CMD_INPUT_SRC !== CommandRunSrc.JOB;

export default class Tickerthreshold extends ExitImmediatelyCommand {
  static description = 'runs specified detectors and notifiers';

  static flags = {
    help: flags.help({ char: 'h' }),
    objectiveId: flags.integer({ required: true }),
    notifiers: $flags.notifiers(),
    deduct: flags.boolean({ default: () => DEFAULT_DEDUCT }),
    notificationOverride: flags.boolean({ default: () => DEFAULT_NOTIFICATION_OVERRIDE, allowNo: true }),
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

    if (objective.numNotifications < 1) {
      console.warn(`objective has no more numNotifications`);
      if (!flags.notificationOverride) {
        throw new RevereError(`notification override not active, set the --notificationOverride flag`);
      }
    }

    const message = await detector.detect(objective);
    if (message) {
      await $notifiers.notifyAll(notifiers, message);
      if (flags.deduct && objective.numNotifications > 0) {
        await prisma.tickerThresholdObjective.update({
          where: { id: objective.id },
          data: { numNotifications: objective.numNotifications - 1 },
        });
      }
    }
  }
}
