// src/data/intents.ts
import CATEGORIES from "./categories";

/**
 * Flatten all category IDs from CATEGORIES
 */
const categoryIds = CATEGORIES.flatMap((group) => group.items.map((item) => item.id));

/**
 * Intent type based on category IDs + fallback "general"
 */
export type Intent = (typeof categoryIds[number]) | "general";

/**
 * Org type
 */
export interface Org {
  id: string;
  name: string;
  category?: string[];
  tags?: string[];
  [key: string]: any; // Other optional fields
}

/**
 * Map each category to keywords for intent detection
 * Add more keywords for better matching
 */
const categoryKeywords: Record<string, RegExp> = {
  "francophonie": /francais|francophonie|french|langue|apprendre/,
  "vie communautaire": /communauté|communautaire/,
  "integration": /integration|arrivant|nouveau|immigration/,
  "nouveaux arrivants": /nouveau arrivant|immigrant|refugié/,
  "benevolat": /benevolat|volontaire/,
  "defense des droits": /droit|défense/,
  "culture": /culture|art|patrimoine/,
  "arts": /art|peinture|musique|sculpture/,
  "patrimoine": /patrimoine|historique/,
  "histoire": /histoire|historique/,
  "cinema": /cinema|film/,
  "festivals": /festival|événement/,
  "education": /education|éducation|apprentissage/,
  "apprentissage du francais": /francais|apprendre|cours|classe/,
  "formation professionnelle": /formation|professionnelle|cours métier/,
  "ateliers": /atelier|workshop/,
  "jeunesse": /jeunes|jeunesse|adolescent/,
  "familles": /famille|parents/,
  "petite enfance": /enfant|petite enfance/,
  "garderie": /garderie|crèche/,
  "camps": /camp|vacances/,
  "emploi": /emploi|job|travail|carriere|cv|recrut/,
  "carriere": /carriere|carrière|profession/,
  "entrepreneuriat": /entrepreneuriat|startup|entreprise/,
  "sante": /sante|santé|bien-être/,
  "services sociaux": /service social|social|aide/,
  "bien etre": /bien-etre|bien-être/,
  "medias": /media|journal|radio|information/,
  "radio": /radio|émission/,
  "information communautaire": /information communautaire|newsletter/,
};

/**
 * Sanitize the question text for better intent detection and embeddings
 */
export function sanitizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Detect intent dynamically using category keywords
 */
export function detectIntent(q: string): Intent {
  const sanitized = sanitizeQuestion(q);

  for (const [category, regex] of Object.entries(categoryKeywords)) {
    if (regex.test(sanitized)) return category as Intent;
  }

  return "general";
}

/**
 * Filter orgs by detected intent
 * Returns only orgs that match the category or tag
 */
export function filterOrgsByIntent(intent: Intent, orgs: Org[]): Org[] {
  if (intent === "general") return orgs;

  return orgs.filter(
    (o) =>
      o.category?.some((c) => c.toLowerCase() === intent) ||
      o.tags?.some((t) => t.toLowerCase() === intent)
  );
}
