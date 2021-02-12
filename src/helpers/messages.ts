import { CommandRun, CommandRunStatus, Job, TickerThresholdData, TickerThresholdObjective } from '@prisma/client';
import cronstrue from 'cronstrue';
import { YFinanceApiInfoResponse, YFinanceApiInfoResponseKeys } from '../apis';
import {
  ComplexField,
  ComplexMessage,
  Message,
  MessageByType,
  MessageType,
  Severity,
  SimpleMessage,
} from '../messages';
import * as $colors from './colors';
import * as $formats from './formats';

export const isMessageType = <T extends MessageType>(message: Message, type: T): message is MessageByType[T] => {
  return message.type === type;
};

export const simple = (attrs?: Partial<SimpleMessage>): SimpleMessage => {
  return {
    type: MessageType.Simple,
    description: '',
    severity: Severity.Info,
    timestamp: new Date(),
    ...attrs,
  };
};

export const complex = (attrs: Partial<ComplexMessage> & Pick<ComplexMessage, 'title'>): ComplexMessage => {
  return { ...simple(), type: MessageType.Complex, fields: [], ...attrs };
};

export const stdout = (content: string): SimpleMessage => {
  return simple({ description: $formats.mdCodeBlock(content) });
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

  const description = lines.length > 0 ? $formats.mdCodeBlock(lines.join('\n')) : undefined;

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
    fields.push({ name: 'command', value: $formats.mdCodeBlock(run.command) });
  }
  if (run.stdout) {
    fields.push({ name: 'stdout', value: $formats.mdCodeBlock(run.stdout) });
  }
  if (run.stderr) {
    fields.push({ name: 'stderr', value: $formats.mdCodeBlock(run.stderr) });
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
      lines.push($formats.mdItalic(`from ${objective.author}:`));
    }
    lines.push($formats.mdQuote(objective.message));
    lines.push('');
  }

  const lowerBound =
    typeof objective.lowerBound === 'number' ? $formats.yfinanceInfoField(field, objective.lowerBound) : null;
  const current = $formats.yfinanceInfoField(field, data.value);
  const upperBound =
    typeof objective.upperBound === 'number' ? $formats.yfinanceInfoField(field, objective.upperBound) : null;

  const expressions = new Array<string>();
  if (lowerBound && lowerBound > current) {
    expressions.push(`${lowerBound} > ${current}`);
  }
  if (upperBound && current > upperBound) {
    expressions.push(`${current} > ${upperBound}`);
  }
  const conditions = expressions.length === 0 ? 'UNKNOWN' : expressions.join(' OR ');

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
    footer: `trigger conditions on field '${field}': ${conditions}`,
  });
};

export const job = (job: Job): ComplexMessage => {
  const activeStr = job.active ? 'ACTIVE' : 'INACTIVE';
  const color = job.active ? $colors.GREEN : $colors.YELLOW;

  return complex({
    title: `${job.name} (${activeStr})`,
    description: job.description || '',
    color,
    fields: [
      { name: 'created at', value: job.createdAt.toISOString(), inline: false },
      { name: 'updated at', value: job.updatedAt.toISOString(), inline: false },
      { name: 'command', value: $formats.mdInlineCodeBlock(job.command), inline: false },
      { name: 'cron', value: $formats.mdInlineCodeBlock(job.cronExpression), inline: false },
      { name: 'cron translation', value: cronstrue.toString(job.cronExpression), inline: false },
    ],
    footer: `id ${job.id}`,
  });
};
