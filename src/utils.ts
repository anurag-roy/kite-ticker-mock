import { LTP_PACKET_SIZE } from './constants';

export const fillLtpTick = (dv: DataView, index: number, token: number) => {
  // Packet Size
  dv.setInt16(index, LTP_PACKET_SIZE);
  // Token
  dv.setInt32(index + 2, token);
  // LTP
  const price = Math.round(Math.random() * 10000) * 5;
  dv.setUint32(index + 6, price);

  return index + 2 + LTP_PACKET_SIZE;
};
