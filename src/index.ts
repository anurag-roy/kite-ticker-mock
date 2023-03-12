import { modeToPacketSizeMap } from './constants';
import { Mode, TickerRequest } from './types';
import { fillTick } from './utils';

async function handleSession(websocket: WebSocket) {
  const tokenMap = new Map<number, Mode>();

  websocket.accept();
  websocket.addEventListener('message', async ({ data }) => {
    let reqBody: TickerRequest;
    try {
      if (typeof data !== 'string') {
        throw new Error();
      }
      reqBody = JSON.parse(data);
    } catch {
      websocket.send(JSON.stringify({ error: 'Unknown message received' }));
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

    setInterval(() => {
      const mapSize = tokenMap.size;
      if (mapSize > 0) {
        // Start with 2 bytes which are for total number of packets
        let bufferSize = 2;
        for (const mode of tokenMap.values()) {
          // Add extra 2 bytes which are for packet size
          bufferSize = bufferSize + 2 + modeToPacketSizeMap[mode];
        }
        const buffer = new ArrayBuffer(bufferSize);
        const dataView = new DataView(buffer);
        dataView.setInt16(0, mapSize);

        let index = 2;
        for (const [key, value] of tokenMap) {
          index = fillTick(dataView, index, key, value);
        }
        websocket.send(buffer);
      }
    }, 5000);
  });

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
