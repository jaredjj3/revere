import { CommandRunSrc } from '@prisma/client';
import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { DiscordClientProvider } from '../discord';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { DiscordNotifier, Notifier } from '../notifiers';
import { CommandRunner } from '../runners';
import { env, notify } from '../util';
import { Listener } from './types';

const COMMAND_PREFIXES = ['!revere', '!r'];

@injectable()
export class DiscordListener implements Listener {
  private isExiting = false;

  async listen(notifiers: Notifier[]): Promise<void> {
    const client = await this.getClient();
    client.on('message', this.onMessage(notifiers));
    process.on('SIGTERM', this.onExit(notifiers));
    process.on('SIGINT', this.onExit(notifiers));
    this.onEnter(notifiers);
  }

  async onEnter(notifiers: Notifier[]): Promise<void> {
    const discordNotifiers = notifiers.filter((notifier) => notifier instanceof DiscordNotifier);
    const commandPrefixes = COMMAND_PREFIXES.join(', ');
    await notify(
      discordNotifiers,
      `Listening to Discord, you can type any of the following to issue a command: ${commandPrefixes}`
    );
  }

  onExit = (notifiers: Notifier[]) => async (): Promise<void> => {
    if (this.isExiting) {
      return;
    }
    this.isExiting = true;
    await notify(notifiers, 'Farewell, Discord');
    process.exit(0);
  };

  async getClient(): Promise<Discord.Client> {
    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();
    return client;
  }

  onMessage = (notifiers: Notifier[]) => async (message: Discord.Message): Promise<void> => {
    const client = await this.getClient();

    if (message.author.id === client.user?.id) {
      console.debug('skipped own message');
      return;
    }
    if (!this.isCommand(message.content)) {
      console.debug('skipped non-command');
      return;
    }
    if (message.channel.id !== env('DISCORD_CHANNEL_ID')) {
      console.debug(`skipped message for another channel: ${message.channel.id}`);
      return;
    }

    const userInput = message.content;
    const commandRunner = container.get<CommandRunner>(TYPES.CommandRunner);

    try {
      console.log(`received commandStr from discord: ${userInput}`);

      const argv = this.getArgv(userInput);
      const commandRun = await commandRunner.run(argv, { src: CommandRunSrc.DISCORD });
      notify(
        notifiers,
        `successfully ran command: '${userInput}'\n\n${[commandRun.stdout, commandRun.stderr]
          .filter((str) => str.length > 0)
          .join('\n=======================\n')}`
      );
    } catch (err) {
      console.error(err);
      notify(notifiers, `unsuccessfully ran command: '${userInput}'\n\n${err.message}`);
    }
  };

  private isCommand(str: string): boolean {
    return COMMAND_PREFIXES.some((prefix) => str.startsWith(prefix));
  }

  private getArgv(str: string): string[] {
    const trimmed = str.trim();
    const splitted = trimmed.split(' ');
    const sliced = splitted.slice(1);
    return sliced;
  }
}
