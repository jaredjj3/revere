import * as dotenv from 'dotenv';
import { Container } from 'inversify';
import 'reflect-metadata';
import { Detector, SquozeDetector } from './detectors';
import { TYPES } from './inversify.types';
import { ConsoleNotifier, DiscordNotifier, Notifier } from './notifiers';

dotenv.config();

export const container = new Container();

container.bind<Detector>(TYPES.SquozeDetector).to(SquozeDetector);
container.bind<Notifier>(TYPES.ConsoleNotifier).to(ConsoleNotifier);
container.bind<Notifier>(TYPES.DiscordNotifier).to(DiscordNotifier);
