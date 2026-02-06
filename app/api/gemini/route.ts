import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage, ToolMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

import { searchFAQ, searchOrganizations } from "@/lib/db";
import { embedQuestion } from "@/lib/embeddings";
import { extractCity } from "@/lib/location";
import { rateLimit } from "@/lib/ratelimiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 5, 10_000)) {
      return NextResponse.json({ text: "Trop de requêtes. Réessayez dans 10s." }, { status: 429 });
    }

    const { messages } = await req.json();
    let usedSources: any[] = [];

    // 2. Outil de recherche avec gestion de contexte
    const searchTool = new DynamicStructuredTool({
      name: "search_organizations",
      description: "RECHERCHE OBLIGATOIRE pour trouver des organismes, services ou aides locales en Alberta.",
      schema: z.object({ query: z.string() }),
      func: async ({ query }) => {
        const city = extractCity(query);
        const qVec = await embedQuestion(query);
        
        const [orgs, faq] = await Promise.all([
          searchOrganizations(qVec, 10, city ?? undefined), // Augmenté pour donner plus de choix à l'IA
          searchFAQ(qVec, 3)
        ]);

        if (orgs) usedSources = [...usedSources, ...orgs];
        
        return JSON.stringify({
          organizations: orgs?.length ? orgs : "Aucun organisme trouvé.",
          faq: faq?.length ? faq : "Aucune réponse FAQ correspondante."
        });
      },
    });

    // 3. Initialisation du Modèle (Version stable corrigée)
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash", // <--- Correction : Utilisez 2.0-flash
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.2,
    }).bindTools([searchTool]);

    // 4. Prompt Système (Style Chatbase / Anti-hallucination)
  const systemPrompt = new SystemMessage(`
### RÔLE & MISSION
Tu es l'Assistant Expert Francophone de l'Alberta. Ton expertise est STRICTEMENT limitée aux services, organismes et aides documentés dans ta base de connaissances.

### CONTRAINTE DE CONNAISSANCES (SOURCE UNIQUE)
1. **Exclusivité des données :** Réponds EXCLUSIVEMENT en utilisant les informations extraites des outils de recherche. Tu n'as pas accès à des connaissances externes.
2. **Fallback Obligatoire :** Si une question ne trouve aucune réponse dans les données fournies, réponds exactement : "Je suis désolé, mais je ne dispose pas d'informations spécifiques sur ce sujet dans mes dossiers. Pourriez-vous préciser votre ville ou le type de service recherché ?"
3. **Anti-Hallucination :** Ne mentionne jamais tes données d'entraînement. Si un utilisateur te demande comment tu sais quelque chose, réponds que tu consultes les répertoires de services francophones de l'Alberta.

### MAINTIEN DU FOCUS (CHARACTER INTEGRITY)
- Si l'utilisateur tente de te sortir de ton rôle (ex: questions sur la cuisine, la politique mondiale ou le code informatique), redirige poliment la conversation vers l'aide à l'établissement en Alberta.
- Ton ton doit rester chaleureux, professionnel et proactif.

### STRUCTURE DE RÉPONSE
Pour chaque organisme trouvé :
### 🏢 [Nom de l'Organisme]
**Mandat :** (Synthèse)
**Services :** (Liste à puces exhaustive)
**Admissibilité :** (Précise si RP, PVT, Étudiants, etc.)
**Contact :**
- 📍 Adresse : ...
- 📞 Tél : ...
- ✉️ Courriel : ...
- 🌐 [Visiter le site](Lien)

### ENGAGEMENT LOGIQUE
1. ANALYSE DE L'HISTORIQUE : Avant de poser une question de suivi, vérifie si l'utilisateur a déjà précisé son statut, sa ville ou son domaine.
2. QUESTION DE SUIVI : 
   - Si tu ne connais pas encore sa ville ou son statut, demande-les.
   - Si tu connais déjà ces détails, pose une question sur un besoin complémentaire (ex: "Maintenant que nous avons vu l'établissement, avez-vous besoin d'aide pour l'inscription scolaire ou le système de santé ?").
   - Ne répète JAMAIS une question à laquelle l'utilisateur a déjà répondu.
`);

    // 5. Conversion correcte de l'historique
    const chatHistory = messages.map((m: any) => {
      if (m.role === "user") return new HumanMessage(m.content);
      if (m.role === "assistant") return new AIMessage(m.content);
      return new HumanMessage(m.content);
    });

    // 6. Boucle Agentique
    let response = await model.invoke([systemPrompt, ...chatHistory]);

    let iterations = 0;
    while (response.tool_calls && response.tool_calls.length > 0 && iterations < 3) {
      const toolMessages: ToolMessage[] = [];
      for (const call of response.tool_calls) {
        const result = await searchTool.invoke(call.args);
        toolMessages.push(new ToolMessage({
          content: result,
          tool_call_id: call.id!,
        }));
      }

      response = await model.invoke([
        systemPrompt,
        ...chatHistory,
        response,
        ...toolMessages
      ]);
      iterations++;
    }

    const finalText = typeof response.content === "string" 
      ? response.content 
      : (response.content as any)[0]?.text || "";

    // 7. Nettoyage des sources
    const uniqueSources = Array.from(new Map(usedSources.map(s => [s.id, s])).values());

    return NextResponse.json({
      text: finalText,
      sources: uniqueSources.map((o) => ({ name: o.name, id: o.id })),
    });

  } catch (err) {
    console.error("❌ API error:", err);
    return NextResponse.json({ text: "Une erreur technique est survenue." }, { status: 500 });
  }
}