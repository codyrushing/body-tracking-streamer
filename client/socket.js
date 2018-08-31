import eventEmitter from './event-emitter';
const socketHost = 'ws://localhost:8080';

var ws;
const buildSocket = () => {
  ws = new WebSocket(socketHost);
  ws.addEventListener(
    'open',
    () => {
      ws.addEventListener(
        'message',
        ({data}) => {
          eventEmitter.emit('data', JSON.parse(data));
        }
      );
    }
  );

  ws.addEventListener(
    'close',
    () => {
      setTimeout(
        buildSocket,
        1 * 1000
      );
    }
  );

  return ws;
}

export default buildSocket();
