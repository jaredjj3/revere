import { injectable } from 'inversify';
import { Message } from '../messages';
import { logger } from '../util';
import { Notifier } from './types';

@injectable()
export class ConsoleNotifier implements Notifier {
  async notify(...messages: Message[]): Promise<void> {
    for (const message of messages) {
      logger.info(message.type);
      logger.info(message.content);
    }
  }
}
