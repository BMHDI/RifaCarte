import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY non définie !");
  process.exit(1);
}

// Load orgs
const orgs = JSON.parse(fs.readFileSync("./orgs.json", "utf8"));

/**
 * Convert one organization into rich semantic text
 */
function orgToText(org) {
  const cities =
    org.locations?.map((l) => l.city).join(", ") || "Alberta";

  const services = org.services?.join(", ") || "Non spécifié";
  const tags = org.tags?.join(", ") || "Aucun";
  const categories = org.category?.join(", ") || "Général";
  const projects = org.projects?.join(", ") || "Aucun";

  const email = org.contact?.email || "Non disponible";
  const phone = org.contact?.phone || "Non disponible";
  const website = org.website || "Non disponible";

  return `
Nom: ${org.name}

Description: ${org.description || "Aucune description"}

Localisation: ${cities}

Services: ${services}

Catégories: ${categories}

Projets: ${projects}

Tags: ${tags}

Contact:
Email: ${email}
Téléphone: ${phone}
Site web: ${website}
`;
}

/**
 * Call Gemini embedding API
 */
async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
        task_type: "RETRIEVAL_DOCUMENT",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();

  return data.embedding.values;
}

/**
 * Main indexing function
 */
async function generateVectors() {
  const results = [];

  for (const org of orgs) {
    try {
      const text = orgToText(org);

      const vector = await embed(text);

      results.push({
        id: org.id,
        name: org.name,
        city: org.locations?.[0]?.city || null,
        category: org.category || [],
        text,
        embedding: vector,
      });

      console.log(`✅ Indexed: ${org.name}`);
    } catch (err) {
      console.error(`❌ ${org.name}:`, err.message);
    }
  }

  fs.writeFileSync(
    "./orgs_index.json",
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log("🎉 Indexation terminée !");
}

// Run
generateVectors();