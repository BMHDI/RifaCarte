import fs from 'fs';

// 👉 FILES
const INPUT_FILE = './orgs.json';
const OUTPUT_FILE = './orgs_with_region.json';

// 👉 REGION TABLE (normalized)
const REGION_MAP = {
  nord: [
    'Saint Isidore',
    'fort mcmurray',
    'wood buffalo',
    'peace river',
    'bonnyville',
    'st paul',
    'saint paul',
    'cold lake',
    'grande prairie',
    'high level',
    'fairview',
    'slave lake',
    'whitecourt',
    'edson',
    'crowsnest pass',
    'dawson creek', // technically BC border but sometimes included in northern networks
  ],

  centre: [
    'edmonton',
    'st albert',
    'saint albert',
    'sherwood park',
    'beaumont',
    'leduc',
    'spruce grove',
    'stony plain',
    'legal',
    'morinville',
    'fort saskatchewan',
    'red deer',
    'camrose',
    'wetaskiwin',
    'lacombe',
    'blackfalds',
    'ponoka',
    'devon',
    'parkland county',
    'gibbons',
  ],

  sud: [
    'calgary',
    'cochrane',
    'airdrie',
    'okotoks',
    'chestermere',
    'medicine hat',
    'lethbridge',
    'brooks',
    'taber',
    'high river',
    'canmore',
    'strathmore',
    'banff',
    'claresholm',
    'pincher creek',
    'cardston',
    'fort macleod',
    'turner valley',
    'cypress hills',
    'drumheller', // sometimes considered central-south border
  ],
};

// normalize city text
function norm(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectRegion(org) {
  if (!Array.isArray(org.locations)) return 'centre'; // fallback

  for (const loc of org.locations) {
    const city = norm(loc.city);

    for (const [region, cities] of Object.entries(REGION_MAP)) {
      if (cities.some((c) => city.includes(c))) {
        return region;
      }
    }
  }

  return 'centre'; // safe default
}

// ---------- RUN ----------
const orgs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

let stats = { nord: 0, centre: 0, sud: 0 };

const updated = orgs.map((org) => {
  const region = detectRegion(org);
  stats[region]++;
  return { ...org, region };
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2), 'utf-8');

console.log('✅ Regions added');
console.log('Stats:', stats);
console.log('Output:', OUTPUT_FILE);
