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
  const bizDb = env.DB.BUSINESS_NAME || 'dropship_business';
  const client = createClient(bizDb);
  await client.connect();

  const { rows: businesses } = await client.query(`SELECT id, name FROM businesses`);
  console.log('--- ALL BUSINESSES ---');
  console.log(businesses);

  const { rows: businessDealers } = await client.query(`
    SELECT bd.id, bd.business_id, b.name as business_name, bd.dealer_id, d.company_name, d.email
    FROM business_dealers bd
    LEFT JOIN businesses b ON b.id = bd.business_id
    LEFT JOIN dealers d ON d.id = bd.dealer_id
  `);
  console.log('--- ALL BUSINESS_DEALERS ---');
  console.log(businessDealers);

  await client.end();
  process.exit(0);
}

check().catch((e) => {
  console.error(e);
  process.exit(1);
});
