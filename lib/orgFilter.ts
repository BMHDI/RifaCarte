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

      // Helper to check if all words are in a string
      const allWordsIn = (str: string | undefined) =>
        str && queryWords.every((word) => normalize(str).includes(word));

      // Check text in various org fields
      const phraseInName = org.name && normalize(org.name).includes(normalizedQuery);
      const phraseInDescription = org.description && normalize(org.description).includes(normalizedQuery);

      const phraseInServices = org.services?.some((s) => normalize(s).includes(normalizedQuery));
      const phraseInProjects = org.projects?.some(
        (p) =>
          normalize(p.name).includes(normalizedQuery) ||
          (p.description && normalize(p.description).includes(normalizedQuery))
      );
      const phraseInCategory = Array.isArray(org.category)
        ? org.category.some((cat) => normalize(cat).includes(normalizedQuery))
        : false;

      const wordsInName = allWordsIn(org.name);
      const wordsInDescription = allWordsIn(org.description);
      const wordsInServices = org.services?.some(allWordsIn);
      const wordsInProjects = org.projects?.some(
        (p) => allWordsIn(p.name) || allWordsIn(p.description)
      );
      

      textMatch =
        !!(
          phraseInName ||
          phraseInDescription ||
          phraseInServices ||
          phraseInProjects ||
          phraseInCategory ||
          wordsInName ||
          wordsInDescription ||
          wordsInServices ||
          wordsInProjects
        );
    }

   const categoryMatch =
  selectedCategories.length === 0 ||
  (Array.isArray(org.category) && org.category.some((cat) => selectedCategories.includes(cat)));

  const cityMatch =
  selectedCities.length === 0 ||
  org.locations?.some(
    (loc) => loc.city && selectedCities.includes(loc.city)
  );


    return textMatch && categoryMatch && cityMatch;
  });
}
