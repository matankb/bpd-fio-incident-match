const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/lib/sync')


function parseCsv() {
  const rawCsv = fs.readFileSync(path.join(__dirname, './fio.csv'), 'utf-8');
  const data = parse(rawCsv);
  fs.writeFileSync('fio.json', JSON.stringify(data), 'utf-8');
}

// parseCsv();

function formatDataFile(file) {
  const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, `./${file}`), 'utf-8'));
  const keys = rawData[0];

  const data = rawData.slice(1).map(row => {
    const obj = {};
    for (let i = 0; i < row.length; i++) {
      const key = keys[i];
      obj[key] = row[i];
    }
    return obj;
  });

  return data;
}


function getDataFile(file) {
  const contents = fs.readFileSync(path.join(__dirname, `./${file}`), 'utf-8');
  return JSON.parse(contents);
}

function writeDataFile(fileName, data) {
  fs.writeFileSync(fileName, JSON.stringify(data), 'utf-8');
}

function findExactDateMatches() {
  const incidents = getDataFile('incidents2020.json');
  const fios = getDataFile('fios.json');

  const matches = []

  for (let i = 0; i < incidents.length; i++) {
    const incident = incidents[i];
    if (i % 1000 === 0) {
      console.clear();
      console.log(`Incidents scanned: ${i}`)
      console.log(`Matches found: ${matches.length}`)
    }
    const match = { incident, fios: [] };
    for (const fio of fios) {
      if (incident.OCCURRED_ON_DATE === fio.contact_date) {
        match.fios.push(fio);
      }
    }
    if (match.fios.length) {
      matches.push(match);
    }
  }

  writeDataFile('matches.json', matches);
  console.log('Complete!');
}

// Returns true if incident street and fio street are both present and different
// Returns false if they are the same, or one is missing a street
function differentStreet(incident, fio) {
  if (!incident.STREET || incident.STREET === 'NA' || !fio.street) {
    return false;
  }
  return incident.STREET !== fio.street;
}

function main() {
  const matches = getDataFile('matches.json');
  console.log(matches.length);

  // let moreThanOne = 0;
  // for (const match of matches) {
  //   if (match.fios.length > 1) {
  //     moreThanOne++;
  //     console.log(match);
  //     return;
  //   }
  // }
  // console.log(moreThanOne);

  const sameStreetMatches = matches.map(match => {
    if (match.fios.length > 1) {
      return {
        ...match,
        fios: match.fios.filter(fio => fio.street === match.incident.STREET)
      }
    }
    return match;
  }).filter(match => {
    if (!match.fios.length) {
      return false;
    }
    return match.fios[0].street === match.incident.STREET;
  }).map(({ incident, fios }) => ({
    incident,
    fio: fios[0]
  }))

  // console.log(matches[0]);
  writeDataFile('same-street-matches.json', sameStreetMatches)
}

main();