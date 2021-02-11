import { Cmp, PrismaClient, TickerThresholdData, TickerThresholdObjective } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { YFinanceApi, YFinanceApiInfoResponse } from '../apis';
import { RevereError } from '../errors';
import { $messages, $notifiers } from '../helpers';
import { TYPES } from '../inversify.constants';
import { Notifier } from '../notifiers';
import { logger } from '../util';

@injectable()
export class TickerThresholdDetector {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.YFinanceApi) private api: YFinanceApi
  ) {}

  async detect(notifiers: Notifier[], objective: TickerThresholdObjective): Promise<void> {
    const data = await this.getData(objective);
    if (this.isThresholdExceeded(objective, data)) {
      await $notifiers.notifyAll(notifiers, $messages.createTickerThresholdMessage({ objective, data }));
    } else {
      logger.info(
        `no exceedance detected for objective ${objective.name}, retrieved value for '${objective.field}': ${data.value}`
      );
    }
  }

  private async getData(objective: TickerThresholdObjective): Promise<TickerThresholdData> {
    const info = await this.api.getInfo(objective.symbol);
    const value = info[objective.field as keyof YFinanceApiInfoResponse];
    if (typeof value !== 'number') {
      throw new RevereError(`could not get number for field ${objective.field}, got: ${value}`);
    }
    return await this.prisma.tickerThresholdData.create({
      data: { recordedAt: new Date(), value, tickerThresholdObjectiveId: objective.id },
    });
  }

  private isThresholdExceeded(objective: TickerThresholdObjective, data: TickerThresholdData): boolean {
    switch (objective.cmp) {
      case Cmp.LT:
        return data.value < objective.threshold;
      case Cmp.LTEQ:
        return data.value <= objective.threshold;
      case Cmp.EQ:
        return data.value === objective.threshold;
      case Cmp.GTEQ:
        return data.value >= objective.threshold;
      case Cmp.GT:
        return data.value > objective.threshold;
      default:
        throw new RevereError(
          `unrecognized comparison word ${objective.cmp}, can't compare threshold ${objective.threshold} and value ${value}`
        );
    }
  }
}
