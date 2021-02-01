import { Notifier } from './types';

export class ConsoleNotifier implements Notifier {
  async notify(message: string): Promise<void> {
    console.log(`\nSTART MESSAGE=======================\n${message}\nEND MESSAGE=======================\n`);
  }
}
