import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { DiscordSubscriber } from '../subscribers';
import { Command, CommandName } from './types';

@injectable()
export class SubscribeCommand implements Command<void> {
  name = CommandName.Subscribe;
  description = 'Subscribes to the Discord channel specified in the CHANNEL_ID env';

  constructor(@inject(TYPES.DiscordSubscriber) private discordSubscriber: DiscordSubscriber) {}

  parse(argv: string[]): void {
    return;
  }

  async run(): Promise<void> {
    await this.discordSubscriber.waitForMessages();
    await new Promise(() => {
      return;
    });
  }
}
