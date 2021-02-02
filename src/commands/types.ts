export enum CommandName {
  Notify = 'notify',
  Subscribe = 'subscribe',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Command<A = any> {
  name: CommandName;
  parse(argv: string[]): A;
  run(args: A): Promise<void>;
}
