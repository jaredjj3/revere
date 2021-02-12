import { CommandRun, CommandRunStatus, TickerThresholdData, TickerThresholdObjective } from '@prisma/client';
import { $cmp, $colors, $formats } from '.';
import { YFinanceApiInfoResponse, YFinanceApiInfoResponseKeys } from '../apis';
import { ComplexField, ComplexMessage, Message, MessageByType, MessageType, Severity } from '../messages';

export const isMessageType = <T extends MessageType>(message: Message, type: T): message is MessageByType[T] => {
  return message.type === type;
};

export const simple = (attrs?: Partial<Message>): Message => {
  return {
    type: MessageType.Unknown,
    description: '',
    severity: Severity.Info,
    timestamp: new Date(),
    ...attrs,
  };
};

export const complex = (attrs: Partial<ComplexMessage> & Pick<ComplexMessage, 'title'>): ComplexMessage => {
  return { ...simple(), type: MessageType.Complex, fields: [], ...attrs };
};

export const stdout = (content: string): ComplexMessage => {
  return complex({ description: content });
};

export const squoze = (header: string): ComplexMessage => {
  return complex({
    title: 'NEW SQUOZE HEADER',
    description: header,
  });
};

export const yfinanceInfo = (info: YFinanceApiInfoResponse, keys: YFinanceApiInfoResponseKeys[]): ComplexMessage => {
  const fields = keys.map<ComplexField>((key) => {
    const name = key;
    const value = $formats.yfinanceInfoField(key, info[key]);
    return { name, value, inline: true };
  });

  return complex({
    title: `${info.longName} (${info.symbol})`,
    description: info.industry,
    url: info.website,
    image: info.logo_url,
    fields,
  });
};

export const help = (run: CommandRun): ComplexMessage => {
  const lines = new Array<string>();

  if (run.stdout) {
    lines.push(run.stdout);
  }
  if (run.stderr) {
    lines.push(run.stderr);
  }

  const description = lines.length > 0 ? $formats.codeBlock(lines.join('\n')) : undefined;

  return complex({
    title: 'HELP',
    description,
  });
};

export const commandRun = (run: CommandRun): ComplexMessage => {
  const description = `${run.endedAt.getTime() - run.startedAt.getTime()} ms`;

  let color: string;
  switch (run.status) {
    case CommandRunStatus.SUCCESS:
      color = $colors.GREEN;
      break;
    case CommandRunStatus.ERROR:
      color = $colors.RED;
      break;
    default:
      color = $colors.YELLOW;
  }

  const fields = new Array<ComplexField>();
  if (run.command) {
    fields.push({ name: 'command', value: $formats.codeBlock(run.command) });
  }
  if (run.stdout) {
    fields.push({ name: 'stdout', value: $formats.codeBlock(run.stdout) });
  }
  if (run.stderr) {
    fields.push({ name: 'stderr', value: $formats.codeBlock(run.stderr) });
  }

  return complex({
    title: `COMMAND RUN ${run.id} (${run.status})`,
    description,
    color,
    fields,
  });
};

export const tickerThreshold = (
  objective: TickerThresholdObjective,
  data: TickerThresholdData,
  info: YFinanceApiInfoResponse
): ComplexMessage => {
  const field = objective.field as YFinanceApiInfoResponseKeys;

  const lines = new Array<string>();

  lines.push(info.industry);
  lines.push('');

  if (objective.message) {
    if (objective.author) {
      lines.push($formats.italic(`from ${objective.author}:`));
    }
    lines.push($formats.mdQuote(objective.message));
    lines.push('');
  }

  return complex({
    title: `${info.longName} (${info.symbol})`,
    description: lines.join('\n'),
    url: info.website,
    color: $colors.GREEN,
    image: info.logo_url,
    fields: [
      {
        name: objective.field,
        value: $formats.yfinanceInfoField(field, data.value),
      },
    ],
    footer: `trigger conditions on field '${field}': ${$formats.yfinanceInfoField(
      field,
      data.value
    )} ${$cmp.toMathSymbol(objective.cmp)} ${$formats.yfinanceInfoField(field, objective.threshold)}`,
  });
};
