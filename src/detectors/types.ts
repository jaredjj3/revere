import { Message } from '../messages';

export enum DetectorName {
  Squoze = 'squoze',
}

export interface Detector<M extends Message = Message> {
  name: DetectorName;
  detect(): Promise<M[]>;
}
