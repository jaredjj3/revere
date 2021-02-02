export enum CommandName {
  Notify = 'Notify',
}

export interface Command<A = any> {
  name: string;
  description: string;
  parse(argv: string[]): A;
  run(args: A): Promise<void>;
}
