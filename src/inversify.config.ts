import * as dotenv from 'dotenv';
import { Container } from 'inversify';
import 'reflect-metadata';
import { SquozeDetector } from './detectors';
import { TYPES } from './inversify.types';
import { ConsoleNotifier, DiscordNotifier } from './notifiers';

dotenv.config();

export const container = new Container();

// detectors
container.bind(TYPES.SquozeDetector).to(SquozeDetector);

// notifiers
container.bind(TYPES.ConsoleNotifier).to(ConsoleNotifier);
container.bind(TYPES.DiscordNotifier).to(DiscordNotifier).inSingletonScope();

// subscribers
