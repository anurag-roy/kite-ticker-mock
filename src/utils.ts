import { modeToPacketSizeMap } from './constants';
import { Mode } from './types';

const fillLtpTick = (dv: DataView, index: number, basePrice: number) => {
  // LTP
  dv.setInt32(index + 4, basePrice);
};

const fillQuoteTick = (dv: DataView, index: number, basePrice: number) => {
  fillLtpTick(dv, index, basePrice);

  // Last traded quantity
  dv.setInt32(index + 8, 100);
  // Average traded price
  dv.setInt32(index + 12, basePrice);
  // Volume traded for the day
  dv.setInt32(index + 16, 100);
  // Total buy quantity
  dv.setInt32(index + 20, 100);
  // Total sell quantity
  dv.setInt32(index + 24, 100);
  // Open price of the day
  dv.setInt32(index + 28, basePrice);
  // High price of the day
  dv.setInt32(index + 32, basePrice);
  // Low price of the day
  dv.setInt32(index + 36, basePrice);
  // Close price
  dv.setInt32(index + 40, basePrice);
};

const fillFullTick = (dv: DataView, index: number, basePrice: number) => {
  fillQuoteTick(dv, index, basePrice);

  // Last traded timestamp
  dv.setInt32(index + 44, Date.now());
  // Open Interest
  dv.setInt32(index + 48, 1.5);
  // Open Interest Day High
  dv.setInt32(index + 52, 1.5);
  // Open Interest Day Low
  dv.setInt32(index + 56, 1.5);
  // Exchange timestamp
  dv.setInt32(index + 60, Date.now());

  // Bid entries
  for (let i = 0; i < 5; i++) {
    let startIndex = index + 64 + i * 12;
    // Quantity
    dv.setInt32(startIndex, 100);
    // Price
    dv.setInt32(startIndex + 4, basePrice + (i + 1) * 100);
    // Orders
    dv.setInt16(startIndex + 8, 1);
  }

  // Offer entries
  for (let i = 0; i < 5; i++) {
    let startIndex = index + 64 + 60 + i * 12;
    // Quantity
    dv.setInt32(startIndex, 100);
    // Price
    dv.setInt32(startIndex + 4, basePrice - (i + 1) * 100);
    // Orders
    dv.setInt16(startIndex + 8, 1);
  }
};

const modeToFunctionMap = {
  ltp: fillLtpTick,
  quote: fillQuoteTick,
  full: fillFullTick,
};

export const fillTick = (
  dv: DataView,
  index: number,
  token: number,
  mode: Mode
) => {
  // Token
  dv.setInt32(index + 2, token);

  const basePrice = Math.round(Math.random() * 10000) * 5;
  dv.setInt16(index, modeToPacketSizeMap[mode]);
  modeToFunctionMap[mode].call(this, dv, index + 2, basePrice);
  return index + 2 + modeToPacketSizeMap[mode];
};
