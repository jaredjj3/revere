import { TickerThresholdObjective } from '@prisma/client';
import { injectable } from 'inversify';
import { Notifier } from '../notifiers';

@injectable()
export class TickerThresholdDetector {
  async detect(notifiers: Notifier[], objective: TickerThresholdObjective): Promise<void> {
    // placeholder
  }

  async getField(field: string) {
    // placeholder
  }
}
