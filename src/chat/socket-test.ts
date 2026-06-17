import { io, Socket } from 'socket.io-client';

// ── CONFIG — fill these in before running ───────────────────────────────────

const SERVER_URL = 'http://localhost:3000/chat';

// Paste fresh JWTs here (login via Postman first, see instructions below)
const CLIENT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTMyZDExNWZjZjVjMzI4MmNiMTJmNDMiLCJlbWFpbCI6ImNsaWVudDFAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudCIsImlhdCI6MTc4MTcxNTIyMSwiZXhwIjoxNzgxODAxNjIxfQ.xyLajGZcJdeAZdIpX2FsEVsu276pl8GBweDfbR-82uY';
const TECHNICIAN_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTMwMTcwNGQ3OGRiNzQwYzNiOWJjNzYiLCJlbWFpbCI6InNheWVkQGdtYWlsLmNvbSIsInJvbGUiOiJ0ZWNobmljaWFuIiwiaWF0IjoxNzgxNzE1MjcyLCJleHAiOjE3ODE4MDE2NzJ9.0Pv6ZZMX7Ttekc4cR2s7joaVwniwTIkwqb7T0DWow4g';
const ADMIN_TOKEN = 'PASTE_ADMIN_JWT_HERE'; // only needed for support chat test

// IDs from your seeded/created data
const REQUEST_ID = 'PASTE_REQUEST_ID_HERE'; // fixed chat — request.status must be accepted/in_progress/on_the_way/started
const POST_ID = '6a32d6deb7fa41bc520dcac3'; // custom chat — needs a proposal from TECHNICIAN_TOKEN's user
const CATEGORY_ID = 'PASTE_CATEGORY_ID_HERE'; // community chat — technician must belong to this category
const CLIENT_USER_ID = 'PASTE_CLIENT_USER_ID_HERE'; // support chat — the client's own userId (from JWT sub)

