import { Message } from '../messages';

export interface Detector<M extends Message = Message> {
  detect(): Promise<M[]>;
}
