import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000/chat', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTJlMDNjM2IzNDFlNDBlNWE1NWQ2ODMiLCJlbWFpbCI6ImNsaWVudDFAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudCIsImlhdCI6MTc4MTQwMDUyNSwiZXhwIjoxNzgxNDg2OTI1fQ.Rxd3JhBP5FgH5x2NhbNZnthcAHydZkZ31JlrMfzKyNs',
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  socket.emit('joinRoom', {
    requestId: '6a2e16f7bf2dfb3aa580153d',
  });
});

socket.on('joinedRoom', (data) => {
  console.log('✅ Joined Room:', data);

  socket.emit('sendMessage', {
    requestId: '6a2e16f7bf2dfb3aa580153d',
    content: 'Hello from test Client',
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