// Toggle which suites to run
const RUN = {
  fixedRequest: false,
  customRequest: true,
  community: false,
  support: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function connectAs(label: string, token: string): Socket {
  const socket: Socket = io(SERVER_URL, { auth: { token } });

  socket.on('connect', () =>
    console.log(`✅ [${label}] connected:`, socket.id),
  );
  socket.on('disconnect', (reason) =>
    console.log(`🔌 [${label}] disconnected:`, reason),
  );
  socket.on('error', (err) => console.log(`❌ [${label}] error:`, err));
  socket.on('exception', (err) =>
    console.log(`⚠️  [${label}] ws exception:`, err),
  ); // catches WsException('Unauthorized') etc.

  return socket;
}

// ── 1. Fixed Request Chat (client + technician) ─────────────────────────────

function testFixedRequestChat() {
  console.log('\n--- Testing Fixed Request Chat ---');

  const client = connectAs('Client', CLIENT_TOKEN);
  const tech = connectAs('Technician', TECHNICIAN_TOKEN);

  client.on('connect', () => {
    client.emit('joinRoom', { requestId: REQUEST_ID });
  });

  tech.on('connect', () => {
    tech.emit('joinRoom', { requestId: REQUEST_ID });
  });

  client.on('joinedRoom', (data) => {
    console.log('✅ [Client] joined room:', data);
    client.emit('sendMessage', {
      requestId: REQUEST_ID,
      content: 'Hello from client',
    });
  });

  tech.on('joinedRoom', (data) => {
    console.log('✅ [Technician] joined room:', data);
  });

  tech.on('newMessage', (data) => {
    console.log('📩 [Technician] received:', data);
    tech.emit('sendMessage', {
      requestId: REQUEST_ID,
      content: 'Hello from technician',
    });
    // mark as read after a short delay
    setTimeout(() => tech.emit('markAsRead', { requestId: REQUEST_ID }), 500);
  });

  client.on('newMessage', (data) => console.log('📩 [Client] received:', data));
  client.on('messagesRead', (data) =>
    console.log('👀 [Client] read receipt:', data),
  );

  // Negative test: try sending a phone number — should be rejected by blockContent
  setTimeout(() => {
    client.emit('sendMessage', {
      requestId: REQUEST_ID,
      content: 'call me 01012345678',
    });
  }, 1500);
}

// ── 2. Custom Request Chat (post + proposal) ─────────────────────────────────

function testCustomRequestChat(technicianId: string) {
  console.log('\n--- Testing Custom Request Chat ---');

  const client = connectAs('Client', CLIENT_TOKEN);
  const tech = connectAs('Technician', TECHNICIAN_TOKEN);

  client.on('connect', () => {
    client.emit('joinCustomRoom', { postId: POST_ID, technicianId });
  });

  tech.on('connect', () => {
    tech.emit('joinCustomRoom', { postId: POST_ID }); // technician doesn't need to pass technicianId
  });

  client.on('joinedCustomRoom', (data) => {
    console.log('✅ [Client] joined custom room:', data);
    client.emit('sendCustomMessage', {
      postId: POST_ID,
      technicianId,
      content: 'Hi, interested in your proposal',
    });
  });

  tech.on('joinedCustomRoom', (data) =>
    console.log('✅ [Technician] joined custom room:', data),
  );
  tech.on('newCustomMessage', (data) =>
    console.log('📩 [Technician] received:', data),
  );
  client.on('newCustomMessage', (data) =>
    console.log('📩 [Client] received:', data),
  );
  client.on('customRoomClosed', (data) =>
    console.log('🔒 [Client] custom room closed:', data),
  );
  tech.on('customRoomClosed', (data) =>
    console.log('🔒 [Technician] custom room closed:', data),
  );
}

// ── 3. Community Chat (technicians only) ─────────────────────────────────────

function testCommunityChat() {
  console.log('\n--- Testing Community Chat ---');

  const tech1 = connectAs('Tech1', TECHNICIAN_TOKEN);

  tech1.on('connect', () => {
    tech1.emit('joinCommunity', { categoryId: CATEGORY_ID });
  });

  tech1.on('joinedCommunity', (data) => {
    console.log('✅ [Tech1] joined community:', data);
    tech1.emit('sendCommunityMessage', {
      categoryId: CATEGORY_ID,
      content: 'Anyone dealt with a tricky AC install before?',
    });
  });

  tech1.on('newCommunityMessage', (data) =>
    console.log('📩 [Tech1] received:', data),
  );

  // Negative test: client should be rejected
  const client = connectAs('Client(should fail)', CLIENT_TOKEN);
  client.on('connect', () => {
    client.emit('joinCommunity', { categoryId: CATEGORY_ID });
  });
}

// ── 4. Support Chat (user <-> admin) ──────────────────────────────────────────

function testSupportChat() {
  console.log('\n--- Testing Support Chat ---');

  const client = connectAs('Client', CLIENT_TOKEN);
  const admin = connectAs('Admin', ADMIN_TOKEN);

  client.on('connect', () => {
    client.emit('joinSupport', {});
  });

  admin.on('connect', () => {
    admin.emit('joinSupport', { userId: CLIENT_USER_ID });
  });

  client.on('joinedSupport', (data) => {
    console.log('✅ [Client] joined support:', data);
    client.emit('sendSupportMessage', {
      content: 'I need help with my deposit',
    });
  });

  admin.on('joinedSupport', (data) => {
    console.log('✅ [Admin] joined support:', data);
  });

  admin.on('newSupportMessage', (data) => {
    console.log('📩 [Admin] received:', data);
    admin.emit('sendSupportMessage', {
      targetUserId: CLIENT_USER_ID,
      content: 'Sure, let me check that for you',
    });
  });

  client.on('newSupportMessage', (data) =>
    console.log('📩 [Client] received:', data),
  );
}

// ── Run ───────────────────────────────────────────────────────────────────────

if (RUN.fixedRequest) testFixedRequestChat();
if (RUN.customRequest) testCustomRequestChat('6a301704d78db740c3b9bc76');
if (RUN.community) testCommunityChat();
if (RUN.support) testSupportChat();
