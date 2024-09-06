const io = require('socket.io-client');

const socket = io.connect('http://localhost:5000/');

const messageBody = {
    sender: '5f949411c9a3cb001ff6bd49',
    receiver: '5f949312c9a3cb001ff6bd48',
    message: {
        text: 'first message from Anna to Hassan',
        date: new Date(),
        img: ''
    },
    user: 'br eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJldzBkY3dAZ21haWwuY29tIiwiX2lkIjoiNWZhODM5YjBkYjY4ZDUwMDJhN2YzNmRiIiwicm9sZSI6InVzZXIiLCJ1aWQiOiJ0WkpvVkZTSWc2aDRaalRaMjE0cDltMFl2SXIxIiwiaWF0IjoxNjE2MDg1NTc4LCJleHAiOjE2MjAwODUxNzh9.L1rt_QsUalsnMTsLWHM7lYa5kv8G3qkUtx35z1Y6wU0'
};

socket.on('welcome', (data) => {
    console.log('received =>', data);
    socket.emit('sendMessage', messageBody);

    socket.on('messageResponse', (data) => {
        console.log(data, 'received thing');
    });
});
