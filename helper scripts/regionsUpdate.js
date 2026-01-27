import fs from "fs";

// 👉 FILES
const INPUT_FILE = "./orgs.json";
const OUTPUT_FILE = "./orgs_with_region.json";

// 👉 REGION TABLE (normalized)
const REGION_MAP = {
  north: [
    "fort mcmurray",
    "wood buffalo",
    "peace river",
    "bonnyville",
    "st paul",
    "saint paul",
    "cold lake",
    "grande prairie",
    "high level",
  ],

  centre: [
    "edmonton",
    "st albert",
    "saint albert",
    "sherwood park",
    "beaumont",
    "leduc",
    "spruce grove",
    "stony plain",
    "legal",
    "morinville",
    "fort saskatchewan",
    "red deer",
  ],

  south: [
    "calgary",
    "cochrane",
    "airdrie",
    "okotoks",
    "chestermere",
    "medicine hat",
    "lethbridge",
    "brooks",
    "taber",
  ],
};

// normalize city text
function norm(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectRegion(org) {
  if (!Array.isArray(org.locations)) return "centre"; // fallback

  for (const loc of org.locations) {
    const city = norm(loc.city);

    for (const [region, cities] of Object.entries(REGION_MAP)) {
      if (cities.some(c => city.includes(c))) {
        return region;
      }
    }
  }

  return "centre"; // safe default
}

// ---------- RUN ----------
const orgs = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

let stats = { north: 0, centre: 0, south: 0 };

const updated = orgs.map(org => {
  const region = detectRegion(org);
  stats[region]++;
  return { ...org, region };
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2), "utf-8");

console.log("✅ Regions added");
console.log("Stats:", stats);
console.log("Output:", OUTPUT_FILE);
