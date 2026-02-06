import { supabase } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
// Use the v1beta endpoint for the latest features like outputDimensionality
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function embedQuestion(text: string): Promise<number[]> {
  // 1️⃣ Check cache first
  const { data: cached } = await supabase
    .from("embeddings_cache")
    .select("embedding")
    .eq("text", text)
    .single();

  if (cached?.embedding) {
    // Optional: Safety check to ensure cached embedding matches your 1536 requirement
    if (cached.embedding.length === 1536) return cached.embedding;
  }

  // 2️⃣ Retry logic (max 3 tries)
  let lastError: any;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            task_type: "RETRIEVAL_QUERY",
            // This is the magic line that truncates the 3072 native vector to 1536
            outputDimensionality: 1536, 
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Gemini error ${res.status}: ${errorData.error?.message || "Unknown error"}`);
      }

      const data = await res.json();
      const embedding = data?.embedding?.values;

      if (!embedding || embedding.length !== 1536) {
         throw new Error(`Invalid embedding length: expected 1536, got ${embedding?.length}`);
      }

      // 3️⃣ Save to cache
      await supabase.from("embeddings_cache").upsert({
        text,
        embedding,
      });

      return embedding;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Embedding attempt ${attempt} failed:`, err instanceof Error ? err.message : err);
      // Exponential backoff before retry
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError;
}