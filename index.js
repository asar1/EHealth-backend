const http = require('http');
const app = require('./app/app');
require('dotenv').config();
const server = http.createServer(app);
const io = require('socket.io')(server);
const thread = require('./app/inbox/service/InboxService');
const port = process.env.PORT || 4000;

io.on('connection', (socket) => {
    console.log('connected', socket.id);
    socket.on('disconnectFromServer', () => {
        console.log('disconnected', socket.id);
    });
    socket.on('sendMessage', async (message) => {
        await thread.createThread(message);
        const params = {
            sender: message.sender,
            receiver: message.receiver
        };
        const messages = await thread.getMessages(params);

        if (messages.doctorSocket) {
            const doctorSocket = await io.in(messages.doctorSocket).allSockets();
            console.log(doctorSocket, 'doctor socket');
            if (doctorSocket.has(messages.doctorSocket)) {
                await thread.markAsRead({
                    _id: messages._id,
                    from: 'doctor'
                });
            }

            io.to(messages.doctorSocket).emit('fetchMessagesResponse', messages.messages);
        }
        if (messages.patientSocket) {
            const patientSocket = await io.in(messages.patientSocket).allSockets();

            console.log(patientSocket, 'patient socket');

            if (patientSocket.has(messages.patientSocket)) {
                await thread.markAsRead({
                    _id: messages._id,
                    from: 'patient'
                });
            }

            io.to(messages.patientSocket).emit('fetchMessagesResponse', messages.messages);
        }

        socket.emit('fetchMessagesResponse', messages ? messages.messages : []);
    });
    socket.on('fetchMessages', async (params) => {
        console.log('fetch messages request');
        const messages = await thread.getMessages(params);

        socket.emit('fetchMessagesResponse', messages ? messages.messages : []);
        console.log('fetch messages response');
    });

    socket.on('fetchInbox', async (params) => {
        const messages = await thread.getInbox(params);
        socket.emit('fetchInboxResponse', messages);
    });

    socket.on('storeSocketId', async (params) => {
        await thread.storeSockets(params);
    });

    socket.on('imageMessage', async (params) => {
        console.log(params.message.img, 'new params');
    });
});

server.listen(port, () => console.log('listen to port', port));
