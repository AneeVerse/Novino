/**
 * User migration script: MongoDB → Supabase Auth + public.profiles
 *
 * Usage:
 *   node scripts/migrate-users-to-supabase.js
 *
 * Requirements:
 *   - .env.local with MONGODB_URI, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   - `public.profiles` table + triggers deployed (see supabase/migrations/*)
 *
 * Notes:
 *   - Password-based users are provisioned with a random temporary password,
 *     flagged with `needs_password_reset` so you can trigger password-reset emails.
 *   - Google OAuth users are skipped (they will recreate their accounts via Supabase OAuth).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local (compatible with Next.js format)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContents = fs.readFileSync(envPath, 'utf8');
  envContents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=:#\s]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      value = value.replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'novino';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in environment');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUMMARY = {
  processed: 0,
  created: 0,
  skippedGoogle: 0,
  skippedBlocked: 0,
  existing: 0,
  errors: 0,
};

function toStringId(value) {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof ObjectId) return value.toString();
  if (value.toHexString) return value.toHexString();
  return String(value);
}

function randomPassword() {
  return crypto.randomBytes(18).toString('base64url');
}

async function upsertProfile(userId, legacyUser) {
  const { username, avatar, isBlocked, createdAt, updatedAt, email } = legacyUser;

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: (email || '').toLowerCase() || null,
        username: username || null,
        avatar_url: avatar || null,
        is_blocked: Boolean(isBlocked),
        metadata: {
          legacy_user_id: toStringId(legacyUser._id),
          origin: 'mongo',
          googleId: legacyUser.googleId || null,
          createdAt: createdAt || null,
          updatedAt: updatedAt || null,
        },
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw error;
  }
}

async function migrateUser(legacyUser) {
  SUMMARY.processed += 1;

  const legacyId = toStringId(legacyUser._id) || '(unknown)';
  const email = legacyUser.email?.toLowerCase();
  const username = legacyUser.username;
  const hasGoogle = Boolean(legacyUser.googleId);

  if (!email) {
    console.warn(`⚠️  Skipping user ${legacyId}: missing email`);
    SUMMARY.errors += 1;
    return;
  }

  if (hasGoogle) {
    SUMMARY.skippedGoogle += 1;
    console.log(`⏭️  Skipping Google OAuth user ${email} (will re-auth via Supabase Google)`);
    return;
  }

  const tempPassword = randomPassword();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      username,
      avatar_url: legacyUser.avatar || null,
      origin: 'mongo',
      legacy_user_id: legacyId,
      needs_password_reset: true,
      was_blocked: Boolean(legacyUser.isBlocked),
    },
    app_metadata: {
      provider: 'email',
      roles: ['user'],
    },
  });

  if (error) {
    // If the user already exists, record + continue (profile should already exist via trigger)
    if (error.message && error.message.includes('already registered')) {
      SUMMARY.existing += 1;
      console.log(`ℹ️  Supabase user already exists for ${email}, skipping creation.`);
      return;
    }

    SUMMARY.errors += 1;
    console.error(`❌ Failed to create Supabase user for ${email}:`, error.message || error);
    return;
  }

  const supabaseUser = data.user;

  try {
    await upsertProfile(supabaseUser.id, legacyUser);
    SUMMARY.created += 1;

    if (legacyUser.isBlocked) {
      SUMMARY.skippedBlocked += 1;
      console.log(`🚫 User ${email} is blocked — flag copied to profile (enforce via API).`);
    } else {
      console.log(`✅ Migrated user ${email} (${legacyId})`);
    }
  } catch (profileError) {
    SUMMARY.errors += 1;
    console.error(`❌ Failed to upsert profile for ${email}:`, profileError.message || profileError);
  }
}

async function run() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('📦 Connecting to MongoDB…');
    await client.connect();
    const db = client.db(MONGODB_DB);
    const users = await db.collection('users').find({}).toArray();
    console.log(`🔍 Found ${users.length} users in MongoDB\n`);

    for (const user of users) {
      await migrateUser(user);
    }

    console.log('\n📊 Migration summary:');
    console.log(`   Processed:      ${SUMMARY.processed}`);
    console.log(`   Created:        ${SUMMARY.created}`);
    console.log(`   Already exists: ${SUMMARY.existing}`);
    console.log(`   Google skipped: ${SUMMARY.skippedGoogle}`);
    console.log(`   Blocked copied: ${SUMMARY.skippedBlocked}`);
    console.log(`   Errors:         ${SUMMARY.errors}`);
    console.log('\n⚠️  Remember to trigger password reset emails for migrated users.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();


