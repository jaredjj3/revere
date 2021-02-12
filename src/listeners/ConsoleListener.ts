import { CommandRunSrc } from '@prisma/client';
import { injectable } from 'inversify';
import { createInterface } from 'readline';
import { $messages, $notifiers, $util } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { logger } from '../logger';
import { Notifier } from '../notifiers';
import { HELP_EXIT_CODE } from '../oclif/constants';
import { CommandRunner } from '../runners';
import { Listener } from './types';

const EXIT_COMMAND = 'exit';

@injectable()
export class ConsoleListener implements Listener {
  private readline = createInterface({ input: process.stdin, output: process.stdout, prompt: 'revere> ' });

  private cleanup: null | (() => Promise<void>) = null;

  async listen(notifiers: Notifier[]): Promise<void> {
    this.readline.on('line', this.onMessage(notifiers));
    this.readline.on('SIGINT', this.onExit);
    this.cleanup = $util.onCleanup(this.onExit);
    setTimeout(() => this.readline.prompt(true), 0); // flush main stack
  }

  onMessage = (notifiers: Notifier[]) => async (line: string): Promise<void> => {
    const trimmed = line.trim();

    if (trimmed === EXIT_COMMAND) {
      this.onExit();
      return;
    }

    const argv = trimmed.split(' ');
    const commandRunner = container.get<CommandRunner>(TYPES.CommandRunner);

    try {
      const commandRun = await commandRunner.run(argv, { src: CommandRunSrc.CONSOLE });
      if (commandRun.exitCode === HELP_EXIT_CODE) {
        await $notifiers.notifyAll(notifiers, $messages.help(commandRun));
      } else {
        await $notifiers.notifyAll(notifiers, $messages.commandRun(commandRun));
      }
    } catch (err) {
      await $notifiers.notifyAll(notifiers, err.message);
    }

    this.readline.prompt(true);
  };

  onExit = async (): Promise<void> => {
    logger.info('farewell');
    if (this.cleanup) {
      await this.cleanup();
    }
    process.exit(0);
  };
}
