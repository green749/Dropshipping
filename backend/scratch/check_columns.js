import pg from 'pg';
import { env } from '../services/shared/config/env.js';

async function checkCols() {
  const dbs = [
    { name: 'dropship_auth', tables: ['users', 'notifications', 'audit_logs'] },
    { name: 'dropship_business', tables: ['businesses', 'dealers', 'business_dealers', 'dealer_invitations'] },
    { name: 'dropship_product', tables: ['products'] },
    { name: 'dropship_order', tables: ['customers', 'orders', 'order_items'] },
    { name: 'dropship_marketing', tables: ['campaigns', 'social_accounts', 'posts', 'ads'] },
    {
      name: 'dropship_management',
      tables: ['users', 'businesses', 'dealers', 'business_dealers', 'dealer_invitations', 'products', 'customers', 'orders', 'order_items', 'campaigns', 'social_accounts', 'posts', 'ads', 'notifications', 'audit_logs'],
    },
  ];

  for (const db of dbs) {
    const client = new pg.Client({
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      database: db.name,
    });
    try {
      await client.connect();
      console.log(`\n=================== ${db.name} ===================`);
      for (const table of db.tables) {
        const res = await client.query(
          "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
          [table]
        );
        console.log(`\n📌 ${table}:`);
        console.log(res.rows.map(r => `  - ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`).join('\n'));
      }
    } catch (e) {
      console.error(`Error in ${db.name}:`, e.message);
    } finally {
      await client.end().catch(() => {});
    }
  }
}

checkCols();
