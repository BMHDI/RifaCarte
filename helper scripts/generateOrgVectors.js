import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

if (!process.env.GEMINI_API_KEY ) {
  console.error("Erreur : OPENAI_API_KEY non définie !");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Charger les organisations
const orgs = JSON.parse(fs.readFileSync("./orgs.json", "utf8"));

// Fonction pour créer un texte représentatif de chaque org
function orgToText(org) {
  const locations = org.locations?.map(l => l.city).join(", ");
  return `${org.name}. Services: ${org.services?.join(", ")}. Tags: ${org.tags?.join(", ")}. Catégories: ${org.category?.join(", ")}. Villes: ${locations}`;
}

async function generateVectors() {
  const orgVectors = [];

  for (const org of orgs) {
    const text = orgToText(org);

    try {
      const embeddingResponse = await client.embeddings.create({
        model: "gemini-text-embedding-3-large",
        input: text
      });

      const vector = embeddingResponse.data[0].embedding;
      orgVectors.push({ id: org.id, vector });

      console.log(`✅ Embedding généré pour ${org.name}`);
    } catch (err) {
      console.error(`❌ Erreur pour ${org.name}:`, err.message);
    }
  }

  // Sauvegarder dans un fichier JSON
  fs.writeFileSync("./orgsWithVectors.json", JSON.stringify(orgVectors, null, 2), "utf8");
  console.log("✅ Tous les vecteurs ont été générés et sauvegardés dans orgsWithVectors.json");
}

// Lancer
generateVectors();
