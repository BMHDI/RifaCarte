// ChatWithGemini.js
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Please set GEMINI_API_KEY in your .env file");
}

const orgsFile = "orgs.json";
const orgs = JSON.parse(fs.readFileSync(orgsFile, "utf8"));

/**
 * IMPROVED: This function creates a comprehensive text block.
 * When the user searches, the vector will now "know" about
 * services, audience, projects, and tags.
 */
function buildText(org) {
  const services = org.services ? org.services.join(", ") : "N/A";
  const categories = org.category ? org.category.join(", ") : "N/A";
  const tags = org.tags ? org.tags.join(", ") : "";
  const projects = org.projects ? org.projects.map(p => `${p.name}: ${p.description}`).join(". ") : "";
  const city = org.locations?.[0]?.city || org.city || "Alberta";

  return `
Name: ${org.name}
City: ${city}
Categories: ${categories}
Description: ${org.description}
Services Offered: ${services}
Target Audience: ${org.audience || "General Public"}
Projects: ${projects}
Tags: ${tags}
`.trim();
}

async function embed(text) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] },
          task_type: "RETRIEVAL_DOCUMENT" // Optimized for document storage
        }),
      }
    );

    const data = await res.json();
    return data.embedding?.values || null;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

async function main() {
  console.log(`Starting embedding for ${orgs.length} organizations...`);

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];

    // Build the rich text block
    const textToEmbed = buildText(org);
    const vec = await embed(textToEmbed);

    if (vec) {
      org.embedding = vec;
      // We also store the flattened text in 'content' to make it 
      // easy to display in the AI response context later
      org.text_content = textToEmbed; 
      console.log(`✅ [${i + 1}/${orgs.length}] Embedded: ${org.name}`);
    } else {
      console.log(`❌ [${i + 1}/${orgs.length}] Failed: ${org.name}`);
    }

    // Safety delay for rate limits
    await new Promise((r) => setTimeout(r, 150));
  }

  const outFile = "org_with_vectors.json";
  fs.writeFileSync(outFile, JSON.stringify(orgs, null, 2));
  console.log(`🎉 Finished! Saved to ${outFile}`);
}

main();