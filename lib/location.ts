function extractCity(text: string): string | null {
  const cities = [
    "calgary",
    "edmonton",
    "red deer",
    "lethbridge",
    "medicine hat",
  ];

  const lower = text.toLowerCase();
  return cities.find((c) => lower.includes(c)) ?? null;
}
export { extractCity };