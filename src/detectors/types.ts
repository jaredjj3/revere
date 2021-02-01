export enum DetectorName {
  Squoze = 'squoze',
}

export type Message = {
  detectedAt: Date;
  content: string;
};

export interface Detector {
  detect(): Promise<Message[]>;
}
