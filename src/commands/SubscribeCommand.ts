import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { DiscordSubscriber } from '../subscribers';
import { Command, CommandName } from './types';

@injectable()
export class SubscribeCommand implements Command<void> {
  name = CommandName.Subscribe;

  constructor(@inject(TYPES.DiscordSubscriber) private discordSubscriber: DiscordSubscriber) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(argv: string[]): void {
    return;
  }

  async run(): Promise<void> {
    await this.discordSubscriber.waitForMessages();
  }
}
