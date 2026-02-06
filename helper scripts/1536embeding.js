import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// 1. Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Use Service Role for DB updates
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  
  const embeddingModels = data.models
    .filter(m => m.supportedGenerationMethods.includes("embedContent"))
    .map(m => m.name);
    
  console.log("Available Embedding Models:", embeddingModels);
}
listModels();
// 2. Define the Model
// text-embedding-004 supports Matryoshka learning for 1536 dimensions
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
async function processBatch() {
  console.log("--- Starting Embedding Sync ---");

  // 3. Fetch rows where the 1536 vector is missing
  const { data: rows, error: fetchError } = await supabase
    .from("organizations")
    .select("id, name, description, content")
    .is("embedding_1536", null)
    .limit(20); // Batch size to stay within rate limits

  if (fetchError) {
    console.error("Error fetching rows:", fetchError);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log("No pending rows found. All caught up!");
    return;
  }

  console.log(`Processing ${rows.length} rows...`);

  for (const row of rows) {
    try {
      // 4. Combine text fields for a rich context vector
      const textToEmbed = `
        Organization: ${row.name}
        Description: ${row.description || ""}
        Content: ${row.content || ""}
      `.trim();

      // 5. Generate the 1536-dimensional embedding
      const result = await model.embedContent({
        content: { parts: [{ text: textToEmbed }] },
        outputDimensionality: 1536,
        taskType: "RETRIEVAL_DOCUMENT",
      });

      const vector = result.embedding.values;

      // 6. Update the row in Supabase
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ embedding_1536: vector })
        .eq("id", row.id);

      if (updateError) throw updateError;

      console.log(`✅ Success: ID ${row.id} embedded (Dim: ${vector.length})`);
    } catch (err) {
      console.error(`❌ Failed: ID ${row.id} - ${err.message}`);
    }
  }

  console.log("--- Batch Complete ---");
}

// Run the script
processBatch();