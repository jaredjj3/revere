import { Container } from 'inversify';
import { DetectorName, SquozeDetector } from './detectors';
import { ConsoleNotifier, DiscordNotifier, NotifierName } from './notifiers';

const container = new Container();

// detectors
container.bind(DetectorName.Squoze).to(SquozeDetector);

// notifiers
container.bind(NotifierName.Console).to(ConsoleNotifier);
container.bind(NotifierName.Discord).to(DiscordNotifier);

export { container };
