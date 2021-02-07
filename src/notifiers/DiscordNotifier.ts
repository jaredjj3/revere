import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import * as numeral from 'numeral';
import { DiscordClientProvider } from '../discord';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { Message, MessageType, YFinanceInfoMessage } from '../messages';
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

    const channelId = env('DISCORD_CHANNEL_ID');
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
          .setDescription(`${message.timestamp}\n\n${message.content}`);
      case MessageType.Stdout:
        return '```' + message.content + '```';
      case MessageType.YfinInfo:
        // eslint-disable-next-line no-case-declarations
        const data = (message as YFinanceInfoMessage).data;
        return new Discord.MessageEmbed()
          .setTitle(`${data.longName} (${data.symbol})`)
          .setDescription(data.industry)
          .setURL(data.website)
          .setImage(data.logo_url)
          .addFields([
            { name: 'bid', value: numeral(data.bid).format('$0,0.00'), inline: true },
            { name: 'ask', value: numeral(data.ask).format('$0,0.00'), inline: true },
            { name: 'average volume', value: numeral(data.averageVolume).format('0,0'), inline: true },
            { name: 'market cap', value: numeral(data.marketCap).format('($ 0.00 a)'), inline: true },
            { name: 'short ratio', value: numeral(data.shortRatio).format('($ 0.00 a)'), inline: true },
          ]);
      default:
        return message.content;
    }
  }
}
