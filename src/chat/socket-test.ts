import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000/chat', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTI0YjNlMWVmNDkzMWI4ZDhmN2Y5NGMiLCJlbWFpbCI6ImFobWVkLnRlY2hAZ21haWwuY29tIiwicm9sZSI6InRlY2huaWNpYW4iLCJpYXQiOjE3ODEyMjQ3MzcsImV4cCI6MTc4MTMxMTEzN30.c8g1HrMW4rG7MApacZjuZG0oC4cPQGMvyldB7OkRJLc',
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  socket.emit('joinRoom', {
    requestId: '6a2b54ae471dfb932a186077',
  });
});

socket.on('joinedRoom', (data) => {
  console.log('✅ Joined Room:', data);

  socket.emit('sendMessage', {
    requestId: '6a2b54ae471dfb932a186077',
    content: 'Hello from test client',
  });
});

socket.on('newMessage', (data) => {
  console.log('📩 New Message:', data);
});

socket.on('messagesRead', (data) => {
  console.log('👀 Messages Read:', data);
});

socket.on('roomClosed', (data) => {
  console.log('🔒 Room Closed:', data);
});

socket.on('error', (error) => {
  console.log('❌ Error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});
