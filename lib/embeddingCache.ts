import { supabase } from "@/lib/db";
import { embedQuestion } from "./embeddings";

export async function getCachedEmbedding(text: string) {
  const { data } = await supabase
    .from("embedding_cache")
    .select("vector")
    .eq("text", text)
    .single();

  if (data) return data.vector;

  const vector = await embedQuestion(text);

  await supabase.from("embedding_cache").insert({
    text,
    vector,
  });

  return vector;
}
