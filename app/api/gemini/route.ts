// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import organizations from "@/lib/org.json";

// Fonction pour filtrer les organismes automatiquement
function filterOrgs(question: string, orgs: any[]) {
  const q = question.toLowerCase();

  return orgs.filter((o) => {
    const city = String(o.city ?? "").toLowerCase();
    const name = String(o.name ?? "").toLowerCase();
    
    // category peut être un tableau ou string
    const categoryList = Array.isArray(o.category)
      ? o.category.map((c) => String(c).toLowerCase())
      : [String(o.category ?? "").toLowerCase()];

    const cityMatch = city && q.includes(city);
    const nameMatch = name && q.includes(name);

    const categoryMatch = categoryList.some((cat) => q.includes(cat));

    return cityMatch || nameMatch || categoryMatch;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { text: "Erreur : question manquante." },
        { status: 400 }
      );
    }

    // Filtrage automatique
    const filteredOrgs = filterOrgs(question, organizations);

    // Créer un mini tableau pour Gemini
    const orgsForPrompt =
      filteredOrgs.length > 0
        ? filteredOrgs.map((o) => ({
            name: o.name,
            city: o.city,
            category: o.category,
            contact: o.contact ?? "non disponible",
          }))
        : [];

    const prompt = `
Tu es un assistant pour la communauté francophone en Alberta.
Voici les organismes pertinents pour la question posée :
${JSON.stringify(orgsForPrompt, null, 2)}

IMPORTANT :
- Ne parle **que** des organismes listés ci-dessus.
- Ne mentionne **aucune ville, organisme ou ressource** qui n'est pas dans cette liste.
- Ne devine pas d’informations ; si la liste est vide, dis simplement : "Désolé, je n’ai pas trouvé d’organismes pertinents dans la liste."

Réponds de manière naturelle et claire à l'utilisateur.
Question : "${question}"`;

    // Gestion des retries si modèle surchargé
    const MAX_RETRIES = 3;
    let attempts = 0;
    let data;
    let lastError;

    while (attempts < MAX_RETRIES) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      await new Promise((r) => setTimeout(r, 1500)); // wait 1.5s
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

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { text: "Erreur serveur lors de l'appel à Gemini." },
      { status: 500 }
    );
  }
}
