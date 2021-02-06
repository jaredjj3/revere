import { Detector } from '../detectors';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';

export const ALLOWED_DETECTORS = [NAMES.squoze];
export const DEFAULT_DETECTORS = [NAMES.squoze];

export const getDetector = (detectorName: string): Detector => {
  if (!ALLOWED_DETECTORS.includes(detectorName)) {
    throw new RevereError(`detector not allowed: ${detectorName}`);
  }
  return container.getNamed<Detector>(TYPES.Detector, detectorName);
};
