import Command from '@oclif/command';
import { onCleanup } from '../util';

export abstract class BaseCommand extends Command {
  private cleanup = onCleanup();

  async finally(): Promise<void> {
    await this.cleanup();
  }
}
