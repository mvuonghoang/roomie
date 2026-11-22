/**
 * CLI Script: Seed & Inspect Roomie Supabase PostgreSQL Database
 * Usage: node backend/database/seed.js [--reset]
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function main() {
  const isReset = process.argv.includes('--reset');
  const pool = db.openDatabaseConnection();

  try {
    if (isReset) {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.postgres.sql'), 'utf8');
      await pool.query(`
        DROP TABLE IF EXISTS contacts CASCADE;
        DROP TABLE IF EXISTS reports CASCADE;
        DROP TABLE IF EXISTS notifications CASCADE;
        DROP TABLE IF EXISTS plan_purchase_orders CASCADE;
        DROP TABLE IF EXISTS user_plans CASCADE;
        DROP TABLE IF EXISTS connections CASCADE;
        DROP TABLE IF EXISTS quiz_submissions CASCADE;
        DROP TABLE IF EXISTS saved_rooms CASCADE;
        DROP TABLE IF EXISTS roommate_match_daily_usage CASCADE;
        DROP TABLE IF EXISTS roommate_daily_post_usage CASCADE;
        DROP TABLE IF EXISTS roommates CASCADE;
        DROP TABLE IF EXISTS rooms CASCADE;
        DROP TABLE IF EXISTS sessions CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      await pool.query(schemaSql);
    } else {
      await db.ensureDatabaseReady();
    }

    await db.seedDatabase(pool);
    const stats = await db.getDatabaseStats();

    console.log('\n================================================');
    console.log('  Roomie Match - PostgreSQL Database Ready!');
    console.log('================================================');
    console.log(`  Engine : ${stats.engine}`);
    console.log(`  Target : ${stats.dbTarget}`);
    console.log('  Tables :');
    Object.entries(stats.tables).forEach(([tbl, cnt]) => {
      console.log(`    - ${tbl.padEnd(28, ' ')}: ${cnt} records`);
    });
    console.log('================================================\n');
  } finally {
    await db.closePool();
  }
}

main().catch((err) => {
  console.error('[Roomie DB Seed Error]', err);
  process.exit(1);
});
