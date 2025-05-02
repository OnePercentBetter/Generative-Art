import { db } from "../src/server/db";
import { gameImages } from "../src/server/db/schema";

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...');
    
    // Add this at the beginning of your testSupabaseConnection function
    const connectionString = process.env.DATABASE_URL || 'not set';
    console.log('Connection string being used:', connectionString.replace(/:[^:]*@/, ':******@'));
    
    // Test a simple query to check connection
    const results = await db.select().from(gameImages).limit(5);
    
    console.log(`✅ Successfully connected to database and found ${results.length} records`);
    
    if (results.length > 0) {
      console.log('\n📷 First few image records:');
      results.forEach((image, index) => {
        console.log(`\nImage ${index + 1}:`);
        console.log(`  ID: ${image.id}`);
        console.log(`  Path: ${image.imagePath}`);
        
        // Check if the path is a Supabase URL
        const isSupabaseUrl = image.imagePath.includes('supabase.co/storage/v1/object/public');
        console.log(`  Is Supabase URL: ${isSupabaseUrl ? '✅ Yes' : '❌ No'}`);
        
        if (Array.isArray(image.targetWords)) {
          console.log(`  Target words: ${image.targetWords.join(', ')}`);
        }
      });
      
      // Test if the images are actually accessible by making a HEAD request to the first image
      if (results[0] && results[0].imagePath.startsWith('http')) {
        console.log('\n🌐 Testing image accessibility...');
        
        try {
          const response = await fetch(results[0].imagePath, { method: 'HEAD' });
          console.log(`  Status: ${response.status} ${response.statusText}`);
          console.log(`  Image accessible: ${response.ok ? '✅ Yes' : '❌ No'}`);
          
          if (response.headers) {
            console.log('  Content-Type:', response.headers.get('content-type'));
            console.log('  Content-Length:', response.headers.get('content-length'));
          }
        } catch (error) {
          console.error('  ❌ Error accessing image:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error connecting to Supabase database:', error);
  } finally {
    // Close the connection pool
    process.exit(0);
  }
}

// Run the test
testSupabaseConnection();