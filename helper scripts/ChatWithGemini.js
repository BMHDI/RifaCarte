// ChatWithGemini.js
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Google Gemini API key

if (!GEMINI_API_KEY) {
  throw new Error("Veuillez définir GEMINI_API_KEY dans votre .env");
}

// Charger les organisations
const orgs = JSON.parse(fs.readFileSync("./orgs.json", "utf8"));

// Fonction simple pour trouver les organisations pertinentes par mot-clé
function searchOrgs(query, topN = 5) {
  const normalizedQuery = query.toLowerCase();

  // Score = nombre de mots du query présents dans le nom, services, tags
  const scoredOrgs = orgs.map((org) => {
    let score = 0;
    const fields = [
      org.name,
      ...(org.services || []),
      ...(org.tags || []),
      ...(org.category || []),
    ].join(" ").toLowerCase();

    const queryWords = normalizedQuery.split(/\s+/);
    queryWords.forEach((w) => {
      if (fields.includes(w)) score += 1;
    });

    return { org, score };
  });

  // Trier et retourner les top N
  return scoredOrgs
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((o) => o.org);
}

// Fonction principale du chatbot
async function chatAvecOrgs(userQuery) {
  // 1️⃣ Récupérer les top organisations
  const topOrgs = searchOrgs(userQuery, 5);

  // 2️⃣ Construire le prompt en français
  const orgDescriptions = topOrgs
    .map(
      (o) =>
        `${o.name}. Services: ${o.services?.join(
          ", "
        )}. Tags: ${o.tags?.join(", ")}. Catégories: ${o.category?.join(
          ", "
        )}. Villes: ${o.locations?.map((l) => l.city).join(", ")}`
    )
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content:
        "Vous êtes un assistant francophone aidant à trouver des organisations francophones en Alberta. Répondez de manière naturelle et conversationnelle.",
    },
    {
      role: "user",
      content: `Utilisateur : "${userQuery}"\nVoici les organisations pertinentes :\n${orgDescriptions}`,
    },
  ];

  // 3️⃣ Appeler l'API Gemini
  const res = await fetch(
    "https://gemini.googleapis.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-turbo",
        messages,
        temperature: 0.7,
        max_output_tokens: 400,
      }),
    }
  );

  const data = await res.json();

  if (data.choices && data.choices.length > 0) {
    console.log(data.choices[0].message.content);
  } else {
    console.log("Aucune réponse de Gemini");
  }
}

// Exemple d'utilisation
(async () => {
  await chatAvecOrgs(
    "Je cherche du soutien pour les aînés francophones à Edmonton"
  );
})();
