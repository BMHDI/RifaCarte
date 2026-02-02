import { createClient } from "@supabase/supabase-js";


const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(URL, KEY);
/**
 * Search organizations using vector similarity, optionally filtered by city
 */
export async function searchOrganizations(
  queryEmbedding: number[],
  matchCount = 5,
  city?: string,
) {
  const { data, error } = await supabase.rpc("match_organizations", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    city_filter: city ?? null, // pass city to the RPC
  });

  if (error) {
    console.error("❌ Supabase RPC error:", error);
    throw error;
  }

  return data;
}
// fetch all orgs
export async function getAllOrganizations() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*"); // or select the fields you need

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    throw error;
  }

  return data;
}
export async function fetchFilteredOrgs({
  query,
  categories,
  cities,
  region,
}: {
  query?: string;
  categories?: string[];
  cities?: string[];
  region?: string;
}) {
  let qb = supabase.from("organizations").select("*");

  if (region) {
    qb = qb.eq("region", region);
  }

  // 🔹 If category is a Postgres text[], use contains
  if (categories && categories.length > 0) {
    qb = qb.contains("category", categories); // matches orgs containing any of the selected categories
  }

  // 🔹 If cities is JSON array inside locations, filter in JS instead
  // Or if you have a flat 'city' column, filter directly:
  if (cities && cities.length > 0) {
    qb = qb.in("city", cities);
  }

  if (query && query.trim()) {
    qb = qb.ilike("name", `%${query}%`);
  }

  const { data, error } = await qb;

  if (error) {
    console.error("❌ Supabase fetchFilteredOrgs error:", error);
    throw error;
  }

  return data;
}


export async function fetchCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("city")
    .not("city", "is", null);

  if (error) {
    console.error("❌ Supabase fetchCities error:", error);
    throw error;
  }

  // unique + sorted
  return [...new Set(data.map((row) => row.city))].sort();
}
