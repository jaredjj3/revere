export enum DetectorName {
  Squoze = 'squoze',
}

export interface Detector {
  detect(): Promise<void>;
}
