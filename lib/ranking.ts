export function rankResults(results: any[], city?: string) {
  return results
    .map((r) => {
      let score = r.similarity || 0;

      if (city && r.city === city) score += 0.2;
      if (r.verified) score += 0.1;
      if (r.updated_at) score += 0.05;

      return {
        ...r,
        _score: score,
      };
    })
    .sort((a, b) => b._score - a._score);
}
