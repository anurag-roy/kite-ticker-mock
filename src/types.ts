export type Mode = 'ltp' | 'quote' | 'full';

type SubscribeRequest = {
  a: 'subscribe';
  v: number[];
};

type UnsubscribeRequest = {
  a: 'unsubscribe';
  v: number[];
};

type ModeRequest = {
  a: 'mode';
  v: [Mode, number[]];
};

export type TickerRequest = SubscribeRequest | UnsubscribeRequest | ModeRequest;
