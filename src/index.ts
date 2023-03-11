import { LTP_PACKET_SIZE } from './constants';
import { TickerRequest } from './types';
import { fillLtpTick } from './utils';

async function handleSession(websocket: WebSocket) {
  const tokenMap = new Map<number, 'ltp' | 'quote' | 'full'>();

  websocket.accept();
  websocket.addEventListener('message', async ({ data }) => {
    let reqBody: TickerRequest;
    try {
      if (typeof data !== 'string') {
        throw new Error();
      }
      reqBody = JSON.parse(data);
    } catch {
      websocket.send(
        JSON.stringify({ error: 'Unknown message received', tz: new Date() })
      );
      return;
    }

    switch (reqBody.a) {
      case 'subscribe':
        for (const token of reqBody.v) {
          tokenMap.set(token, 'ltp');
        }
        break;
      case 'unsubscribe':
        for (const token of reqBody.v) {
          tokenMap.delete(token);
        }
        break;
      case 'mode':
        const [mode, tokens] = reqBody.v;
        for (const token of tokens) {
          tokenMap.set(token, mode);
        }
        break;
      default:
        break;
    }
  });

  setTimeout(() => {
    const buffer = new ArrayBuffer(2 + (2 + LTP_PACKET_SIZE) * tokenMap.size);
    const numberOfPackets = new Uint16Array(buffer, 0, 1);
    numberOfPackets[0] = tokenMap.size;

    let index = 2;
    for (const [key, value] of tokenMap) {
      index = fillLtpTick(buffer, index, key);
    }

    websocket.send(buffer);
  }, 500);

  websocket.addEventListener('close', async (evt) => {
    console.log(evt);
  });
}

async function websocketHandler(req: Request) {
  const upgradeHeader = req.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const [client, server] = Object.values(new WebSocketPair());
  await handleSession(server);

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

export default {
  async fetch(req: Request) {
    try {
      return await websocketHandler(req);
    } catch (err: any) {
      return new Response(err.toString());
    }
  },
};
