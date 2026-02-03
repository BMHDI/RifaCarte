import { NextResponse } from "next/server";
import { searchOrganizations } from "@/lib/db";
import { embedQuestion } from "@/lib/embeddings";
import { extractCity } from "@/lib/location";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// 1. Définition de l'outil avec une description plus directive
const tools = [
  {
    function_declarations: [
      {
        name: "search_organizations",
        description:
          "RECHERCHE OBLIGATOIRE pour trouver des organismes, services, activités (enfants, sport, emploi, santé) ou aides locales dans la base de données interne. À utiliser dès que l'utilisateur mentionne un besoin concret ou une ville.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Texte de recherche (ex: 'activités sportives enfants Calgary' ou 'aide emploi francophone')",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
];

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
            parts: [
             {
  text: `Tu es un conseiller expert pour les nouveaux arrivants. Reponds toujours en français de manière chaleureuse et professionnelle et conversationnelle.

  DIRECTIVE ABSOLUE :
  Dès que l'utilisateur mentionne un nom d'organisme (ex: "La cité des Rocheuses"), un besoin (ex: "emploi") ou une ville, tu DOIS appeler immédiatement la fonction 'search_organizations'.

  RÈGLES CRITIQUES :
  1. NE JAMAIS DIRE "Je ne sais pas" ou "Je n'ai pas d'infos sur X" sans avoir lancé une recherche au préalable via la fonction.
  2. Si l'utilisateur donne un nom d'organisme spécifique, utilise ce nom comme paramètre de recherche principal.
  3. Ne devine jamais les services. Utilise uniquement les résultats renvoyés par la fonction.
  4. Pas de doublons dans la même réponse.
  5. Ne dis jamais : "Je vais faire une recherche". Appelle la fonction immédiatement et présente les résultats.
  6. Si la recherche ne donne aucun résultat, suggère alors des services similaires ou demande de préciser la ville.`
}
            ],
          },
        }),
      },
    );

    const firstData = await firstRes.json();
    const candidate = firstData.candidates?.[0];
    const functionCall = candidate?.content?.parts?.find(
      (p: any) => p.functionCall,
    );

    if (functionCall) {
      const { query } = functionCall.functionCall.args;

      const city = extractCity(query);

      const qVec = await embedQuestion(query);
      const rawOrgs = await searchOrganizations(qVec, 5, city ?? undefined);

      // Si aucun résultat n'est trouvé en base de données
      const contextResults =
        rawOrgs?.length > 0 ? rawOrgs : "AUCUN RÉSULTAT TROUVÉ DANS LA BASE.";

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
                parts: [
                  {
                    functionResponse: {
                      name: "search_organizations",
                      response: { result: contextResults },
                    },
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: `Réponds de manière chaleureuse en utilisant uniquement les données de la fonction. Si la liste est vide, dis poliment que tu n'as rien trouvé dans la base de données.
                  essai de poser les bonnes questions pour cibler la recherche de l'utilisateur d une maniere conversationnelle.
                Tjours rappeler toi de la ville ou la region de l'utilisateur.
                 tres important : si tu na pas de villes pose la question donne pas tous les organismes de la province.
                 n utilise pas format ** et -- et == ou tout autre format de ce genre. format propre et lisible.
Quand tu présentes un organisme, utilise ce format :

📍 Nom de l’organisme  
🏙️ Ville  
📌 Services principaux  
📞 Contact (si disponible)  
🌐 Site web (si disponible)
 `,
                },
              ],
            },
          }),
        },
      );

      const finalData = await finalRes.json();
      return NextResponse.json({
        text: finalData.candidates?.[0]?.content?.parts?.[0]?.text,
        sources: rawOrgs
          ? rawOrgs.map((o: any) => ({ name: o.name, id: o.id }))
          : [],
      });
    }

    return NextResponse.json({
      text: candidate?.content?.parts?.[0]?.text,
      sources: [],
    });
  } catch (error: any) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { text: "Désolé, j'ai rencontré un problème technique." },
      { status: 500 },
    );
  }
}
