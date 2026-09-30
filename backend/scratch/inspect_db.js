import pg from 'pg';
import { env } from '../services/shared/config/env.js';

const dbNames = [
  env.DB.AUTH_NAME || 'dropship_auth',
  env.DB.BUSINESS_NAME || 'dropship_business',
  env.DB.PRODUCT_NAME || 'dropship_product',
  env.DB.ORDER_NAME || 'dropship_order',
  env.DB.MARKETING_NAME || 'dropship_marketing',
  env.DB.ANALYTICS_NAME || 'dropship_analytics',
];

async function inspectDatabases() {
  console.log('=========================================================');
  console.log('🔍 INSPECTING ALL ISOLATED MICROSERVICE DATABASES');
  console.log('=========================================================\n');

  for (const dbName of dbNames) {
    const client = new pg.Client({
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      database: dbName,
    });

    try {
      await client.connect();
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      console.log(`🗄️ Database: '${dbName}' (${tablesRes.rowCount} tables)`);
      for (const row of tablesRes.rows) {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
        console.log(`   • Table: ${row.table_name.padEnd(22)} | Rows: ${countRes.rows[0].count}`);
      }
      console.log('');
    } catch (err) {
      console.error(`❌ Could not inspect database '${dbName}': ${err.message}\n`);
    } finally {
      await client.end().catch(() => {});
    }
  }

  console.log('=========================================================');
}

inspectDatabases();

