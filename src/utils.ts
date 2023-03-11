import { LTP_PACKET_SIZE } from './constants';

export const fillLtpTick = (
  buffer: ArrayBuffer,
  index: number,
  token: number
) => {
  const packetSize = new Uint16Array(buffer, index, 1);
  packetSize[0] = LTP_PACKET_SIZE;

  const tick = new Uint32Array(buffer, index + 2, 2);
  tick[0] = token; // Token
  const price = Math.round(Math.random() * 10000) * 5;
  tick[1] = price; // LTP

  return index + 2 + LTP_PACKET_SIZE;
};
