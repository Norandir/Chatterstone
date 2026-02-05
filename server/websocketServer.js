const WebSocket = require('ws');

// Create a WebSocket server on port 3000
const wss = new WebSocket.Server({ port: 3000 }, () => {
	console.log('WebSocket server running on ws://localhost:3000');
});

// Store the single client (if you only expect one)

let clientConnection = null;

// Listen for new connections
wss.on('connection', (ws) => {
	console.log('Client connected');
	clientConnection = ws;

	// Optional: handle messages from client
	ws.on('message', (msg) => {
		console.log('Received from client:', msg);
	});

	ws.on('close', () => {
		console.log('Client disconnected');
		clientConnection = null;
	});
});

function wsSend(data) {
	if (clientConnection && clientConnection.readyState === WebSocket.OPEN) {
		clientConnection.send(JSON.stringify(data));
		console.log('Sent:', data);
	}
	else {
		console.log('No client connected, cannot send JSON');
	}
}

module.exports = { wsSend };