// app/api/gemini/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("Please set GEMINI_API_KEY in .env");

// Load vectorized orgs JSON
const orgsPath = path.resolve("lib/org_with_vectors.json");
const orgs = JSON.parse(fs.readFileSync(orgsPath, "utf8"));

// Cosine similarity function
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Semantic search: returns top N orgs
function searchOrgs(questionVec, orgs, top = 5) {
  return orgs
    .map((org) => ({ ...org, score: cosineSim(questionVec, org.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

// Embed question using Gemini
async function embedQuestion(question) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: question }] } }),
    }
  );
  const data = await res.json();
  if (!data?.embedding?.values) throw new Error("Embedding failed");
  return data.embedding.values;
}

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json(
        { text: "Erreur : question manquante." },
        { status: 400 }
      );
    }

    // 1️⃣ Embed the user question
    const qVec = await embedQuestion(question);

    // 2️⃣ Search top 5 semantically similar orgs
    const topOrgs = searchOrgs(qVec, orgs, 5);

    // 3️⃣ Prepare prompt for Gemini
    const context =
      topOrgs.length > 0
        ? topOrgs
            .map(
              (o) =>
                `${o.name} (${o.city}): ${o.description || "Pas de description"}`
            )
            .join("\n\n")
        : "";

    const prompt = `
Tu es un assistant pour la communauté francophone en Alberta.
Voici les organismes pertinents pour la question posée :
${context || "Aucun organisme trouvé."}

IMPORTANT :
- Ne parle **que** des organismes listés ci-dessus.
- Ne devine pas d’informations ; si la liste est vide, dis simplement : "Désolé, je n’ai pas trouvé d’organismes pertinents dans la liste."

Réponds de manière naturelle et claire à l'utilisateur.
Question : "${question}"`;

    // 4️⃣ Call Gemini Flash-Lite
    const MAX_RETRIES = 3;
    let attempts = 0;
    let data;
    let lastError;

    while (attempts < MAX_RETRIES) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      data = await res.json();

      if (!data.error || data.error.status !== "UNAVAILABLE") break;

      lastError = data.error;
      attempts++;
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (data?.error) {
      console.error("Gemini API error:", data.error || lastError);
      return NextResponse.json(
        { text: "Erreur lors de la réponse de Gemini." },
        { status: 500 }
      );
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Désolé, je n’ai pas trouvé de réponse.";

    return NextResponse.json({ text, sources: topOrgs.map((o) => o.name) });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { text: "Erreur serveur lors de l'appel à Gemini." },
      { status: 500 }
    );
  }
}
