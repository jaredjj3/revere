import { Command, Topic } from '@oclif/config';
import Help from '@oclif/plugin-help';
import { HELP_EXIT_CODE } from './constants';

export default class CustomHelp extends Help {
  showHelp(args: string[]): void {
    super.showHelp(args);
    this.onHelpFinish();
  }

  showRootHelp(): void {
    super.showRootHelp();
    this.onHelpFinish();
  }

  showTopicHelp(topic: Topic): void {
    super.showTopicHelp(topic);
    this.onHelpFinish();
  }

  showCommandHelp(command: Command): void {
    super.showCommandHelp(command);
    this.onHelpFinish();
  }

  private onHelpFinish() {
    // this is how the parent process can know a help command was sent
    process.exit(HELP_EXIT_CODE);
  }
}
