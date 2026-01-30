import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const data = JSON.parse(fs.readFileSync('./orgs.json', 'utf8'));

async function enrichData() {
  console.log("🚀 Starting full data enrichment...");

  for (const org of data) {
    // 1. Build a much more detailed text block for the AI
    const projectDetails = org.projects?.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None';
    
    const aiContext = `
Name: ${org.name}
Director: ${org.director?.name} (${org.director?.title})
Description: ${org.description}
Services: ${org.services?.join(', ') || 'N/A'}
Target Audience: ${org.audience}
Categories: ${org.category?.join(', ')}
Tags: ${org.tags?.join(', ')}
Projects:
${projectDetails}
Member of: ${org.memberOf?.join(', ') || 'N/A'}
Contact: ${org.contact?.email} | ${org.contact?.phone} | ${org.contact?.website}
    `.trim();

    // 2. Update Supabase with every available field
    const { error } = await supabase
      .from('organizations')
      .update({
        description: org.description,
        services: org.services || [],
        audience: org.audience,
        categories: org.category || [],
        tags: org.tags || [],
        members: org.memberOf || [],
        
        // Director info
        director_name: org.director?.name || null,
        director_title: org.director?.title || null,
        
        // Project info (storing as JSONB or string)
        projects: org.projects || [], 
        
        // Location info
        city: org.locations?.[0]?.city || null,
        address: org.locations?.[0]?.address || null,
        lat: org.locations?.[0]?.lat || null,
        lng: org.locations?.[0]?.lng || null,
        
        // Contact info
        email: org.contact?.email || null,
        phone: org.contact?.phone || null,
        website: org.contact?.website || null,
        
        // The "Brain" for Gemini
        content: aiContext 
      })
      .eq('id', org.id);

    if (error) {
      console.error(`❌ Failed: ${org.name} -> ${error.message}`);
    } else {
      console.log(`✅ Fully Enriched: ${org.name}`);
    }
  }

  console.log("🎉 All information synced to Supabase!");
}

enrichData();