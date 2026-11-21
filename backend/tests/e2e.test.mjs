import http from 'http';

async function runTests() {
  console.log('🧪 Starting Sahaay E2E API Tests in Node...');

  // Start the backend server by importing dist/index.js
  const serverProcess = await import('../dist/index.js');
  
  // Wait a moment for server to bind port
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const BASE_URL = 'http://localhost:5000';

  async function req(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  }

  // 1. Health check
  console.log('\n--- TEST 1: Health Check ---');
  const health = await req('/health');
  console.log('Health status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Auth list users
  console.log('\n--- TEST 2: List Users ---');
  const users = await req('/api/auth/users');
  console.log('Users count:', users.data.users?.length);
  if (users.data.users?.length < 3) throw new Error('Demo users not found');

  // 3. Create Assistance Request
  console.log('\n--- TEST 3: Create Assistance Request ---');
  const newReq = await req('/api/requests', {
    method: 'POST',
    body: JSON.stringify({
      requester_id: 'usr_req_anjali',
      title: 'E2E Test: Urgent Saline & Bandages',
      description: 'Need sterile medical bandages and saline solution for senior home dressing.',
      category: 'medicine_delivery',
      location: '12th Main Indiranagar, Bengaluru',
      priority: 'urgent',
      contact_preference: 'chat',
    }),
  });
  console.log('Created Request ID:', newReq.data.request?.id);
  console.log('Channel ID:', newReq.data.request?.nexconn_channel_id);
  console.log('Status:', newReq.data.request?.status);
  const requestId = newReq.data.request?.id;
  if (newReq.data.request?.status !== 'OPEN') throw new Error('Initial status is not OPEN');

  // 4. Accept Request by Volunteer
  console.log('\n--- TEST 4: Volunteer Accepts Request ---');
  const accepted = await req(`/api/requests/${requestId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ volunteer_id: 'usr_vol_rahul' }),
  });
  console.log('Accept success:', accepted.data.success);
  console.log('Accepted status:', accepted.data.request?.status);
  console.log('Volunteer assigned:', accepted.data.request?.accepted_volunteer_id);
  if (accepted.data.request?.status !== 'ACCEPTED') throw new Error('Status not updated to ACCEPTED');

  // 5. Update Status: ACCEPTED -> IN_PROGRESS
  console.log('\n--- TEST 5A: Transition Status to IN_PROGRESS ---');
  const inProg = await req(`/api/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'IN_PROGRESS', user_id: 'usr_vol_rahul' }),
  });
  console.log('In Progress status:', inProg.data.request?.status);
  if (inProg.data.request?.status !== 'IN_PROGRESS') throw new Error('Status not IN_PROGRESS');

  // 6. Update Status: IN_PROGRESS -> COMPLETED
  console.log('\n--- TEST 5B: Transition Status to COMPLETED ---');
  const completed = await req(`/api/requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'COMPLETED', user_id: 'usr_req_anjali' }),
  });
  console.log('Completed status:', completed.data.request?.status);
  console.log('Completed at timestamp:', completed.data.request?.completed_at);
  if (completed.data.request?.status !== 'COMPLETED') throw new Error('Status not COMPLETED');

  // 7. Channel Metadata & Authorization
  console.log('\n--- TEST 6: Channel Authorization & Integrity ---');
  const channel = await req(`/api/chat/channel/${requestId}?userId=usr_req_anjali`);
  console.log('Channel ID:', channel.data.channelId);
  console.log('Requester in chat:', channel.data.participants?.requester?.name);
  console.log('Volunteer in chat:', channel.data.participants?.volunteer?.name);

  // Unauthorized user rejection
  const unauthorized = await req(`/api/chat/channel/${requestId}?userId=some_random_intruder`);
  console.log('Unauthorized access status code:', unauthorized.status);
  if (unauthorized.status !== 403) throw new Error('Channel security check failed');

  // 8. Nexconn Status Endpoint
  console.log('\n--- TEST 7: Nexconn Diagnostics Endpoint ---');
  const nexconnStat = await req('/api/chat/status');
  console.log('Nexconn status:', nexconnStat.data);

  console.log('\n===============================================');
  console.log('🎉 ALL 7 E2E INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('===============================================');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
