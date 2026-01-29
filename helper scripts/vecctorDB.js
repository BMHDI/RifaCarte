// ChatWithGemini.js
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Please set GEMINI_API_KEY in your .env file");
}

// Load your JSON list
const orgsFile = "orgs.json";
const orgs = JSON.parse(fs.readFileSync(orgsFile, "utf8"));

// Convert an org to text
function buildText(org) {
  return `
Name: ${org.name}
City: ${org.city}
Categories: ${org.category ? org.category.join(", ") : ""}
Description: ${org.description}
`.trim();
}

// Embed function with error handling
async function embed(text) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] },
        }),
      }
    );

    const data = await res.json();

    if (!data || !data.embedding || !data.embedding.values) {
      console.error("Embedding failed:", data);
      return null;
    }

    return data.embedding.values; // 768 dims
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

// Process orgs one by one
async function main() {
  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];

    // Skip if already embedded
    if (org.embedding) continue;

    const text = buildText(org);
    const vec = await embed(text);

    if (vec) {
      org.embedding = vec;
      console.log(`${i + 1}/${orgs.length} Embedded: ${org.name}`);
    } else {
      console.log(`${i + 1}/${orgs.length} Failed: ${org.name}`);
    }

    // Optional pause to be safe with quota
    await new Promise((r) => setTimeout(r, 100));
  }

  // Save new JSON with embeddings
  const outFile = "org_with_vectors.json";
  fs.writeFileSync(outFile, JSON.stringify(orgs, null, 2));
  console.log("All embeddings saved to", outFile);
}

main();