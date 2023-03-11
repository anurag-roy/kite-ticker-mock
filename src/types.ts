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
  v: ['ltp' | 'quote' | 'full', number[]];
};

export type TickerRequest = SubscribeRequest | UnsubscribeRequest | ModeRequest;
