import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
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