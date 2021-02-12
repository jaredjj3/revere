import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class Tickthresh extends ExitImmediatelyCommand {
  static description = 'create a ticker threshold';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    type: flags.enum({ options: ['TICKER_THRESHOLD'], default: 'TICKER_THRESHOLD' }),
    symbol: flags.string({ char: 's', required: true }),
    field: flags.string({ char: 'f', required: true }),
    lower: flags.string({ char: 'l', required: true }),
    upper: flags.string({ char: 'u', required: true }),
    message: flags.string({ char: 'm', multiple: true }),
    cronExpression: flags.string({ char: 'c', multiple: true, default: ['*/5', '0,21,8-17', '*', '*', '1-5'] }),
    numNotifications: flags.integer({ char: 'n', default: 1 }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Tickthresh);

    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);

    // TickThresholdObjective props
    const symbol = flags.symbol;
    const field = flags.field;
    const lowerBound = parseFloat(flags.lower);
    const upperBound = parseFloat(flags.upper);
    const message = flags.message.join(' ');
    const numNotifications = flags.numNotifications;

    const objective = await prisma.tickerThresholdObjective.create({
      data: { symbol, field, lowerBound, upperBound, message, numNotifications },
    });

    // Job props
    const name = `${symbol}_${field}_LOWER:${lowerBound}_UPPER:${upperBound}`;
    const command = `detect:tickerthreshold --objectiveId ${objective.id}`;
    const cronExpression = flags.cronExpression.join(' ');

    const job = await prisma.job.create({ data: { name, command, cronExpression, active: true } });

    await prisma.tickerThresholdObjective.update({ where: { id: objective.id }, data: { jobId: job.id } });

    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(
      notifiers,
      $messages.simple({ description: `created ticker threshold objective ${objective.id}, job '${job.name}'` })
    );
  }
}
