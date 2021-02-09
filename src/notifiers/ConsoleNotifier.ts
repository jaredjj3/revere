import { injectable } from 'inversify';
import { Message } from '../messages';
import { logger } from '../util';
import { Notifier } from './types';

@injectable()
export class ConsoleNotifier implements Notifier {
  async notify(...messages: Message[]): Promise<void> {
    for (const message of messages) {
      const alert = `${message.type.toUpperCase()} ALERT`;
      logger.info(
        `\nSTART ${alert}=======================\n${message.timestamp}\n${message.content}\nEND ${alert}=======================\n`
      );
    }
  }
}
