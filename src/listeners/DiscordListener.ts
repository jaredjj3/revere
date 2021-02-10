import { CallerType, CommandRunSrc, CommandRunStatus } from '@prisma/client';
import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { DiscordClientProvider } from '../discord';
import { $messages, $notifiers } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { Notifier } from '../notifiers';
import { HELP_EXIT_CODE } from '../oclif/constants';
import { CommandRunner } from '../runners';
import { env, logger, toInlineCodeStr } from '../util';
import { Listener } from './types';

const COMMAND_PREFIXES = ['!revere', '!r', '!rd', '!rdebug', '!reveredebug'];
const COMMAND_DEBUG_PREFIXES = ['!rdebug', '!rd', '!reveredebug'];

@injectable()
export class DiscordListener implements Listener {
  async listen(notifiers: Notifier[]): Promise<void> {
    const client = await this.getClient();
    client.on('message', this.onMessage(notifiers));
  }

  async getClient(): Promise<Discord.Client> {
    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();
    return client;
  }

  onMessage = (notifiers: Notifier[]) => async (message: Discord.Message): Promise<void> => {
    const client = await this.getClient();
    const userInput = message.content;
    const argv = this.getArgv(userInput);

    if (message.author.id === client.user?.id) {
      logger.debug('skipped own message');
      return;
    }
    if (!this.isCommand(argv)) {
      logger.debug('skipped non-command');
      return;
    }
    if (message.channel.id !== env('DISCORD_CHANNEL_ID')) {
      logger.debug(`skipped message for another channel: ${message.channel.id}`);
      return;
    }

    const commandRunner = container.get<CommandRunner>(TYPES.CommandRunner);
    const debug = COMMAND_DEBUG_PREFIXES.includes(argv[0]);

    logger.info(`received commandStr from discord: ${userInput}`);

    try {
      const commandRun = await commandRunner.run(argv.slice(1), {
        src: CommandRunSrc.DISCORD,
        callerType: message.author.bot ? CallerType.COMPUTER : CallerType.HUMAN,
        callerId: message.author.username,
      });
      if (commandRun.exitCode === HELP_EXIT_CODE) {
        await $notifiers.notifyAll(notifiers, $messages.createHelpMessage({ commandRun }));
      } else if (debug || commandRun.status !== CommandRunStatus.SUCCESS) {
        await $notifiers.notifyAll(notifiers, $messages.createCommandRunMessage({ commandRun }));
      }
    } catch (err) {
      logger.error(err);
      await $notifiers.notifyAll(
        notifiers,
        $messages.createMessage({
          content: `unsuccessfully ran: ${toInlineCodeStr(userInput)}\nerror message: ${err.message}`,
        })
      );
    }
  };

  private isCommand(argv: string[]): boolean {
    return COMMAND_PREFIXES.some((prefix) => argv[0] === prefix);
  }

  private getArgv(str: string): string[] {
    const trimmed = str.trim();
    const splitted = trimmed.split(' ');
    return splitted;
  }
}
