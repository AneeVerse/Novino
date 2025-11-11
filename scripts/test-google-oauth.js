/**
 * Google OAuth Testing Script
 * 
 * This script helps test Google OAuth integration
 * Run with: node scripts/test-google-oauth.js
 * 
 * Prerequisites:
 * 1. Set up Google OAuth credentials in .env.local
 * 2. Start development server
 * 3. Run this script to perform checks
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log('='.repeat(60) + '\n', 'blue');
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Check environment variables
function checkEnvironmentVariables() {
  logSection('Environment Variables Check');

  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      allPresent = false;
    }
  });

  if (!allPresent) {
    logWarning('\nPlease add missing variables to your .env.local file');
    return false;
  }

  return true;
}

// Validate Google OAuth credentials format
function validateCredentials() {
  logSection('Google OAuth Credentials Validation');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientId) {
    if (clientId.endsWith('.apps.googleusercontent.com')) {
      logSuccess('GOOGLE_CLIENT_ID format is correct');
    } else {
      logWarning('GOOGLE_CLIENT_ID format looks incorrect');
      logInfo('Should end with: .apps.googleusercontent.com');
    }

    if (clientId.includes('your-client-id') || clientId.length < 50) {
      logError('GOOGLE_CLIENT_ID appears to be a placeholder');
    }
  }

  if (clientSecret) {
    if (clientSecret.length < 20) {
      logWarning('GOOGLE_CLIENT_SECRET looks too short');
    } else {
      logSuccess('GOOGLE_CLIENT_SECRET has reasonable length');
    }

    if (clientSecret.includes('your-client-secret')) {
      logError('GOOGLE_CLIENT_SECRET appears to be a placeholder');
    }
  }
}

// Check NextAuth configuration file
function checkNextAuthConfig() {
  logSection('NextAuth Configuration Check');

  const configPath = path.join(process.cwd(), 'pages', 'api', 'auth', '[...nextauth].ts');

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Check for Google Provider
    if (configContent.includes('GoogleProvider')) {
      logSuccess('Google Provider is configured');
    } else {
      logError('Google Provider not found in NextAuth config');
    }

    // Check for proper callback configuration
    if (configContent.includes('signIn') && configContent.includes('callback')) {
      logSuccess('Callbacks are configured');
    } else {
      logWarning('Callbacks might not be properly configured');
    }

    // Check for database integration
    if (configContent.includes('connectToDatabase')) {
      logSuccess('Database integration is present');
    } else {
      logWarning('Database integration not found');
    }

    // Check for user model
    if (configContent.includes('User.findOne') || configContent.includes('User.create')) {
      logSuccess('User model integration is present');
    } else {
      logWarning('User model integration not found');
    }

  } catch (error) {
    logError(`Could not read NextAuth config: ${error.message}`);
  }
}

// Check User model for OAuth fields
function checkUserModel() {
  logSection('User Model OAuth Fields Check');

  const modelPath = path.join(process.cwd(), 'models', 'User.ts');

  try {
    const modelContent = fs.readFileSync(modelPath, 'utf8');

    if (modelContent.includes('googleId')) {
      logSuccess('googleId field is present in User model');
    } else {
      logError('googleId field is missing in User model');
    }

    if (modelContent.includes('avatar')) {
      logSuccess('avatar field is present in User model');
    } else {
      logWarning('avatar field is missing in User model');
    }

    // Check if password is optional for OAuth users
    if (modelContent.includes('required: function') || modelContent.includes('!this.googleId')) {
      logSuccess('Password is conditional (optional for OAuth)');
    } else {
      logWarning('Password field might be required for OAuth users');
    }

  } catch (error) {
    logError(`Could not read User model: ${error.message}`);
  }
}

// Provide testing instructions
function printTestingInstructions() {
  logSection('Manual Testing Instructions');

  logInfo('Follow these steps to test Google OAuth:');
  console.log('');

  log('1. Start your development server:', 'cyan');
  log('   npm run dev\n');

  log('2. Navigate to login page:', 'cyan');
  log('   http://localhost:3000/login\n');

  log('3. Click "Sign in with Google" button\n');

  log('4. You should be redirected to Google login\n');

  log('5. After signing in with Google, you should be:', 'cyan');
  log('   • Redirected back to your app');
  log('   • Automatically logged in');
  log('   • Have a user created in your database\n');

  log('6. Check your MongoDB database:', 'cyan');
  log('   • User should have a googleId field');
  log('   • User should have an avatar (Google profile picture)');
  log('   • Username should be generated from email\n');

  log('7. Common issues and solutions:', 'yellow');
  log('   • redirect_uri_mismatch:', 'red');
  log('     Check Authorized redirect URIs in Google Console');
  log('     Should be: http://localhost:3000/api/auth/callback/google\n');
  
  log('   • invalid_client:', 'red');
  log('     Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  log('     Make sure there are no extra spaces or quotes\n');
  
  log('   • Access blocked:', 'red');
  log('     Add your email as a test user in Google Console');
  log('     Or publish your app to remove testing restrictions\n');
}

// Print Google Console setup reminder
function printGoogleConsoleSetup() {
  logSection('Google Cloud Console Setup Checklist');

  const checklist = [
    'Create project in Google Cloud Console',
    'Enable OAuth consent screen',
    'Add required scopes (email, profile)',
    'Create OAuth 2.0 Client ID',
    'Add authorized JavaScript origins: http://localhost:3000',
    'Add authorized redirect URI: http://localhost:3000/api/auth/callback/google',
    'Copy Client ID and Client Secret to .env.local',
    'Add test users if app is in testing mode'
  ];

  checklist.forEach((item, index) => {
    log(`${index + 1}. ${item}`, 'cyan');
  });

  log('\n📚 Detailed setup guide available in: GOOGLE_OAUTH_SETUP.md\n', 'magenta');
}

// Main test function
async function runGoogleOAuthTests() {
  log('\n🚀 Google OAuth Configuration Test\n', 'blue');

  // Check environment variables
  const envVarsOk = checkEnvironmentVariables();

  if (envVarsOk) {
    // Validate credentials
    validateCredentials();
  }

  // Check configuration files
  checkNextAuthConfig();
  checkUserModel();

  // Print instructions
  printTestingInstructions();
  printGoogleConsoleSetup();

  // Summary
  logSection('Summary');

  if (envVarsOk) {
    logSuccess('Environment variables are configured');
    logInfo('You can proceed with manual testing');
  } else {
    logError('Please configure environment variables first');
    logInfo('Copy env-example.txt to .env.local and fill in your credentials');
  }

  log('\n💡 Next steps:', 'yellow');
  log('1. Review the checks above');
  log('2. Fix any issues found');
  log('3. Follow the manual testing instructions');
  log('4. Check server logs for detailed error messages\n');
}

// Load environment variables from .env.local if it exists
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    });
  } else {
    logWarning('.env.local file not found');
  }
} catch (error) {
  logWarning(`Could not load .env.local: ${error.message}`);
}

// Run tests
runGoogleOAuthTests().catch(error => {
  logError(`\nTest failed: ${error.message}`);
  process.exit(1);
});

