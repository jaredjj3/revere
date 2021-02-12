import { injectable } from 'inversify';
import { isObject, times } from 'lodash';
import { Message } from '../messages';
import { Notifier } from './types';

// console.log is used instead of logger.info to make it easier to read

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
    console.log(`${message.type} MESSAGE START===================`);
    for (const [key, val] of Object.entries(message)) {
      if (isObject(val)) {
        console.log(`${key}:`);
        this.logProps(val);
      } else {
        console.log(`${key}: ${val}`);
      }
    }
    console.log(`${message.type} MESSAGE END=====================`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logProps(thing: any, depth = 1): void {
    const spaces = times(depth, () => '  ').join('');
    for (const [key, val] of Object.entries(thing)) {
      if (isObject(val)) {
        console.log(`${spaces}${key}:`);
        this.logProps(val, depth + 1);
      } else {
        let str = val;
        if (typeof val === 'string') {
          str = val
            .split('\n')
            .map((line, ndx) => (ndx === 0 ? line : `${spaces}  ${line}`))
            .join('\n');
        }
        console.log(`${spaces}${key}: ${str}`);
      }
    }
  }
}
