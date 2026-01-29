// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  sanitizeQuestion,
  detectIntent,
  filterOrgsByIntent,
  Org,
  Intent,
} from "@/lib/intent";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("Please set GEMINI_API_KEY in .env");

// Load vectorized orgs JSON
const orgsPath = path.resolve("lib/org.json");
const orgs: Org[] = JSON.parse(fs.readFileSync(orgsPath, "utf8"));

// Cosine similarity function
function cosineSim(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Semantic search: returns top N orgs
function searchOrgs(questionVec: number[], orgs: Org[], top = 5) {
  return orgs
    .map((org: any) => ({ ...org, score: cosineSim(questionVec, org.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

// Embed question using Gemini
async function embedQuestion(question: string): Promise<number[]> {
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

// --- POST route ---
export async function POST(req: NextRequest) {
  try {
    const { question, history = [] } = (await req.json()) as {
      question: string;
      history?: { role: "user" | "ai"; text: string }[];
    };

    if (!question) {
      return NextResponse.json(
        { text: "Erreur : question manquante." },
        { status: 400 }
      );
    }

    // 1️⃣ Sanitize + detect intent
    const cleanQuestion = sanitizeQuestion(question);
    const intent: Intent = detectIntent(cleanQuestion);
    console.log("Detected intent:", intent);

    // 2️⃣ Filter orgs by intent
    const filteredOrgs = filterOrgsByIntent(intent, orgs);

    if (filteredOrgs.length === 0) {
      return NextResponse.json({
        text: "Désolé, je n’ai pas trouvé d’organismes pertinents dans la liste.",
        sources: [],
        state: { history },
      });
    }

    // 3️⃣ Embed sanitized question
    const qVec = await embedQuestion(cleanQuestion);

    // 4️⃣ Semantic ranking only on filtered orgs
    const topOrgs = searchOrgs(qVec, filteredOrgs, 5);

    // 5️⃣ Prepare full org context
    const context = topOrgs
      .map((o) => {
        const loc = o.locations?.[0];
        return `
Nom: ${o.name}
Ville: ${o.city ?? loc?.city ?? "Non précisée"}
Adresse: ${loc?.address ?? "Non précisée"}
Téléphone: ${o.contact?.phone ?? "Non précisé"}
Site Web: ${o.website ?? "Non précisé"}
Catégories: ${Array.isArray(o.category) ? o.category.join(", ") : o.category ?? "Non précisé"}
Services: ${o.services?.join(", ") ?? "Non précisés"}
        `.trim();
      })
      .join("\n\n");

    // 6️⃣ Build Gemini prompt
    const chatContents = [
      ...history.map((m) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Tu es un assistant francophone pour la communauté en Alberta.

Voici les organismes pertinents pour la question posée :
${context}

IMPORTANT :
- Toujours savoir à quelle ville l'utilisateur est intéressé avant de répondre.
- Ne parle **que** des organismes listés ci-dessus.
- Ne devine pas d’informations ; si la liste est vide, dis simplement : "Désolé, je n’ai pas trouvé d’organismes pertinents dans la liste."

Réponds de manière naturelle et claire à l'utilisateur.
Question : "${question}"`,
          },
        ],
      },
    ];

    // 7️⃣ Call Gemini Flash-Lite
    const MAX_RETRIES = 3;
    let attempts = 0;
    let data: any;
    let lastError: any;

    while (attempts < MAX_RETRIES) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: chatContents }),
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

    // 8️⃣ Return response + updated history
    const updatedHistory = [
      ...history,
      { role: "user", text: question },
      { role: "model", text },
    ];

    return NextResponse.json({
      text,
      sources: topOrgs.map((o) => o.name),
      state: { history: updatedHistory },
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { text: "Erreur serveur lors de l'appel à Gemini." },
      { status: 500 }
    );
  }
}
