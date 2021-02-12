import Command from '@oclif/command';
import { $util } from '../helpers';

export abstract class ExitImmediatelyCommand extends Command {
  private cleanup = $util.onCleanup();

  async finally(err?: Error): Promise<void> {
    await this.cleanup();
    await super.finally(err);
    err && process.stderr.write(err.message);
    const exitCode = err ? 1 : 0;
    this.exit(exitCode);
  }
}
