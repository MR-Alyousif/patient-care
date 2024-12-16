const dgram = require('dgram');
const MULTICAST_ADDR = '239.255.0.1';
const PORT = 54321;

// Create sender
const sender = dgram.createSocket({ type: 'udp4', reuseAddr: true });
sender.bind(() => {
    sender.setBroadcast(true);
    sender.setMulticastTTL(128);
});

// Create receiver
const receiver = dgram.createSocket({ type: 'udp4', reuseAddr: true });
receiver.bind(PORT, () => {
    receiver.addMembership(MULTICAST_ADDR);
    console.log('Listening for multicast messages...');
});

receiver.on('message', (msg, rinfo) => {
    console.log(`Received message from ${rinfo.address}:${rinfo.port}: ${msg}`);
});

// Send a message every 2 seconds
setInterval(() => {
    const message = `Hello from ${require('os').hostname()} at ${new Date().toISOString()}`;
    sender.send(message, PORT, MULTICAST_ADDR, (err) => {
        if (err) {
            console.error('Failed to send message:', err);
        } else {
            console.log('Sent message:', message);
        }
    });
}, 2000);
