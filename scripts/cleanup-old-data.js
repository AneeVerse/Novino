// Script to clean up old product system data from MongoDB
// Run this with: node scripts/cleanup-old-data.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'novino';

async function cleanupOldData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // 1. Delete old categories (from old system)
    const categoriesResult = await db.collection('categories').deleteMany({});
    console.log(`✓ Deleted ${categoriesResult.deletedCount} old categories`);
    
    // 2. Delete old products (from old system)
    const productsResult = await db.collection('products').deleteMany({});
    console.log(`✓ Deleted ${productsResult.deletedCount} old products`);
    
    // 3. List remaining artefactCategories (new system - KEEP THESE)
    const newCategories = await db.collection('artefactCategories').find({}).toArray();
    console.log(`\n✓ New system has ${newCategories.length} categories (preserved)`);
    
    if (newCategories.length > 0) {
      console.log('\nNew Categories (these are kept):');
      newCategories.forEach(cat => {
        const productCount = cat.products?.length || 0;
        console.log(`  - ${cat.name}: ${productCount} products`);
      });
    }
    
    console.log('\n✅ Cleanup complete! Old data removed, new system data preserved.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the cleanup
cleanupOldData();

