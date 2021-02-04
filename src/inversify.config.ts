import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import { Container } from 'inversify';
import 'reflect-metadata';
import { Detector, SquozeDetector } from './detectors';
import { DiscordClientProvider } from './discord';
import { TYPES } from './inversify.types';
import { Listener } from './listeners';
import { DiscordListener } from './listeners/DiscordListener';
import { ConsoleNotifier, DiscordNotifier, Notifier } from './notifiers';
import { env } from './util';

dotenv.config();

export const container = new Container();

container.bind<Discord.Client>(TYPES.DiscordClient).toConstantValue(new Discord.Client());
container.bind<DiscordClientProvider>(TYPES.DiscordClientProvider).toProvider<Discord.Client>((ctx) => async () => {
  const client = ctx.container.get<Discord.Client>(TYPES.DiscordClient);
  if (!client.readyAt) {
    const login = client.login(env('BOT_TOKEN'));
    const ready = new Promise<void>((resolve) => client.on('ready', resolve));
    await Promise.all([login, ready]);
  }
  return client;
});

container.bind<Detector>(TYPES.SquozeDetector).to(SquozeDetector);
container.bind<Notifier>(TYPES.ConsoleNotifier).to(ConsoleNotifier);
container.bind<Notifier>(TYPES.DiscordNotifier).to(DiscordNotifier);
container.bind<Listener>(TYPES.DiscordListener).to(DiscordListener);
