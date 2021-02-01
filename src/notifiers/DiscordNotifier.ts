import Discord from 'discord.js';
import { MissingEnvError } from '../errors';
import { Message } from '../messages';
import { Notifier } from './types';

export class DiscordNotifier implements Notifier {
  client = new Discord.Client();
  isReady = false;

  async notify(message: Message): Promise<void> {
    await this.ready();
    const channel = await this.getChannel();
    // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
    const embed = new Discord.MessageEmbed()
      .setTitle(`${message.type.toUpperCase()} ALERT`)
      .setURL('https://isthesqueezesquoze.com')
      .setColor('#ff0000')
      .setDescription(`${message.detectedAt}\n\n${message.content}`);
    await (channel as any).send(embed);
  }

  private async getChannel(): Promise<Discord.Channel> {
    if (!process.env.CHANNEL_ID) {
      throw new MissingEnvError('missing env: CHANNEL_ID');
    }
    return await this.client.channels.fetch(process.env.CHANNEL_ID);
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
    if (!process.env.CHANNEL_ID) {
      throw new MissingEnvError('missing env: BOT_TOKEN');
    }
    const loginPromise = this.client.login(process.env.BOT_TOKEN);
    await Promise.all([readyPromise, loginPromise]);
  }
}
