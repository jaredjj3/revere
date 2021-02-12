import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { DiscordClientProvider } from '../discord';
import { $messages, $util } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { ComplexMessage, Message, MessageType } from '../messages';
import { Notifier } from './types';

type FormattedMessage = Discord.MessageEmbed | string;

@injectable()
export class DiscordNotifier implements Notifier {
  isReady = false;

  // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
  async notify(...messages: Message[]): Promise<void> {
    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();

    const channelId = $util.env('DISCORD_CHANNEL_ID');
    const channel = await client.channels.fetch(channelId);
    const formattedMessages = messages.map((message) => this.format(message));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await Promise.all(formattedMessages.map((formattedMessage) => (channel as any).send(formattedMessage)));
  }

  private format(message: Message): FormattedMessage {
    if ($messages.isMessageType(message, MessageType.Complex)) {
      return this.formatComplex(message);
    } else {
      return this.formatSimple(message);
    }
  }

  private formatSimple(message: Message): FormattedMessage {
    return message.description;
  }

  private formatComplex(message: ComplexMessage): FormattedMessage {
    const messageEmbed = new Discord.MessageEmbed();

    messageEmbed.setDescription(message.description);

    messageEmbed.addFields(message.fields);

    if (message.title) {
      messageEmbed.setTitle(message.title);
    }
    if (message.author) {
      messageEmbed.setAuthor(message.author);
    }
    if (message.color) {
      messageEmbed.setColor(message.color);
    }
    if (message.footer) {
      messageEmbed.setFooter(message.footer);
    }
    if (message.url) {
      messageEmbed.setURL(message.url);
    }
    if (message.image) {
      messageEmbed.setImage(message.image);
    }
    if (message.timestamp) {
      messageEmbed.setTimestamp(message.timestamp);
    }

    return messageEmbed;
  }
}
