// src/data/categories.ts

export interface CategoryItem {
  id: string;
  label: string;
}

export interface CategoryGroup {
  group: string;
  items: CategoryItem[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    group: "Communauté & francophonie",
    items: [
      { id: "francophonie", label: "Francophonie" },
      { id: "vie communautaire", label: "Vie communautaire" },
      { id: "integration", label: "Intégration" },
      { id: "nouveaux arrivants", label: "Nouveaux arrivants" },
      { id: "benevolat", label: "Bénévolat" },
      { id: "defense des droits", label: "Défense des droits" }
    ]
  },
  {
    group: "Culture, arts & patrimoine",
    items: [
      { id: "culture", label: "Culture" },
      { id: "arts", label: "Arts" },
      { id: "patrimoine", label: "Patrimoine" },
      { id: "histoire", label: "Histoire" },
      { id: "cinema", label: "Cinéma" },
      { id: "festivals", label: "Festivals" }
    ]
  },
  {
    group: "Éducation & langues",
    items: [
      { id: "education", label: "Éducation" },
      { id: "apprentissage du francais", label: "Apprentissage du français" },
      { id: "formation professionnelle", label: "Formation professionnelle" },
      { id: "ateliers", label: "Ateliers" }
    ]
  },
  {
    group: "Famille & jeunesse",
    items: [
      { id: "jeunesse", label: "Jeunesse" },
      { id: "familles", label: "Familles" },
      { id: "petite enfance", label: "Petite enfance" },
      { id: "garderie", label: "Garderie" },
      { id: "camps", label: "Camps" }
    ]
  },
  {
    group: "Emploi & économie",
    items: [
      { id: "emploi", label: "Emploi" },
      { id: "carriere", label: "Carrière" },
      { id: "entrepreneuriat", label: "Entrepreneuriat" }
    ]
  },
  {
    group: "Santé & services sociaux",
    items: [
      { id: "sante", label: "Santé" },
      { id: "services sociaux", label: "Services sociaux" },
      { id: "bien etre", label: "Bien-être" }
    ]
  },
  {
    group: "Médias & information",
    items: [
      { id: "medias", label: "Médias" },
      { id: "radio", label: "Radio" },
      { id: "information communautaire", label: "Information communautaire" }
    ]
  }
];

export default CATEGORIES;
