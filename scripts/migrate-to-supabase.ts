import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase setup - use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Important: use service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'prompt-game';
const FOLDER_PATH = 'puns';
const LOCAL_IMAGES_DIR = path.join(process.cwd(), 'public', 'game-images', 'puns');

async function updateDatabaseUrls() {
  console.log('🚀 Starting database URL updates using Supabase client...');

  try {
    // Get image files
    const imageFiles = fs.readdirSync(LOCAL_IMAGES_DIR)
      .filter(file => file.match(/\.(png|jpg|jpeg|gif)$/i));
      
    console.log(`Found ${imageFiles.length} local image files`);
    
    // Fetch all records from the database table
    const { data: allImages, error } = await supabase
      .from('generative-art_game_image')  // Use the actual table name
      .select('*');
      
    if (error) {
      console.error('Error fetching images:', error);
      return;
    }
    
    console.log(`Found ${allImages.length} records in database`);

    let successCount = 0;
    let failCount = 0;

    for (const file of imageFiles) {
      try {
        // Get base filename without extension
        const fileBase = path.parse(file).name; // e.g., "cat_nap" from "cat_nap.png"
        
        // Find the corresponding record
        const matchingRecord = allImages.find(img => {
          const oldPath = img.image_path;
          return oldPath.includes(fileBase);
        });
        
        if (!matchingRecord) {
          console.warn(`⚠️ No database record found for image: ${file}`);
          failCount++;
          continue;
        }
        
        // Construct the new Supabase URL
        const newUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${FOLDER_PATH}/${file}`;
        
        console.log(`Updating record ID ${matchingRecord.id}:`);
        console.log(`  Old path: ${matchingRecord.image_path}`);
        console.log(`  New URL: ${newUrl}`);
        
        // Update the database record using Supabase client
        const { error: updateError } = await supabase
          .from('generative-art_game_image')  // Use the actual table name
          .update({ image_path: newUrl })
          .eq('id', matchingRecord.id);
        
        if (updateError) {
          console.error(`❌ Error updating record ID ${matchingRecord.id}:`, updateError);
          failCount++;
          continue;
        }
        
        console.log(`✅ Updated record ID ${matchingRecord.id}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error);
        failCount++;
      }
    }

    console.log('\n🏁 Update Summary:');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed to update: ${failCount}`);
  } catch (error) {
    console.error('Error during update process:', error);
  }
}

// Execute the update
updateDatabaseUrls()
  .catch(error => {
    console.error('Unhandled error during update:', error);
  })
  .finally(() => {
    console.log('Update process completed');
  });