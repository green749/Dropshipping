import { chatController } from '../services/auth-service/controllers/chat.controller.js';
import { User, USER_ROLES } from '../services/auth-service/models/index.js';

async function test() {
  const dealerUser = await User.findOne({ where: { email: 'dealerss@yopmail.com' } });
  console.log('Dealer User:', dealerUser?.id, dealerUser?.email, dealerUser?.role);

  const req = {
    user: { id: dealerUser.id, role: dealerUser.role },
    query: { business_id: '3c1c6d96-ceb5-4a79-a2d4-80153d492155' },
    headers: {},
  };

  const createMockRes = (label) => ({
    status: () => createMockRes(label),
    json: (data) => console.log(`--- CONTACTS RESULT (${label}) ---`, JSON.stringify(data.data || data, null, 2)),
  });

  await chatController.getContacts(req, createMockRes('dealer_user'), (e) => console.error('ERROR:', e));
  process.exit(0);
}

test().catch(console.error);
