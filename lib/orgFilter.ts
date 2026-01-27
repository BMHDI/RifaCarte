// lib/orgFilter.ts
import { normalize } from "./normalize"; // optional: move your normalize function here too
import { Org } from "@/types/types";



const stopWords = ["pour", "les", "de", "du", "des", "la", "le", "un", "une", "et"];

export function filterOrgs(
  organizations: Org[],
  query: string,
  selectedCategories: string[],
  selectedCities: string[]
) {
  return organizations.filter((org) => {
    let textMatch = true;

    if (query) {
      const normalizedQuery = normalize(query);
      const queryWords = normalizedQuery
        .split(/\s+/)
        .filter((w) => w && !stopWords.includes(w));

      if (queryWords.length === 0) return false;

      const phraseInServices = org.services?.some((s: string) =>
        normalize(s).includes(normalizedQuery)
      );

      const phraseInProjects = org.projects?.some(
        (p) =>
          normalize(p.name).includes(normalizedQuery) ||
         p.description && normalize(p.description).includes(normalizedQuery)
      );

      const wordsInServices = org.services?.some((s) => {
        const normalizedService = normalize(s);
        return queryWords.every((word) => normalizedService.includes(word));
      });

      const wordsInProjects = org.projects?.some((p) => {
        const normalizedName = normalize(p.name);
        const normalizedDesc = p.description && normalize(p.description);
        return queryWords.every(
          (word) =>
            normalizedName.includes(word) || normalizedDesc && normalizedDesc.includes(word)
        );
      });

      textMatch =
        (phraseInServices || phraseInProjects || wordsInServices || wordsInProjects) ?? false;
    }
const orgCategories = Array.isArray((org as any).categories)
  ? (org as any).categories
  : org.category
  ? [org.category]
  : [];

const categoryMatch =
  selectedCategories.length === 0 ||
  orgCategories.some((cat: string) => selectedCategories.includes(cat));


const cityMatch =
  selectedCities.length === 0 ||
  org.locations?.some(
    (loc) => loc.city && selectedCities.includes(loc.city)
  );

    return textMatch && categoryMatch && cityMatch;
  });
}
