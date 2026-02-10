import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function linkImagesFromBucket() {
  const bucketName = 'images';
  console.log('🚀 Linking images from bucket...');

  const { data: files, error: listError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 1000 });

  if (listError) return console.error('❌ Error listing files:', listError.message);

  console.log(`Found ${files.length} files in the bucket`);

  for (const file of files) {
    const orgId = file.name.split('.')[0];

    // Build public URL manually (works for public bucket)
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${file.name}`;
    console.log(`File: ${file.name}, Org ID: ${orgId}, Public URL: ${publicUrl}`);

    const { error: dbError } = await supabase
      .from('organizations')
      .update({ image_url: publicUrl })
      .eq('id', orgId);

    if (dbError) {
      console.error(`❌ Failed to update org ID ${orgId}:`, dbError.message);
    } else {
      console.log(`✅ Updated org ID ${orgId} with image URL`);
    }
  }

  console.log('🎉 Done linking images!');
}

linkImagesFromBucket();
