import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { isNull, isNumber } from 'lodash';
import * as cron from 'node-cron';
import { RevereError } from '../../../../errors';
import { $messages, $notifiers } from '../../../../helpers';
import { container } from '../../../../inversify.config';
import { TYPES } from '../../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../../ExitImmediatelyCommand';
import { $flags } from '../../../flags';

export default class Create extends ExitImmediatelyCommand {
  static description = 'create a ticker threshold';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    symbol: flags.string({ char: 's', required: true }),
    field: flags.string({ char: 'f', required: true }),
    lower: flags.string({ char: 'l' }),
    upper: flags.string({ char: 'u' }),
    message: flags.string({ char: 'm', multiple: true }),
    cronExpression: flags.string({ char: 'c', multiple: true, default: ['*/5', '0,21,8-17', '*', '*', '1-5'] }),
    numNotifications: flags.integer({ char: 'n', default: 1 }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Create);

    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);

    // props
    const symbol = flags.symbol;
    const field = flags.field;
    const lowerBound = flags.lower ? parseFloat(flags.lower) : null;
    const upperBound = flags.upper ? parseFloat(flags.upper) : null;
    const message = flags.message.join(' ') || null;
    const numNotifications = flags.numNotifications;
    const cronExpression = flags.cronExpression.join(' ');

    // validate props
    if (isNumber(lowerBound) && lowerBound < 0) {
      throw new RevereError('--lower must be greater than 0');
    }
    if (isNumber(upperBound) && upperBound < 0) {
      throw new RevereError('--upper must be greater than 0');
    }
    if (isNumber(lowerBound) && isNumber(upperBound) && lowerBound > upperBound) {
      throw new RevereError('--lower must be less than or equal to --upper');
    }
    if (!isNull(lowerBound) && !isNull(upperBound)) {
      throw new RevereError(`must specify at least one of: --lower, --upper`);
    }
    if (numNotifications < 0) {
      throw new RevereError('--numNotifications must be greater than 0');
    }
    if (!cron.validate(cronExpression)) {
      throw new RevereError(
        'invalid cron expression, try using the `cronstr` command or visiting https://crontab.guru'
      );
    }

    const objective = await prisma.tickerThresholdObjective.create({
      data: { symbol, field, lowerBound, upperBound, message, numNotifications },
    });

    // derived props
    const now = new Date();
    const name = `${symbol}_${field}_${now.toISOString().replace(/\D/g, '')};`;
    const description = `created by revere: check to see if ${symbol}'s ${field} goes under ${lowerBound} or above ${upperBound}`;
    const command = `detect:tickerthreshold --objectiveId ${objective.id}`;

    const job = await prisma.job.create({ data: { name, command, cronExpression, description, active: true } });

    await prisma.tickerThresholdObjective.update({ where: { id: objective.id }, data: { jobId: job.id } });

    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(
      notifiers,
      $messages.simple({ description: `created ticker threshold objective ${objective.id}, job '${job.name}'` })
    );
  }
}
