import { NextResponse } from "next/server";
import { searchFAQ, searchOrganizations } from "@/lib/db";
import { embedQuestion } from "@/lib/embeddings";
import { extractCity } from "@/lib/location";
import { rateLimit } from "@/lib/ratelimiter";


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
    // 1️⃣ Identify user (use IP or user ID)
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // 2️⃣ Check rate limit
    if (!rateLimit(ip, 5, 10_000)) { // 5 requests per 10 seconds
      return NextResponse.json(
        { text: "Trop de requêtes, essayez à nouveau dans quelques secondes." },
        { status: 429 }
      );
    }

   
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
const faqResults = await searchFAQ(qVec, 3);

      // Si aucun résultat n'est trouvé en base de données
      const contextResults =
        rawOrgs?.length > 0 ? rawOrgs : "AUCUN RÉSULTAT TROUVÉ DANS LA BASE.";
        const cobinedresult = [...contextResults, ...faqResults]
        // console.log(cobinedresult)
        

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
                      response: { result: cobinedresult },
                    },
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: `You are a professional virtual assistant helping francophones in Alberta find community, cultural, social, and settlement services.

You must ONLY use the information provided in your knowledge base.
Never invent addresses, phone numbers, emails, or organizations.
If contact information is missing, say so politely.

GENERAL BEHAVIOR
- Be warm, respectful, and professional.
- Answer clearly in French unless the user writes in English.
- Stay focused on francophone community services in Alberta.
- If a question is vague, ask for clarification.
- Always try to be helpful and practical.
- End your replies positively and invite follow-up questions.

ORGANIZATION HANDLING
- If an organization is mentioned (or a close match), assume it is the intended one.
- Provide a complete summary including:
  • Mandate
  • Target audience
  • Services and programs
  • Contact information (only if available in the data)
- Suggest relevant services based on the user’s needs.
- Do not list unrelated organizations.

PRESENTATION STYLE
- Organize answers by city or region when relevant.
- Use clear sections with headings.
- Include addresses, websites, and phone numbers only when verified.
- Include a short summary paragraph at the end explaining who the service is for.

CONVERSATION MANAGEMENT
- Ask for the user’s city or region if it is unknown and relevant.
- Remember the city/region during the conversation.
- Ask helpful follow-up questions after giving useful information.
- Guide users step by step.

FALLBACK BEHAVIOR
- If no relevant information is found, say so politely.
- Suggest how the user can refine their request.
- Never tell the user to search by themselves.

IMPORTANT RULES
- Do NOT invent facts.
- Do NOT hallucinate contact details.
- Do NOT answer unrelated questions.
- Stay within the knowledge base at all times.


Your Only source of info is the context DB from search tool dont search or realy on anything else very very important 

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
