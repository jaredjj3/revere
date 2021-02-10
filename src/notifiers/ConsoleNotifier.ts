/* eslint-disable no-case-declarations */
import { injectable } from 'inversify';
import { $messages } from '../helpers';
import { CommandRunMessage, HelpMessage, Message, MessageType } from '../messages';
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
    if ($messages.isMessageType(message, MessageType.CommandRun)) {
      this.logCommandRunMessage(message);
    } else if ($messages.isMessageType(message, MessageType.Help)) {
      this.logHelpMessage(message);
    } else {
      this.logNoneMessage(message);
    }
  }

  private logHeader(message: Message): void {
    logger.info(`${message.type} MESSAGE START===================`);
  }

  private logFooter(message: Message): void {
    logger.info(`${message.type} MESSAGE END=====================`);
  }

  private logNoneMessage(message: Message): void {
    this.logHeader(message);
    logger.info(message.content);
    logger.debug(JSON.stringify(message, null, 2));
    this.logFooter(message);
  }

  private logCommandRunMessage(message: CommandRunMessage): void {
    const { commandRun } = message;
    this.logHeader(message);
    logger.info(`id: ${commandRun.id}`);
    logger.info(`ran command: '${commandRun.command}'`);
    logger.info(`status: ${commandRun.status}`);
    logger.info(`time elapsed: ${commandRun.endedAt.getTime() - commandRun.startedAt.getTime()} ms`);
    const tabInward = (str: string) => {
      return str
        .split('\n')
        .map((line) => `\t${line}`)
        .join('\n');
    };
    if (commandRun.stdout) {
      this.logEmptySpace();
      console.log('stdout:');
      console.log(tabInward(commandRun.stdout));
    }
    if (commandRun.stderr) {
      this.logEmptySpace();
      console.log('stderr:');
      console.log(tabInward(commandRun.stderr));
    }
    this.logFooter(message);
  }

  private logHelpMessage(message: HelpMessage): void {
    const { commandRun } = message;
    // avoid the log level prefix
    if (commandRun.stdout) {
      console.log(commandRun.stdout);
    }
    if (commandRun.stderr) {
      console.log(commandRun.stderr);
    }
  }
}
