import pg from 'pg';
import { env } from '../services/shared/config/env.js';

function createClient(database) {
  return new pg.Client({
    host: env.DB.HOST || 'localhost',
    port: env.DB.PORT || 5432,
    user: env.DB.USER || 'postgres',
    password: env.DB.PASSWORD || 'postgres',
    database,
  });
}

async function check() {
  const mgmtClient = createClient(env.DB.NAME || 'dropship_management');
  await mgmtClient.connect();
  const { rows: mgmtBiz } = await mgmtClient.query(`SELECT id, name FROM businesses`);
  console.log('--- dropship_management businesses ---');
  console.log(mgmtBiz);
  await mgmtClient.end();

  const bizClient = createClient(env.DB.BUSINESS_NAME || 'dropship_business');
  await bizClient.connect();
  const { rows: bizBiz } = await bizClient.query(`SELECT id, name FROM businesses`);
  console.log('--- dropship_business businesses ---');
  console.log(bizBiz);
  await bizClient.end();

  process.exit(0);
}

check().catch((e) => {
  console.error(e);
  process.exit(1);
});
