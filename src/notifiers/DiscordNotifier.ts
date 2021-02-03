import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { DiscordClientProvider } from '../discord';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.types';
import { Message, MessageType } from '../messages';
import { env } from '../util';
import { Notifier } from './types';

@injectable()
export class DiscordNotifier implements Notifier {
  isReady = false;

  // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
  async notify(message: Message): Promise<void> {
    if (!message.content) {
      console.error(`received message with empty content, skipping: ${message} `);
      return;
    }

    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();

    const channelId = env('CHANNEL_ID');
    const channel = await client.channels.fetch(channelId);
    const formatted = this.format(message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (channel as any).send(formatted);
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
