export enum MessageType {
  Squoze = 'Squoze',
}

export type Message = {
  type: MessageType;
  detectedAt: Date;
  content: string;
};

export type SquozeMessage = Message & {
  type: MessageType.Squoze;
};
