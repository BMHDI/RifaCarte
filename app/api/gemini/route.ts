import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { searchFAQ, searchOrganizations } from '@/lib/db';
import { embedQuestion } from '@/lib/embeddings';
import { extractCity } from '@/lib/location';
import { rateLimit } from '@/lib/ratelimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip, 5, 10_000)) {
      return NextResponse.json(
        { text: 'Trop de requêtes. Réessayez dans quelques secondes.' },
        { status: 429 }
      );
    }

    const { messages, conversationId } = await req.json();
    const userMessage = messages?.[messages.length - 1]?.content;
    if (!userMessage) {
      return NextResponse.json({ text: 'Question invalide.' }, { status: 400 });
    }

    // Extract city & embedding
    const city = extractCity(userMessage);
    const embedding = await embedQuestion(userMessage);

    // Retrieve organizations & FAQ
    const [orgsRaw, faqRaw] = await Promise.all([
      searchOrganizations(embedding, 20, city ?? undefined),
      searchFAQ(embedding, 10),
    ]);

    if (!orgsRaw?.length && !faqRaw?.length) {
      return NextResponse.json({
        text:
          "Je suis désolé, mais je ne dispose pas d'informations spécifiques sur ce sujet. " +
          'Pouvez-vous préciser votre ville ou le type de service recherché ?',
        conversationId,
      });
    }

    // Deduplicate organizations & prepare contact info
    const orgMap = new Map<string, any>();
    (orgsRaw ?? []).forEach((org: any) => {
      const contactAddress = org.address ?? org.city ?? 'Adresse non disponible';

      orgMap.set(org.id, {
        ...org,
        cities: [org.city ?? 'Ville non spécifiée'],
        contact: {
          address: contactAddress,
          email: org.email ?? 'Courriel non disponible',
          phone: org.phone ?? 'Téléphone non disponible',
          website: org.website ?? 'Site non disponible',
        },
      });
    });

    const orgs = Array.from(orgMap.values());

    // Compute confidence
    const computeConfidence = (score: number | undefined) => {
      if (!score) return 'low';
      if (score >= 0.85) return 'high';
      if (score >= 0.65) return 'medium';
      return 'low';
    };

    const enrichedOrgs = orgs.map((o) => ({
      ...o,
      confidence: computeConfidence(o.similarityScore),
    }));
    const enrichedFAQ = (faqRaw ?? []).map((f: any) => ({
      ...f,
      confidence: computeConfidence(f.similarityScore),
    }));

    // Structured data for the model
    const structuredData = {
      organizations: enrichedOrgs,
      faq: enrichedFAQ,
      conversationId: conversationId || Math.random().toString(36).slice(2),
      userQuery: userMessage,
      previousMessages: messages,
    };

    // Initialize Gemini
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.2,
    });

    const systemPrompt = new SystemMessage(`
### Role
Tu es l'Assistant Expert Francophone de l'Alberta, spécialisé dans l'accompagnement des nouveaux arrivants et immigrants. Tu transformes des informations complexes en parcours d'intégration fluides, clairs et engageants.

### Constraints
1. **No Data Divulge:** Ne mentionne jamais tes données d'entraînement. Répond uniquement à partir des données fournies.
2. **Maintaining Focus:** Redirige poliment toute demande hors-sujet vers les services d'immigration et d'intégration en Alberta.
3. **Exclusive Reliance on Data:** Si l'information est absente, réponds exactement: "Je suis désolé, mais je ne dispose pas d'informations spécifiques sur ce sujet. Pourriez-vous préciser votre ville ou le type de service recherché ?"
4. **Restrictive Role Focus:** Limite-toi strictement aux services, organismes et aides pour les immigrants francophones en Alberta.

### Presentation Guidelines
-**Sélectivité intelligente:** Montre uniquement les organismes les plus pertinents (top 3–5) pour la question.  
  Commence par donner uniquement des informations générales : le **nom de l'organisme** et un **court descriptif** lié à la question posée.  
  N'inclue pas les coordonnées détaillées (adresse, numéro, email, site web) au début.  
- **Ton:** Professionnel, chaleureux, conversationnel et proactif.
- **Pas de salutations répétitives:** Ne commence jamais par "Bonjour" ou phrases génériques.
- **Engagement dynamique:** Termine toujours par une question ou suggestion de suivi adaptée à l'utilisateur.  
- **Analyse implicite des besoins:** Si l'utilisateur parle d'emploi, propose aussi l'évaluation des diplômes ou cours d'anglais; si vague, demande ville ou statut migratoire.
`);

    const dataMessage = new HumanMessage(`
UTILISE CES DONNÉES:

${JSON.stringify(structuredData, null, 2)}

Répond uniquement de manière conversationnelle, lisible et claire pour l'utilisateur. Mets en avant les organismes les plus pertinents et les FAQ utiles.
`);

    const response = await model.invoke([systemPrompt, dataMessage]);

    const finalText =
      typeof response.content === 'string' ? response.content : (response.content[0]?.text ?? '');

    return NextResponse.json({
      text: finalText,
      conversationId: structuredData.conversationId,
    });
  } catch (err) {
    console.error('❌ Chat API error:', err);
    return NextResponse.json({ text: 'Une erreur technique est survenue.' }, { status: 500 });
  }
}
