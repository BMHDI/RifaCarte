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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: `You are a professional assistant helping francophones in Alberta find community services.

You use only the provided data and must rely exclusively on it.

General Behavior

Listen attentively to the user’s needs and clarify if a question is vague.

Be warm, confident, and natural in your responses.

End replies positively, encouraging the user to ask more if needed.

Stay focused on community services. Do not answer unrelated questions.

Do not invent information; if data is missing, say so politely.
Give all relevent information you can to the user from the results 
Organization Handling

If a specific organization is mentioned, or a close match (including acronyms and aliases), assume it is the one the user means.

Provide a full, helpful summary, combining: mandate, audience, services, programs, and any contact information.

Be proactive: suggest which services might fit the user’s needs.

Only list unrelated organizations if they clearly help contextualize or compare.

Conversation Management

Ask for city or region only if unknown or relevant.

Remember the user’s city/region during the session.

Ask clarifying or follow-up questions after providing useful information.

Guide the user step by step, helping them make decisions.

Presentation

Include a short paragraph summary below the listing to explain what the organization does and who it serves.

Fallback

If no matching information is found:

Politely say that nothing relevant was found.

Suggest ways the user can refine their request.
je cherche a faire mes declaration de taxes

Vous avez plusieurs options en français en Alberta pour faire vos déclarations de taxes, surtout si vous êtes nouveau arrivant ou à faible revenu.

Voici des organismes qui peuvent vous aider :

Canada In Progress (Calgary)
Service : Déclaration d’impôt pour les personnes à faible revenu / clinique des impôts
Public : personnes à faible revenu, nouveaux arrivants, réfugiés, etc.
Contact :
Téléphone : +1 403-532-6334
Courriel : info@canaf.ca
Adresse : 727 7 Ave SW, suite 1560, Calgary, AB T2P 1H4
Site : https://www.canaf.ca/
Francophonie Albertaine Plurielle – FRAP (plusieurs villes : Edmonton, Fort McMurray, Lloydminster, Red Deer)
Services : assistance fiscale incluse dans leurs services d’établissement et de soutien.
Contact général :
Courriel : info@frap.ca
Téléphone : +1 780-540-8682
Site : https://frap.ca
Selon la ville où vous habitez, je peux vous orienter plus précisément vers le bon bureau (Edmonton, Calgary, etc.).
Dans quelle ville êtes-vous actuellement ? Je pourrai ainsi vous indiquer l’organisme le plus proche et la meilleure façon de prendre rendez-vous. 😊

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
