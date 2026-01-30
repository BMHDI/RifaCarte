import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Convertir la question en vecteur
async function embedQuestion(text: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] }, task_type: "RETRIEVAL_QUERY" }),
  });
  const data = await res.json();
  if (!data.embedding) throw new Error("Erreur d'embedding");
  return data.embedding.values;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    // Étape 1 : Créer le vecteur de recherche
    const qVec = await embedQuestion(lastUserMessage);

    // Étape 2 : Recherche dans Supabase
    const { data: rawOrgs, error } = await supabase.rpc("match_organizations", {
      query_embedding: qVec,
      match_count: 5,
    });

    if (error) throw error;

    // Étape 3 : Construire le contexte textuel
    // IMPORTANT: On vérifie o.content, o.description ET o.services
    const context = (rawOrgs || []).map((o: any) => `
NOM: ${o.name}
VILLE: ${o.city || "Alberta"}
SERVICES: ${Array.isArray(o.services) ? o.services.join(", ") : (o.services || "Non spécifié")}
DESCRIPTION: ${o.content || o.description || "Pas de description détaillée"}
CONTACT: ${o.phone || ""} | ${o.website || ""}
`).join("\n---\n");

    // LOG DE DEBUG : Vérifiez votre console serveur pour voir si 'context' contient du texte !
    console.log("--- CONTEXTE RÉCUPÉRÉ ---");
    console.log(context);

    // Étape 4 : Préparer l'historique pour Gemini
    const conversationHistory = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Étape 5 : L'INJECTION DE FORCE (On met les données à la fin)
    const finalInstruction = {
      role: "user",
      parts: [{
        text: `Voici les informations extraites de notre base de données pour répondre à la question : "${lastUserMessage}".
        
        DONNÉES :
        ${context}

        INSTRUCTIONS :
        1. Utilise UNIQUEMENT les données ci-dessus.
        2. Si un organisme offre des services d'intégration ou LINC, présente-le comme une option pour les cours de langue.
        3. Sois précis sur les noms et les villes.
        4. Réponds en français de manière chaleureuse.`
      }]
    };

    const contents = [...conversationHistory, finalInstruction];

    // Étape 6 : Appel Gemini 2.0
    const finalRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const finalData = await finalRes.json();
    const aiResponse = finalData.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      text: aiResponse || "Je n'ai pas trouvé d'informations précises dans le répertoire.",
      sources: rawOrgs.map((o: any) => ({ name: o.name, id: o.id })),
    });

  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json({ text: "Erreur technique" }, { status: 500 });
  }
}