import { PrismaClient, TickerThresholdData, TickerThresholdObjective } from '@prisma/client';
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
    const lowerBound = typeof objective.lowerBound === 'number' ? objective.lowerBound : Number.NEGATIVE_INFINITY;
    const higherBound = typeof objective.upperBound === 'number' ? objective.upperBound : Number.POSITIVE_INFINITY;
    return lowerBound > data.value || data.value > higherBound;
  }
}
