import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;

/**
 * 1. PRÉ-TRAITEMENT CONDITIONNEL
 * N'utilise l'IA pour enrichir la question QUE si elle est courte ou ambiguë.
 */
async function getOptimizedQuery(messages) {
  const lastMessage = messages[messages.length - 1].content;
  
  // CONDITION : Si la question est longue (> 6 mots), on considère qu'elle a assez de contexte.
  // On gagne ainsi un appel API (environ 1.5s de gain).
  if (lastMessage.split(" ").length > 6 && messages.length === 1) {
    return lastMessage;
  }

  const history = messages.slice(0, -1)
    .map(m => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `
    Transforme cette question en requête de recherche optimisée.
    Historique: ${history || "Aucun"}
    Question: "${lastMessage}"
    
    Tâche : Ajoute des synonymes si le mot est seul (ex: "théâtre" -> "culture, spectacle") 
    et résous les pronoms (ex: "son adresse" -> "adresse de [Nom]").
    Réponse (uniquement la requête) :`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || lastMessage;
  } catch {
    return lastMessage;
  }
}

async function embedQuestion(text) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      task_type: "RETRIEVAL_QUERY",
    }),
  });
  const data = await res.json();
  return data.embedding.values;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Étape 1 : Analyse intelligente (Conditionnelle)
    const searchQuery = await getOptimizedQuery(messages);
    console.log("🔍 Requête finale :", searchQuery);

    // Étape 2 : Vecteur
    const qVec = await embedQuestion(searchQuery);

    // Étape 3 : Recherche Locale
    const orgs = JSON.parse(fs.readFileSync(path.resolve("lib/org_with_vectors.json"), "utf8"));
    const topOrgs = orgs
      .map(o => ({ ...o, score: cosineSim(qVec, o.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = topOrgs.map(o => `${o.name}: ${o.description}`).join("\n\n");

    // Étape 4 : Réponse finale (Flash 2.0 Lite pour la rapidité)
    const geminiHistory = [
      { role: "user", parts: [{ text: `Système: Utilise ces infos pour répondre : ${context}` }] },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }))
    ];

    const finalRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: geminiHistory }),
    });

    const finalData = await finalRes.json();
    return NextResponse.json({ 
      text: finalData.candidates?.[0]?.content?.parts?.[0]?.text,
      sources: topOrgs.map(o => o.name)
    });

  } catch (error) {
    return NextResponse.json({ text: "Erreur serveur" }, { status: 500 });
  }
}