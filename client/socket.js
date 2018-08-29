const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => console.log('connected');
ws.onmessage = e => console.log(JSON.parse(e.data));

export default ws;
