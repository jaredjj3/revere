import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { Message, MessageType } from '../messages';
import { env } from '../util';
import { Notifier } from './types';

@injectable()
export class DiscordNotifier implements Notifier {
  client = new Discord.Client();
  isReady = false;

  async notify(message: Message): Promise<void> {
    await this.ready();
    const formatted = this.format(message);
    // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
    const channel = await this.getChannel();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (channel as any).send(formatted);
  }

  private async getChannel(): Promise<Discord.Channel> {
    const channelId = env('CHANNEL_ID');
    return await this.client.channels.fetch(channelId);
  }

  private async ready(): Promise<void> {
    if (this.isReady) {
      return;
    }

    const readyPromise = new Promise<void>((resolve) => {
      this.client.on('ready', () => {
        this.isReady = true;
        resolve();
      });
    });

    const botToken = env('BOT_TOKEN');
    const loginPromise = this.client.login(botToken);

    await Promise.all([readyPromise, loginPromise]);
  }

  private format(message: Message): Discord.MessageEmbed | string {
    switch (message.type) {
      case MessageType.None:
        return message.content;
      case MessageType.Squoze:
        return new Discord.MessageEmbed()
          .setTitle(`SQUOZE ALERT`)
          .setURL('https://isthesqueezesquoze.com')
          .setDescription(`${message.detectedAt}\n\n${message.content}`);
      case MessageType.Stdout:
        return '```' + message.content + '```';
      default:
        return message.content;
    }
  }
}
