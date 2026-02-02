import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';


dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Load JSON data
const data = JSON.parse(fs.readFileSync('./orgs.json', 'utf8'));

async function enrichData() {
  console.log("🚀 Starting full data enrichment...");

  for (const org of data) {
    // Build detailed content
    const projectDetails = org.projects?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None';

    const aiContext = `
Name: ${org.name}
Director: ${org.director?.name ?? 'N/A'} (${org.director?.title ?? 'N/A'})
Description: ${org.description ?? 'N/A'}
Services: ${org.services?.join(', ') ?? 'N/A'}
Target Audience: ${org.audience ?? 'N/A'}
Categories: ${org.category?.join(', ') ?? 'N/A'}
Tags: ${org.tags?.join(', ') ?? 'N/A'}
Projects:
${projectDetails}
Member of: ${org.memberOf?.join(', ') ?? 'N/A'}
Contact: ${org.contact?.email ?? 'N/A'} | ${org.contact?.phone ?? 'N/A'} | ${org.contact?.website ?? 'N/A'}
Region: ${org.region ?? 'N/A'}
    `.trim();

    // Update Supabase
    const { error } = await supabase
      .from('organizations')
      .update({
        description: org.description ?? null,
        services: org.services ?? [],
        audience: org.audience ?? null,
        category: org.category ?? [],
        tags: org.tags ?? [],
        members: org.memberOf ?? [],
        director: org.director ?? null,
        projects: org.projects ?? [],
        city: org.locations?.[0]?.city ?? null,
        address: org.locations?.[0]?.address ?? null,
        lat: org.locations?.[0]?.lat ?? null,
        lng: org.locations?.[0]?.lng ?? null,
        email: org.contact?.email ?? null,
        phone: org.contact?.phone ?? null,
        website: org.contact?.website ?? null,
        region: org.region ?? null,
        content: aiContext
      })
      .eq('id', org.id);

    if (error) {
      console.error(`❌ Failed: ${org.name} -> ${error.message}`);
    } else {
      console.log(`✅ Fully Enriched: ${org.name}`);
    }
  }

  console.log("🎉 All organizations synced to Supabase!");
}

// Run the script
enrichData();
