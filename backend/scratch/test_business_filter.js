import { businessService } from '../services/business-dealer-service/services/business.service.js';
import { User } from '../services/auth-service/models/index.js';

async function test() {
  const users = await User.findAll({ attributes: ['id', 'email', 'name', 'role'] });
  console.log('All Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  for (const user of users) {
    const res = await businessService.getAllBusinesses({ page: 1, limit: 50 }, user);
    console.log(`User [${user.role}] ${user.email}:`, res.businesses.map(b => ({ id: b.id, name: b.name })));
  }

  process.exit(0);
}

test().catch(console.error);
