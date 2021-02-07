// organize-imports-ignore
import { PrismaClient } from '@prisma/client';
import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import { Container } from 'inversify';
import 'reflect-metadata';
import { YFinanceApi } from './apis';
import { Detector, SquozeDetector } from './detectors';
import { DiscordClientProvider } from './discord';
import { NAMES, TYPES } from './inversify.constants';
import { ConsoleListener, DiscordListener, Listener } from './listeners';
import { ConsoleNotifier, DiscordNotifier, Notifier } from './notifiers';
import { CommandRunner } from './runners';
import { JobRunner } from './runners/JobRunner';
import { env, onExit } from './util';

dotenv.config();

export const container = new Container();

container.bind<Discord.Client>(TYPES.DiscordClient).toConstantValue(new Discord.Client());
container.bind<DiscordClientProvider>(TYPES.DiscordClientProvider).toProvider<Discord.Client>((ctx) => async () => {
  const client = ctx.container.get<Discord.Client>(TYPES.DiscordClient);
  if (!client.readyAt) {
    const login = client.login(env('DISCORD_BOT_TOKEN'));
    const ready = new Promise<void>((resolve) => client.on('ready', resolve));
    await Promise.all([login, ready]);
  }
  return client;
});

const prisma = new PrismaClient();
onExit(prisma.$disconnect);
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);

container.bind<Detector>(TYPES.Detector).to(SquozeDetector).whenTargetNamed(NAMES.squoze);

container.bind<Notifier>(TYPES.Notifier).to(ConsoleNotifier).whenTargetNamed(NAMES.console);
container.bind<Notifier>(TYPES.Notifier).to(DiscordNotifier).whenTargetNamed(NAMES.discord);

container.bind<Listener>(TYPES.Listener).to(DiscordListener).whenTargetNamed(NAMES.discord);
container.bind<Listener>(TYPES.Listener).to(ConsoleListener).whenTargetNamed(NAMES.console);

container.bind<CommandRunner>(TYPES.CommandRunner).to(CommandRunner);
container.bind<JobRunner>(TYPES.JobRunner).to(JobRunner).inSingletonScope();

container.bind<YFinanceApi>(TYPES.YFinanceApi).to(YFinanceApi);
