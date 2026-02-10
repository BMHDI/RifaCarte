import fs from 'fs';
import path from 'path';

// Paths to your two org files
const withEmbeddingPath = path.resolve('./org_with_vectors.json');
const withoutEmbeddingPath = path.resolve('./orgs.json');
const mergedPath = path.resolve('./org_Vectorizedmerged.json');

// Read the files
const orgsWithEmbedding = JSON.parse(fs.readFileSync(withEmbeddingPath, 'utf-8'));
const orgsWithoutEmbedding = JSON.parse(fs.readFileSync(withoutEmbeddingPath, 'utf-8'));

// Merge logic
const mergedMap = new Map();

// Add orgs with embeddings first
orgsWithEmbedding.forEach((org) => {
  mergedMap.set(org.name, org);
});

// Add orgs without embeddings if they don't already exist
orgsWithoutEmbedding.forEach((org) => {
  if (!mergedMap.has(org.name)) {
    mergedMap.set(org.name, org);
  }
});

// Convert map back to array
const mergedOrgs = Array.from(mergedMap.values());

// Save to new file
fs.writeFileSync(mergedPath, JSON.stringify(mergedOrgs, null, 2), 'utf-8');

console.log(`Merged orgs saved to ${mergedPath}. Total: ${mergedOrgs.length}`);
