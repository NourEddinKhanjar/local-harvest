const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbFilePath = path.join(__dirname, 'local_harvest.sqlite');
const db = new Database(dbFilePath); // { verbose: console.log } for debugging SQL

// Function to initialize the database schema
function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database schema initialized or already exists.');
}

initializeDatabase();

module.exports = db;