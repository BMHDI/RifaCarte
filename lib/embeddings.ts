// lib/embeddings.ts
import { supabase } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent";

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
    return cached.embedding;
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
            content: { parts: [{ text }] },
            task_type: "RETRIEVAL_QUERY",
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Gemini error ${res.status}`);
      }

      const data = await res.json();
      const embedding = data?.embedding?.values;

      if (!embedding) throw new Error("Invalid embedding response");

      // 3️⃣ Save to cache
      await supabase.from("embeddings_cache").insert({
        text,
        embedding,
      });

      return embedding;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Embedding attempt ${attempt} failed`);
    }
  }

  throw lastError;
}
