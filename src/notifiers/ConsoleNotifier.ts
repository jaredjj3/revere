/* eslint-disable no-case-declarations */
import { injectable } from 'inversify';
import { isObject } from 'lodash';
import { Message } from '../messages';
import { logger } from '../util';
import { Notifier } from './types';

@injectable()
export class ConsoleNotifier implements Notifier {
  async notify(...messages: Message[]): Promise<void> {
    for (const message of messages) {
      this.logEmptySpace();
      this.log(message);
      this.logEmptySpace();
    }
  }

  private logEmptySpace(): void {
    console.log('');
  }

  private log(message: Message): void {
    logger.info(`${message.type} MESSAGE START===================`);
    for (const [key, val] of Object.entries(message)) {
      let str = val;
      if (isObject(val)) {
        str = JSON.stringify(val, null, 2);
      }
      logger.info(`${key}: ${str}`);
    }
    logger.info(`${message.type} MESSAGE END=====================`);
  }
}
