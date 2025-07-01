require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { insertProperty } = require('./db');

async function importProperties() {
  try {
    // Read JSON file (adjust path if needed)
    const data = fs.readFileSync(path.join(__dirname, '/data/buy.json'), 'utf8');
    const properties = JSON.parse(data);

    for (const property of properties) {
      console.log(`Inserting property: ${property.basic.id}`);
      await insertProperty(property);
    }

    console.log('All properties inserted successfully!');
  } catch (error) {
    console.error('Error importing properties:', error);
  }
}

importProperties();
