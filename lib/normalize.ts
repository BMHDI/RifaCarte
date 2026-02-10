export const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/['’`-]/g, ' ') // remove apostrophes and hyphens
    .replace(/[^\w\s]/g, ' ') // replace other punctuation with space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim(); // remove leading/trailing spaces
