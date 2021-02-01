export enum NotifierName {
  Console = 'console',
  Discord = 'discord',
}

export interface Notifier {
  notify(message: string): Promise<void>;
}
