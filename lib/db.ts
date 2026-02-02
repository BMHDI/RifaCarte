import { createClient } from "@supabase/supabase-js";
import { Org } from "@/types/types"; // your TS type

const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
console.log(URL, KEY);

// Create Supabase client
 const supabase = createClient(URL,KEY);

/**
 * Fetch all organizations from the database
 */
export async function getOrganizations(): Promise<Org[]> {
  try {
    // Example: using a Supabase RPC function (vector search) or direct table select
    const { data, error } = await supabase
      .from("organizations") // your table name
      .select("*"); // select all fields, or specify fields if you want

    if (error) throw error;

    return data as Org[];
  } catch (err) {
    console.error("Error fetching organizations:", err);
    return [];
  }
}
export async function getAllOrganizations(): Promise<Org[]> {
  try {
    const { data, error } = await supabase.from("organizations").select("*");
    if (error) throw error;
    return data as Org[];
  } catch (err) {
    console.error("Error fetching organizations:", err);
    return [];
  }
}
