import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./orgs.json'); // your JSON file
const orgs = JSON.parse(fs.readFileSync(filePath, 'utf8'));



const csvRows = [];

// CSV header
csvRows.push([
  'id','name','category','description','foundedYear',
  'director_name','director_title','services','audience',
  'locations','contact_phone','contact_email','contact_website',
  'tags','memberOf','orgId','region'
].join(','));

orgs.forEach(org => {
  const row = [
    org.id,
    `"${org.name}"`,
    `"${org.category.join(';')}"`,
    `"${org.description.replace(/"/g,'""')}"`,
    org.foundedYear,
    org.director.name,
    org.director.title,
    `"${org.services.join(';')}"`,
    `"${org.audience}"`,
    `"${org.locations.map(l => `${l.city}|${l.address}|${l.lat}|${l.lng}`).join(';')}"`,
    org.contact.phone,
    org.contact.email,
    org.contact.website,
    `"${org.tags.join(';')}"`,
    `"${org.memberOf.join(';')}"`,
    org.orgId,
    org.region
  ];
  csvRows.push(row.join(','));
});

// Write CSV
fs.writeFileSync('orgs.csv', csvRows.join('\n'), 'utf8');

console.log('CSV file created: orgs.csv');
