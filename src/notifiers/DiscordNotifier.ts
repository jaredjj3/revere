import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { Message } from '../messages';
import { Env, env } from '../util';
import { Notifier } from './types';

@injectable()
export class DiscordNotifier implements Notifier {
  client = new Discord.Client();
  isReady = false;

  async notify(message: Message): Promise<void> {
    await this.ready();
    const channel = await this.getChannel();
    const embed = new Discord.MessageEmbed()
      .setTitle(`${message.type.toUpperCase()} ALERT`)
      .setURL('https://isthesqueezesquoze.com')
      .setColor('#ff0000')
      .setDescription(`${message.detectedAt}\n\n${message.content}`);
    // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (channel as any).send(embed);
  }

  private async getChannel(): Promise<Discord.Channel> {
    const channelId = env(Env.CHANNEL_ID);
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

    const botToken = env(Env.BOT_TOKEN);
    const loginPromise = this.client.login(botToken);

    await Promise.all([readyPromise, loginPromise]);
  }
}
