import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Load the file
const data = JSON.parse(fs.readFileSync('./org_with_vectors.json', 'utf8'));

async function pushData() {
  console.log(`🚀 Preparing to push ${data.length} records to Supabase...`);

  const payload = data.map((org, index) => {
    // 1. IMPROVED ID LOGIC: Look for 'id', then 'orgId', then fallback to a slug
    const finalId = org.id || org.orgId || org.ID;

    if (!finalId) {
      console.warn(
        `⚠️ Warning: Record at index ${index} (${org.name}) has no ID. Creating fallback.`
      );
    }

    return {
      // If no ID exists, we generate one based on the name to avoid NULL errors
      id: finalId || org.name?.toLowerCase().replace(/\s+/g, '-') || `org-${index}`,
      name: org.name || 'Unknown Name',
      description: org.description || null,
      category: org.category || [],
      services: org.services || [],
      audience: org.audience || null,
      tags: org.tags || [],
      members: org.memberOf || [],

      // Location data
      city: org.locations?.[0]?.city || null,
      address: org.locations?.[0]?.address || null,
      lat: org.locations?.[0]?.lat || null,
      lng: org.locations?.[0]?.lng || null,

      // Contact info
      email: org.contact?.email || null,
      phone: org.contact?.phone || null,
      website: org.contact?.website || null,

      // NEW FIELDS
      embedding: org.embedding || null,
      content: org.text_content || org.text || null,

      // JSONB fields
      director: org.director || null,
      projects: org.projects || [],
    };
  });

  // Check if any embeddings are missing before pushing
  const missingEmbeddings = payload.filter((p) => !p.embedding).length;
  if (missingEmbeddings > 0) {
    console.warn(`⚠️ Warning: ${missingEmbeddings} records are missing embeddings!`);
  }

  // 2. Perform Bulk Upsert
  const { error } = await supabase.from('organizations').upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('❌ Bulk Push Failed:', error.message);
    console.error('Details:', error.details);
  } else {
    console.log(`✅ Success! All ${payload.length} organizations are now in Supabase.`);
  }
}

pushData();
