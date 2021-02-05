import { MessageType, Severity } from '../messages';
import { Notifier } from '../notifiers';

export const notify = async (notifiers: Notifier[], content: string): Promise<void> => {
  const timestamp = new Date();
  await Promise.all(
    notifiers.map((notifier) =>
      notifier.notify({ type: MessageType.Stdout, content, severity: Severity.Info, timestamp })
    )
  );
};
