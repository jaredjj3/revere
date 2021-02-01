import { Message } from '../messages';

export enum DetectorName {
  Squoze = 'squoze',
}

export interface Detector {
  detect(): Promise<Message[]>;
}
