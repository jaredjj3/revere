import { Message } from '../messages';
import { Notifier } from './types';

export class ConsoleNotifier implements Notifier {
  async notify(message: Message): Promise<void> {
    const alert = `${message.type.toUpperCase()} ALERT`;
    console.log(
      `\nSTART ${alert}=======================\n${message.detectedAt}\n${message.content}\nEND ${alert}=======================\n`
    );
  }
}