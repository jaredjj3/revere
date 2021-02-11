import Command from '@oclif/command';
import { onCleanup } from '../util';

export abstract class ExitImmediatelyCommand extends Command {
  private cleanup = onCleanup();

  async finally(err?: Error): Promise<void> {
    await Promise.all([super.finally(err), this.cleanup()]);
    const exitCode = err ? 1 : 0;
    this.exit(exitCode);
  }
}
