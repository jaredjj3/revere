export enum CommandName {
  Notify = 'notify',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Command<A = any> {
  name: string;
  description: string;
  parse(argv: string[]): A;
  run(args: A): Promise<void>;
}