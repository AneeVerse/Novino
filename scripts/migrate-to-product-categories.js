// Migration script: Rename artefactCategories to productCategories
// and remove old unused collections
// Run this with: node scripts/migrate-to-product-categories.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

async function migrateDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');
    
    const db = client.db(MONGODB_DB);
    
    // 1. Check if artefactCategories collection exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Current collections:', collectionNames.join(', '));
    console.log('');
    
    // 2. Rename artefactCategories to productCategories
    if (collectionNames.includes('artefactCategories')) {
      console.log('🔄 Renaming artefactCategories → productCategories...');
      await db.collection('artefactCategories').rename('productCategories');
      console.log('✓ Collection renamed successfully\n');
    } else if (collectionNames.includes('productCategories')) {
      console.log('✓ productCategories collection already exists (no rename needed)\n');
    } else {
      console.log('⚠️  No artefactCategories collection found (will be created on first use)\n');
    }
    
    // 3. Remove old unused collections
    const oldCollections = ['categories', 'products'];
    
    for (const collectionName of oldCollections) {
      if (collectionNames.includes(collectionName)) {
        console.log(`🗑️  Dropping old collection: ${collectionName}...`);
        await db.collection(collectionName).drop();
        console.log(`✓ ${collectionName} collection removed`);
      }
    }
    
    console.log('');
    
    // 4. Verify new structure
    const updatedCollections = await db.listCollections().toArray();
    const updatedNames = updatedCollections.map(c => c.name);
    
    console.log('📋 Updated collections:', updatedNames.join(', '));
    console.log('');
    
    // 5. Count documents in productCategories
    if (updatedNames.includes('productCategories')) {
      const count = await db.collection('productCategories').countDocuments();
      console.log(`📦 productCategories has ${count} category(ies)`);
      
      if (count > 0) {
        const categories = await db.collection('productCategories').find({}).toArray();
        console.log('\n✅ Your categories:');
        categories.forEach(cat => {
          const productCount = cat.products?.length || 0;
          console.log(`  - ${cat.name}: ${productCount} product(s)`);
        });
      }
    }
    
    console.log('\n✅ Migration complete!');
    console.log('📝 Next step: Update your code to use "productCategories" collection name');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
migrateDatabase();

