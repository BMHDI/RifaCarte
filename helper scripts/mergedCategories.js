import fs from "fs";

// ---------- CONFIG ----------
const OLD_FILE = "./orgs.json";
const UPDATED_FILE = "./orgs-updated.json";
const OUTPUT_FILE = "./orgs-merged.json";
// ----------------------------

const oldOrgs = JSON.parse(fs.readFileSync(OLD_FILE, "utf-8"));
const updatedOrgs = JSON.parse(fs.readFileSync(UPDATED_FILE, "utf-8"));

// normalize helper: lowercase, remove accents, punctuation, extra spaces
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")                 // split accents
    .replace(/[\u0300-\u036f]/g, "")  // remove accents
    .replace(/[^a-z0-9 ]/g, " ")      // remove punctuation
    .replace(/\s+/g, " ")             // collapse spaces
    .trim();
}

// build lookup map: normalized name -> array of orgs
const updatedMap = new Map();

for (const org of updatedOrgs) {
  if (!org.name) continue;
  const key = normalizeName(org.name);

  if (!updatedMap.has(key)) updatedMap.set(key, []);
  updatedMap.get(key).push(org);
}

let replaced = 0;
let missing = [];

const merged = oldOrgs.map((oldOrg) => {
  if (!oldOrg.name) return oldOrg;

  const key = normalizeName(oldOrg.name);
  const matches = updatedMap.get(key);

  if (matches && matches.length > 0) {
    const source = matches[0]; // take first match

    if (Array.isArray(source.category)) {
      replaced++;
      return {
        ...oldOrg,
        category: source.category, // ✅ replace only category
      };
    }
  }

  missing.push(oldOrg);
  return oldOrg;
});

// backup original
fs.copyFileSync(OLD_FILE, "./orgs-old.backup.json");

// write merged output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), "utf-8");

// write missing matches for review
fs.writeFileSync("./orgs-missing.json", JSON.stringify(missing, null, 2), "utf-8");

console.log("✅ Merge finished");
console.log("Replaced categories:", replaced);
console.log("Missing matches:", missing.length);
console.log("Output file:", OUTPUT_FILE);
console.log("Missing file:", "orgs-missing.json");
