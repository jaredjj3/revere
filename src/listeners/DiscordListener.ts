import Discord from 'discord.js';
import { injectable, multiInject } from 'inversify';
import { Command } from '../commands';
import { RevereError } from '../errors';
import { TYPES } from '../inversify.types';
import { Env, env } from '../util';

const COMMAND_PREFIX = '!revere';

@injectable()
export class DiscordListener {
  private client = new Discord.Client();
  private isReady = false;

  constructor(@multiInject(TYPES.Command) private commands: Command[]) {}

  async waitForMessages(): Promise<void> {
    await this.ready();
    console.log('waiting for discord messages...');
  }

  private async onMessage(message: Discord.Message) {
    if (!this.isCommand(message.content)) {
      return;
    }

    console.log(`received discord command: '${message.content}'`);
    const [commandName, ...argv] = message.content.split(' ').slice(1);
    const command = this.getCommand(commandName);

    await message.reply(`running command: ${command.name}`);

    const args = command.parse(argv);
    try {
      await command.run(args);
    } catch (err) {
      console.error(err);
      await message.channel.send(`something went wrong running: '${message.content}'`);
    }
  }

  private getCommand(commandName: string): Command {
    const command = this.commands.find((command) => command.name === commandName);
    if (!command) {
      throw new RevereError(`could not find command for: ${commandName}`);
    }
    return command;
  }

  private async ready(): Promise<void> {
    if (this.isReady) {
      return;
    }

    this.client.on('message', async (message) => {
      await this.onMessage(message);
    });

    const readyPromise = new Promise<void>((resolve) => {
      this.client.on('ready', () => {
        this.isReady = true;
        resolve();
      });
    });

    const botToken = env(Env.BOT_TOKEN);
    const loginPromise = this.client.login(botToken);

    await Promise.all([readyPromise, loginPromise]);
  }

  private isCommand(str: string): boolean {
    return str.startsWith(COMMAND_PREFIX);
  }
}
