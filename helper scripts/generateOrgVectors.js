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
  const cities = org.locations?.map(l => l.city).join(" et ") || "l'Alberta";
  const services = org.services?.join(", ");
  const tags = org.tags?.join(", ");

  
  // On crée une phrase que l'IA peut "comprendre" sémantiquement
  return `L'organisme ${org.name} est situé à ${cities}. 
          Il offre des services de ${services}. leur tags sont ${tags}.
          Ses domaines d'expertise incluent ${org.category?.join(", ")}.
          leur projets sont ${org.projects?.join(", ")}
          Description: ${org.description} leur contact information sont ${org.contact?.email} et ${org.contact?.phone} et leurs site web est ${org.website}. `
}

async function generateVectors() {
  const orgVectors = [];

  for (const org of orgs) {
    const text = orgToText(org);

    try {
      const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${API_KEY}`, {
    method: "POST",
    body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text }] },
        task_type: "RETRIEVAL_DOCUMENT", // Crucial pour l'indexation
        title: org.name // Optionnel mais aide pour les titres d'organismes
    })
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
