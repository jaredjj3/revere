import { Container } from 'inversify';
import { CommandName, NotifyCommand } from './commands';
import { SquozeDetector } from './detectors';
import { TYPES } from './inversify.types';
import { ConsoleNotifier, DiscordNotifier } from './notifiers';
import { DiscordSubscriber } from './subscribers';

export const container = new Container();

// detectors
container.bind(TYPES.Detector).to(SquozeDetector);
container.bind(TYPES.SquozeDetector).to(SquozeDetector);

// notifiers
container.bind(TYPES.Notifier).to(ConsoleNotifier);
container.bind(TYPES.ConsoleNotifier).to(ConsoleNotifier);

container.bind(TYPES.Notifier).to(DiscordNotifier);
container.bind(TYPES.DiscordNotifier).to(DiscordNotifier);

// commands
container.bind(TYPES.Command).to(NotifyCommand).whenTargetIsDefault();
container.bind(TYPES.Command).to(NotifyCommand).whenTargetNamed(CommandName.Notify);
container.bind(TYPES.NotifyCommand).to(NotifyCommand);

// subscribers
container.bind(TYPES.DiscordSubscriber).to(DiscordSubscriber);
