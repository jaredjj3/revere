import { Detector } from './types';

export class SquozeDetector implements Detector {
  detect(): Promise<void> {
    return Promise.resolve();
  }
}
