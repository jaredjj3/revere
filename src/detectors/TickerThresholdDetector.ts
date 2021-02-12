import { Cmp, PrismaClient, TickerThresholdData, TickerThresholdObjective } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { YFinanceApi, YFinanceApiInfoResponse } from '../apis';
import { RevereError } from '../errors';
import { $messages } from '../helpers';
import { TYPES } from '../inversify.constants';
import { logger } from '../logger';
import { Message } from '../messages';

@injectable()
export class TickerThresholdDetector {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.YFinanceApi) private api: YFinanceApi
  ) {}

  async detect(objective: TickerThresholdObjective): Promise<Message | void> {
    const data = await this.getData(objective);
    if (this.isThresholdExceeded(objective, data)) {
      return $messages.tickerThreshold(objective, data, data.meta as YFinanceApiInfoResponse);
    } else {
      logger.info(
        `no exceedance detected for objective ${objective.id}, retrieved value for '${objective.field}': ${data.value}`
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { recordedAt: new Date(), value, tickerThresholdObjectiveId: objective.id, meta: info as any },
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
          `unrecognized comparison word ${objective.cmp}, can't compare threshold ${objective.threshold} and value ${data.value}`
        );
    }
  }
}
