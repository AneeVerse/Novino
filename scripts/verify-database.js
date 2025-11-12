// Verification script: Check database structure
// Run this with: node scripts/verify-database.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

async function verifyDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');
    
    const db = client.db(MONGODB_DB);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Current Collections in Database:');
    console.log('═'.repeat(50));
    collectionNames.forEach(name => {
      if (name === 'productCategories') {
        console.log(`✅ ${name} (NEW - Active)`);
      } else if (name === 'artefactCategories') {
        console.log(`⚠️  ${name} (OLD - Should be renamed)`);
      } else if (name === 'categories' || name === 'products') {
        console.log(`❌ ${name} (OLD - Should be deleted)`);
      } else {
        console.log(`📦 ${name}`);
      }
    });
    console.log('═'.repeat(50));
    console.log('');
    
    // Check productCategories
    if (collectionNames.includes('productCategories')) {
      const count = await db.collection('productCategories').countDocuments();
      console.log(`✅ productCategories: ${count} category(ies)`);
      
      if (count > 0) {
        const categories = await db.collection('productCategories').find({}).toArray();
        console.log('\n📦 Your Categories:');
        categories.forEach(cat => {
          const productCount = cat.products?.length || 0;
          console.log(`   - ${cat.name}: ${productCount} product(s)`);
        });
      } else {
        console.log('   (Empty - ready for your first category!)');
      }
    } else {
      console.log('⚠️  productCategories collection not found (will be created on first use)');
    }
    
    console.log('');
    
    // Check for old collections
    const oldCollections = collectionNames.filter(name => 
      name === 'artefactCategories' || name === 'categories' || name === 'products'
    );
    
    if (oldCollections.length > 0) {
      console.log('⚠️  Old collections still present:');
      oldCollections.forEach(name => console.log(`   - ${name}`));
      console.log('\n💡 Run: node scripts/migrate-to-product-categories.js');
    } else {
      console.log('✅ No old collections found - database is clean!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the verification
verifyDatabase();

