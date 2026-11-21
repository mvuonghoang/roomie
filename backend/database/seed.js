/**
 * CLI Script: Seed & Inspect Roomie SQLite Database
 * Usage: node backend/database/seed.js [--reset]
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

const isReset = process.argv.includes('--reset');

if (isReset) {
  const conn = db.openDatabaseConnection();
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  conn.exec(`
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS saved_rooms;
    DROP TABLE IF EXISTS quiz_submissions;
    DROP TABLE IF EXISTS connections;
    DROP TABLE IF EXISTS user_plans;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS reports;
    DROP TABLE IF EXISTS contacts;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS roommates;
    DROP TABLE IF EXISTS users;
  `);
  conn.exec(schemaSql);
}

db.seedDatabase();
const stats = db.getDatabaseStats();

console.log('\n================================================');
console.log('  Roomie Match - SQLite Database Ready!');
console.log('================================================');
console.log(`  Engine : ${stats.engine}`);
console.log(`  File   : ${stats.dbPath}`);
console.log('  Tables :');
Object.entries(stats.tables).forEach(([tbl, cnt]) => {
  console.log(`    - ${tbl.padEnd(18, ' ')}: ${cnt} records`);
});
console.log('================================================\n');
