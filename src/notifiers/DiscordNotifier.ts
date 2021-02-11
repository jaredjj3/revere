import { CommandRunStatus } from '@prisma/client';
import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { difference } from 'lodash';
import { YFinanceApiInfoResponse, YFinanceApiInfoResponseKeys } from '../apis';
import { DiscordClientProvider } from '../discord';
import { $cmp, $formats, $messages } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import {
  CommandRunMessage,
  HelpMessage,
  Message,
  MessageType,
  SquozeMessage,
  StdoutMessage,
  TickerThresholdMessage,
  YFinanceInfoMessage,
} from '../messages';
import { env, toCodeBlockStr } from '../util';
import { Notifier } from './types';

type FormattedMessage = Discord.MessageEmbed | string;

@injectable()
export class DiscordNotifier implements Notifier {
  isReady = false;

  // https://discordjs.guide/popular-topics/faq.html#how-do-i-send-a-message-to-a-specific-channel
  async notify(...messages: Message[]): Promise<void> {
    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();

    const channelId = env('DISCORD_CHANNEL_ID');
    const channel = await client.channels.fetch(channelId);
    const formattedMessages = messages.map((message) => this.format(message));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await Promise.all(formattedMessages.map((formattedMessage) => (channel as any).send(formattedMessage)));
  }

  private format(message: Message): FormattedMessage {
    if ($messages.isMessageType(message, MessageType.Squoze)) {
      return this.formatSquozeMessage(message);
    } else if ($messages.isMessageType(message, MessageType.Stdout)) {
      return this.formatStdoutMessage(message);
    } else if ($messages.isMessageType(message, MessageType.YFinanceInfo)) {
      return this.formatYfinanceInfoMessage(message);
    } else if ($messages.isMessageType(message, MessageType.Help)) {
      return this.formatHelpMessage(message);
    } else if ($messages.isMessageType(message, MessageType.CommandRun)) {
      return this.formatCommandRunMessage(message);
    } else if ($messages.isMessageType(message, MessageType.TickerThreshold)) {
      return this.formatTickerThresholdMessage(message);
    } else {
      return this.formatNoneMessage(message);
    }
  }

  private formatNoneMessage(message: Message): FormattedMessage {
    return message.content;
  }

  private formatSquozeMessage(message: SquozeMessage): FormattedMessage {
    return new Discord.MessageEmbed()
      .setTitle(`SQUOZE ALERT`)
      .setURL('https://isthesqueezesquoze.com')
      .setDescription(`${message.timestamp}\n\n${message.content}`);
  }

  private formatStdoutMessage(message: StdoutMessage): FormattedMessage {
    return toCodeBlockStr(message.content);
  }

  private formatYfinanceInfoMessage(message: YFinanceInfoMessage): FormattedMessage {
    const { data, fields } = message;
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle(`${data.longName} (${data.symbol})`)
      .setDescription(data.industry)
      .setURL(data.website)
      .setImage(data.logo_url);

    const baseFields = new Array<YFinanceApiInfoResponseKeys>('bid', 'ask', 'averageVolume', 'marketCap', 'shortRatio');
    const extraFields = difference(fields, baseFields);
    for (const field of [...baseFields, ...extraFields]) {
      const value = $formats.yfinanceInfoField(field, data[field]);
      messageEmbed.addField(field, value, true);
    }

    return messageEmbed;
  }

  private formatHelpMessage(message: HelpMessage): FormattedMessage {
    return new Discord.MessageEmbed().setTitle('Help').setDescription(toCodeBlockStr(message.commandRun.stdout));
  }

  private formatCommandRunMessage(message: CommandRunMessage): FormattedMessage {
    const { commandRun } = message;
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle(`COMMAND RUN ${commandRun.id} (${commandRun.status})`)
      .setDescription(`${commandRun.endedAt.getTime() - commandRun.startedAt.getTime()} ms`);
    if (commandRun.command) {
      messageEmbed.addField('command', toCodeBlockStr(commandRun.command));
    }
    if (commandRun.stdout) {
      messageEmbed.addField('stdout', toCodeBlockStr(commandRun.stdout));
    }
    if (commandRun.stderr) {
      messageEmbed.addField('stderr', toCodeBlockStr(commandRun.stderr));
    }
    switch (commandRun.status) {
      case CommandRunStatus.SUCCESS:
        messageEmbed.setColor('#238823');
        break;
      case CommandRunStatus.ERROR:
        messageEmbed.setColor('#d2222d');
        break;
      default:
        messageEmbed.setColor('#ffbf00');
    }
    return messageEmbed;
  }

  private formatTickerThresholdMessage(message: TickerThresholdMessage): FormattedMessage {
    const { objective, data } = message;
    const info = data.meta as Partial<YFinanceApiInfoResponse> | null;

    const longName = info?.longName;
    const symbol = info?.symbol || objective.symbol.toUpperCase();
    const industry = info?.industry;
    const logoUrl = info?.logo_url;
    const website = info?.website;

    const messageEmbed = new Discord.MessageEmbed();

    messageEmbed.setColor('#238823');

    if (longName) {
      messageEmbed.setTitle(`${longName} (${symbol})`);
    } else {
      messageEmbed.setTitle(`(${symbol})`);
    }

    if (logoUrl) {
      messageEmbed.setImage(logoUrl);
    }

    if (website) {
      messageEmbed.setURL(website);
    }

    const lines = new Array<string>();
    if (industry) {
      lines.push(industry);
      lines.push('');
    }

    if (objective.message) {
      if (objective.author) {
        lines.push(`_message from ${objective.author}:_`);
      } else {
        lines.push('_message:_');
      }
      lines.push(objective.message);
      lines.push('');
    }

    lines.push('_trigger conditions:_');
    messageEmbed.setDescription(lines.join('\n'));

    const field = objective.field as YFinanceApiInfoResponseKeys;
    messageEmbed.addField(`current ${objective.field}`, $formats.yfinanceInfoField(field, data.value), true);
    messageEmbed.addField(`cmp`, $cmp.toMathSymbol(objective.cmp), true);
    messageEmbed.addField(`threshold ${objective.field}`, $formats.yfinanceInfoField(field, objective.threshold), true);

    return messageEmbed;
  }
}
