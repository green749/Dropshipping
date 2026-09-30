import { chatController } from '../services/auth-service/controllers/chat.controller.js';
import { User, USER_ROLES } from '../services/auth-service/models/index.js';

async function test() {
  const adminUser = await User.findOne({ where: { role: USER_ROLES.DROPSHIPPER } });

  const reqShishva = {
    user: { id: adminUser.id, role: adminUser.role },
    query: { business_id: '3c1c6d96-ceb5-4a79-a2d4-80153d492155' },
    headers: {},
  };

  const createMockRes = (label) => ({
    status: () => createMockRes(label),
    json: (data) => console.log(`--- CONTACTS RESULT (${label}) --- Count:`, data.data?.length, data.data?.map(c => c.name)),
  });

  await chatController.getContacts(reqShishva, createMockRes('shishva'), (e) => console.error('ERROR:', e));
  process.exit(0);
}

test().catch(console.error);
