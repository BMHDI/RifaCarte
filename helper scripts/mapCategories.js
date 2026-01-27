import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// 👉 CONFIGURATION
const INPUT_FILE = "./orgs.json";
const OUTPUT_FILE = "./orgs_updated.json";
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";// 👉 MASTER CATEGORY LIST
const MASTER_CATEGORIES = [
  "francophonie", "vie communautaire", "integration", "nouveaux arrivants", "benevolat", "defense des droits",
  "culture", "arts", "patrimoine", "histoire", "cinema", "festivals",
  "education", "apprentissage du francais", "formation professionnelle", "ateliers",
  "jeunesse", "familles", "petite enfance", "garderie", "camps",
  "emploi", "carriere", "entrepreneuriat",
  "sante", "services sociaux", "bien etre",
  "medias", "radio", "information communautaire"
];

// 👉 GEMINI MAPPER
async function mapCategoriesWithGemini(org) {
  const prompt = `
You are an expert classifier for francophone community organizations in Alberta, Canada.
TASK: Select the 2 to 5 most relevant categories for the organization provided.

ALLOWED CATEGORIES:
${MASTER_CATEGORIES.join(", ")}

ORGANIZATION TO CLASSIFY:
Name: ${org.name}
Description: ${org.description || "N/A"}
Services: ${(org.services || []).join(", ")}
Current Tags: ${(org.tags || []).join(", ")}

RULES:
1. Only use categories from the ALLOWED list.
2. Return a JSON array of strings.
3. If no categories fit, return ["vie communautaire"].
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json", // Forces Gemini to return valid JSON
        }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const rawResult = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawResult);
  } catch (err) {
    console.error(`❌ API Error for ${org.name}:`, err.response?.data || err.message);
    return [];
  }
}

// 👉 MAIN LOOP
async function run() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file ${INPUT_FILE} not found.`);
    return;
  }

  const orgs = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  console.log(`🚀 Starting processing of ${orgs.length} organizations...`);

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    
    // Skip if already processed (optional, helpful for large datasets)
   const needsUpdate =
  !Array.isArray(org.category) ||
  (org.category.length === 1 && org.category[0] === "vie communautaire");

if (!needsUpdate) {
  console.log(`⏩ Skipping ${org.name} (Already categorized)`);
  continue;
}
    console.log(`🔄 [${i + 1}/${orgs.length}] Processing: ${org.name}`);

    let newCats = await mapCategoriesWithGemini(org);

    // Fallback if the AI returns an empty list or fails
    org.category = (newCats && newCats.length > 0) ? newCats : ["vie communautaire"];

    // 👉 SAVE PROGRESS EVERY 5 ITEMS (Safety Checkpoint)
    if (i % 5 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(orgs, null, 2));
    }

    // Rate limit buffer (Flash allows ~15 RPM on free tier, 1s - 2s is safe)
    await new Promise(r => setTimeout(r, 1500));
  }

  // ✅ FINAL SAVE
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(orgs, null, 2));
  console.log(`\n✅ Done! Updated data saved to: ${OUTPUT_FILE}`);
}

run().catch(err => console.error("💥 Critical Script Failure:", err));