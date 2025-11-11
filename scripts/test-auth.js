/**
 * Manual Authentication Testing Script
 * 
 * This script tests the authentication endpoints manually
 * Run with: node scripts/test-auth.js
 * 
 * Make sure your development server is running on http://localhost:3000
 */

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n📝 Testing: ${name}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(name, url, method, body, expectedStatus) {
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === expectedStatus) {
      logSuccess(`${name} - Status: ${response.status}`);
      return { success: true, data, status: response.status };
    } else {
      logError(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      logWarning(`Response: ${JSON.stringify(data)}`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    logError(`${name} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🚀 Starting Authentication Tests\n', 'blue');
  log(`Base URL: ${baseURL}\n`, 'yellow');

  const testEmail = `test${Date.now()}@example.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = 'TestPass123!';
  let otp = '';

  // Test 1: Invalid email format
  logTest('Signup with invalid email');
  await testEndpoint(
    'Invalid email validation',
    '/api/auth/send-otp',
    'POST',
    { email: 'invalid-email', purpose: 'signup' },
    400
  );

  // Test 2: Request OTP for signup
  logTest('Request OTP for signup');
  const otpResult = await testEndpoint(
    'Send OTP',
    '/api/auth/send-otp',
    'POST',
    { email: testEmail, purpose: 'signup' },
    200
  );

  if (otpResult.success) {
    logWarning(`Note: Check email ${testEmail} for OTP or check server logs`);
    logWarning('For testing, you may need to manually set OTP in database');
  }

  // Test 3: Weak password validation
  logTest('Signup with weak password');
  await testEndpoint(
    'Weak password rejection',
    '/api/auth/signup',
    'POST',
    {
      email: testEmail,
      username: testUsername,
      password: 'weak',
      otp: '123456'
    },
    400
  );

  // Test 4: Invalid username
  logTest('Signup with invalid username');
  await testEndpoint(
    'Invalid username rejection',
    '/api/auth/signup',
    'POST',
    {
      email: testEmail,
      username: '12', // Too short
      password: testPassword,
      otp: '123456'
    },
    400
  );

  // Test 5: Login with non-existent user
  logTest('Login with non-existent user');
  await testEndpoint(
    'Non-existent user rejection',
    '/api/auth/login',
    'POST',
    {
      identifier: 'nonexistent@example.com',
      password: testPassword
    },
    401
  );

  // Test 6: Rate limiting - Send multiple OTP requests
  logTest('Rate limiting on OTP endpoint');
  log('Sending multiple requests to test rate limiting...', 'yellow');
  
  for (let i = 0; i < 6; i++) {
    const result = await testEndpoint(
      `OTP Request ${i + 1}`,
      '/api/auth/send-otp',
      'POST',
      { email: `ratelimit${i}@example.com`, purpose: 'signup' },
      i < 3 ? 200 : 429 // Expect rate limit after 3 requests
    );
    
    if (i >= 3 && result.status === 429) {
      logSuccess('Rate limiting working correctly');
      break;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test 7: Password reset flow
  logTest('Password reset - Request OTP');
  await testEndpoint(
    'Reset password OTP',
    '/api/auth/send-otp',
    'POST',
    { email: 'test@example.com', purpose: 'reset' },
    200
  );

  // Test 8: Validate reset with weak password
  logTest('Password reset with weak password');
  await testEndpoint(
    'Weak password in reset',
    '/api/auth/reset-password',
    'POST',
    {
      email: 'test@example.com',
      password: 'weak',
      otp: '123456'
    },
    400
  );

  // Test 9: Login rate limiting
  logTest('Rate limiting on login endpoint');
  log('Testing login rate limiting...', 'yellow');
  
  for (let i = 0; i < 6; i++) {
    const result = await testEndpoint(
      `Login Attempt ${i + 1}`,
      '/api/auth/login',
      'POST',
      {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      },
      i < 5 ? 401 : 429 // Expect rate limit after 5 attempts
    );
    
    if (i >= 5 && result.status === 429) {
      logSuccess('Login rate limiting working correctly');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test 10: Google OAuth endpoint exists
  logTest('Google OAuth endpoint');
  try {
    const response = await fetch(`${baseURL}/api/auth/signin/google`);
    if (response.status === 200 || response.status === 302) {
      logSuccess('Google OAuth endpoint is accessible');
    } else {
      logWarning(`Google OAuth endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    logWarning('Google OAuth endpoint test failed - this is expected if NextAuth is not fully configured');
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('🎉 Authentication Tests Complete!', 'blue');
  log('='.repeat(50), 'blue');
  log('\n📋 Summary:', 'cyan');
  log('✓ Validation tests completed', 'green');
  log('✓ Rate limiting tests completed', 'green');
  log('✓ Security checks completed', 'green');
  log('\n💡 Tips:', 'yellow');
  log('• Check server logs for detailed error messages');
  log('• Verify email sending is configured for OTP tests');
  log('• Update MongoDB for complete integration testing');
  log('• Test Google OAuth with proper credentials\n');
}

// Run tests
runTests().catch(error => {
  logError(`\nTest suite failed: ${error.message}`);
  process.exit(1);
});

