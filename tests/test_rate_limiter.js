process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
dotenv.config();

import { app } from '../src/server.js';

let testServer;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    testServer = app.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[TEST SERVER] Running on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
}

async function runRateLimiterTests() {
  console.log('[TEST] Starting IP Rate Limiter Test Suite...');
  await startServer();

  try {
    console.log('\n--- STEP 1: Testing Login Rate Limiter (Max 5 attempts / min) ---');
    
    // Send 5 failed login attempts
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-rate-limit': 'true',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        }),
      });

      console.log(`[LOGIN ATTEMPT ${i}/5] HTTP Status: ${res.status}`);
      if (res.status === 429) {
        throw new Error(`Attempt ${i} was prematurely throttled with 429!`);
      }
    }

    // 6th Attempt: Must be blocked with HTTP 429 Too Many Requests
    console.log('\n--- STEP 2: Testing 6th Login Attempt (Must be HTTP 429) ---');
    const throttledRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-rate-limit': 'true',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      }),
    });

    const throttledData = await throttledRes.json();
    console.log('[LOGIN ATTEMPT 6] HTTP Status:', throttledRes.status);
    console.log('[LOGIN ATTEMPT 6] Response Payload:', throttledData);

    if (throttledRes.status !== 429) {
      throw new Error(`Expected HTTP 429 Too Many Requests on 6th attempt, got ${throttledRes.status}`);
    }

    if (throttledData.success !== false || !throttledData.message.includes('Too many login attempts')) {
      throw new Error(`Unexpected throttling message: ${JSON.stringify(throttledData)}`);
    }

    console.log('\n=============================================================');
    console.log('[SUCCESS] IP Rate Limiter verified: 5 allowed, 6th blocked with HTTP 429!');
    console.log('=============================================================\n');
  } finally {
    await stopServer();
  }
}

runRateLimiterTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[TEST FAILURE]:', err);
    process.exit(1);
  });
