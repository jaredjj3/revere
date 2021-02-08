import { CommandRunSrc } from '@prisma/client';
import { injectable } from 'inversify';
import { createInterface } from 'readline';
import { $notifiers } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { Notifier } from '../notifiers';
import { CommandRunner } from '../runners';
import { logger, onExit } from '../util';
import { Listener } from './types';

const EXIT_COMMAND = 'exit';

@injectable()
export class ConsoleListener implements Listener {
  private readline = createInterface({ input: process.stdin, output: process.stdout, prompt: 'revere> ' });

  async listen(notifiers: Notifier[]): Promise<void> {
    this.readline.on('line', this.onMessage(notifiers));
    onExit(this.onExit);
    setTimeout(() => this.readline.prompt(true), 0); // flush main stack
  }

  onMessage = (notifiers: Notifier[]) => async (line: string): Promise<void> => {
    const trimmed = line.trim();

    if (trimmed === EXIT_COMMAND) {
      this.onExit();
    }

    const argv = trimmed.split(' ');
    const commandRunner = container.get<CommandRunner>(TYPES.CommandRunner);

    try {
      const commandRun = await commandRunner.run(argv, { src: CommandRunSrc.CONSOLE });
      $notifiers.notify(
        notifiers,
        [commandRun.stdout, commandRun.stderr].filter((str) => str.length > 0).join('\n=======================\n')
      );
    } catch (err) {
      $notifiers.notify(notifiers, err.message);
    }

    this.readline.prompt(true);
  };

  onExit = (): void => {
    logger.info('farewell');
    process.exit(0);
  };
}
