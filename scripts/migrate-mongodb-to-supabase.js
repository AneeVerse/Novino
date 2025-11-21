// Migration script: Export productCategories from MongoDB and import to Supabase
// Run this with: node scripts/migrate-mongodb-to-supabase.js

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split(/\r?\n/).forEach(line => {
    // Remove leading/trailing whitespace
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) return;
    
    // Match KEY=VALUE pattern (handle spaces around =)
    const match = trimmed.match(/^([^=:#\s]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateData() {
  const mongoClient = new MongoClient(MONGODB_URI);
  
  try {
    // Step 1: Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoClient.connect();
    console.log('✓ Connected to MongoDB\n');
    
    const db = mongoClient.db(MONGODB_DB);
    const collection = db.collection('productCategories');
    
    // Step 2: Fetch all categories from MongoDB
    console.log('📥 Fetching productCategories from MongoDB...');
    const categories = await collection.find({}).toArray();
    console.log(`✓ Found ${categories.length} category(ies) in MongoDB\n`);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found in MongoDB. Nothing to migrate.');
      return;
    }
    
    // Step 3: Display what we found
    console.log('📋 Categories to migrate:');
    categories.forEach((cat, index) => {
      const productCount = cat.products?.length || 0;
      console.log(`   ${index + 1}. ${cat.name}: ${productCount} product(s)`);
    });
    console.log('');
    
    // Step 4: Transform MongoDB data to Supabase format
    console.log('🔄 Transforming data for Supabase...');
    const supabaseData = categories.map((cat, index) => {
      // Convert MongoDB _id to string if it exists
      const products = (cat.products || []).map((product) => {
        // Ensure product has required fields
        return {
          id: product.id || String(product._id || Date.now() + Math.random()),
          name: product.name || '',
          description: product.description || '',
          basePrice: product.basePrice || product.price || '',
          quantity: product.quantity || 0,
          images: product.images || (product.image ? [product.image] : []),
          metaDescription: product.metaDescription || '',
          order: typeof product.order === 'number' ? product.order : index,
          createdAt: product.createdAt || new Date().toISOString(),
        };
      });
      
      return {
        name: cat.name || '',
        description: cat.description || '',
        order_index: typeof cat.order === 'number' ? cat.order : index,
        products: products,
        created_at: cat.createdAt || new Date().toISOString(),
        updated_at: cat.updatedAt || cat.createdAt || new Date().toISOString(),
      };
    });
    
    console.log('✓ Data transformed\n');
    
    // Step 5: Insert into Supabase
    console.log('📤 Inserting data into Supabase...');
    const { data, error } = await supabase
      .from('product_categories')
      .insert(supabaseData)
      .select('id, name');
    
    if (error) {
      throw error;
    }
    
    console.log(`✓ Successfully migrated ${data.length} category(ies) to Supabase\n`);
    
    // Step 6: Verify
    console.log('✅ Migration complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Migrated: ${categories.length} categories`);
    const totalProducts = categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0);
    console.log(`   - Total products: ${totalProducts}`);
    console.log('\n💡 You can now view your data in Supabase dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  } finally {
    await mongoClient.close();
  }
}

// Run the migration
migrateData();

