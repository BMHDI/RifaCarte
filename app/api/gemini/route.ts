import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Définition de l'outil avec une description plus directive
const tools = [
  {
    function_declarations: [
      {
        name: "search_organizations",
        description: "RECHERCHE OBLIGATOIRE pour trouver des organismes, services, activités (enfants, sport, emploi, santé) ou aides locales dans la base de données interne. À utiliser dès que l'utilisateur mentionne un besoin concret ou une ville.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Texte de recherche (ex: 'activités sportives enfants Calgary' ou 'aide emploi francophone')",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
];

async function embedQuestion(text: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        task_type: "RETRIEVAL_QUERY",
      }),
    },
  );
  const data = await res.json();
  if (!data.embedding) throw new Error("Erreur d'embedding");
  return data.embedding.values;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // ÉTAPE 1 : Appel avec des instructions système strictes
    const firstRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          tools,
          systemInstruction: {
            parts: [{ text: `Tu es un conseiller expert pour les nouveaux arrivants. 
            RÈGLE CRITIQUE : Ne devine jamais les services. Si l'utilisateur demande une aide, un emploi, une activité ou un organisme, tu DOIS appeler la fonction 'search_organizations'. 
            N'utilise tes connaissances générales que pour les salutations ou les politesses. 
            Dès qu'une ville (ex: Calgary) et un besoin (ex: sport) sont identifiés, lance la recherche.
            me j amais dit Pour trouver les infos , je dois effectuer une recherche. Veuillez patienter un instant. tu dois appeler la fonction 'search_organizations immidiatement'.` }]
          }
        }),
      }
    );

    const firstData = await firstRes.json();
    const candidate = firstData.candidates?.[0];
    const functionCall = candidate?.content?.parts?.find((p: any) => p.functionCall);

    if (functionCall) {
      const { query } = functionCall.functionCall.args;
      
      const qVec = await embedQuestion(query);
      const { data: rawOrgs, error } = await supabase.rpc("match_organizations", {
        query_embedding: qVec,
        match_count: 5,
      });

      if (error) throw error;

      // Si aucun résultat n'est trouvé en base de données
      const contextResults = rawOrgs?.length > 0 ? rawOrgs : "AUCUN RÉSULTAT TROUVÉ DANS LA BASE.";

      const finalRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...contents,
              candidate.content,
              {
                role: "function",
                parts: [{
                  functionResponse: {
                    name: "search_organizations",
                    response: { result: contextResults }
                  }
                }]
              }
            ],
            systemInstruction: {
              parts: [{ text: `Réponds de manière chaleureuse en utilisant uniquement les données de la fonction. Si la liste est vide, dis poliment que tu n'as rien trouvé dans la base de données. 
Quand tu présentes un organisme, utilise ce format :

📍 Nom de l’organisme  
🏙️ Ville  
📌 Services principaux  
📞 Contact (si disponible)  
🌐 Site web (si disponible)
 ` }]
            }
          }),
        }
      );

      const finalData = await finalRes.json();
      return NextResponse.json({
        text: finalData.candidates?.[0]?.content?.parts?.[0]?.text,
        sources: rawOrgs ? rawOrgs.map((o: any) => ({ name: o.name, id: o.id })) : [],
      });
    }

    return NextResponse.json({
      text: candidate?.content?.parts?.[0]?.text,
      sources: [],
    });

  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json({ text: "Désolé, j'ai rencontré un problème technique." }, { status: 500 });
  }
}