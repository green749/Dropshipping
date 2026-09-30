import { getSequelize } from '../services/shared/config/database.js';
import { env } from '../services/shared/config/env.js';

async function updatePostTable() {
  const seq = getSequelize(env.DB.MARKETING_NAME);
  try {
    await seq.authenticate();
    await seq.query('ALTER TABLE posts ALTER COLUMN media_url TYPE TEXT;');
    console.log('Successfully altered media_url in posts table to TEXT!');
  } catch (err) {
    console.log('Notice/Error:', err.message);
  } finally {
    await seq.close();
  }
}

updatePostTable();
