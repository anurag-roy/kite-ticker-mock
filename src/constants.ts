import { Mode } from './types';

export const modeToPacketSizeMap: Record<Mode, number> = {
  ltp: 8,
  quote: 44,
  full: 184,
};
