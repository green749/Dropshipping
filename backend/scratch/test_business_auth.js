import { requireBusinessAccess } from '../services/shared/middlewares/businessAuth.middleware.js';
import { User } from '../services/auth-service/models/index.js';

async function test() {
  const admin = await User.findOne({ where: { role: 'DROPSHIPPER' } });
  const dealer = await User.findOne({ where: { role: 'DEALER' } });
  const marketer = await User.findOne({ where: { role: 'MARKETING' } });

  const shishvaId = '3c1c6d96-ceb5-4a79-a2d4-80153d492155';
  const otherBizId = 'b0000000-0000-4000-8000-000000000001';

  const testReq = async (user, bizId) => {
    let result = 'ALLOWED';
    const req = { user, query: { business_id: bizId }, body: {}, headers: {} };
    const res = {
      status: (code) => ({
        json: (data) => { result = `DENIED ${code}: ${data.message}`; }
      })
    };
    await requireBusinessAccess(req, res, () => {});
    console.log(`User [${user.role}] ${user.email} -> Business ${bizId}: ${result}`);
  };

  console.log('--- TESTING BUSINESS AUTHORIZATION ---');
  await testReq(admin, shishvaId);
  await testReq(admin, otherBizId);
  await testReq(dealer, shishvaId);
  await testReq(dealer, otherBizId);
  await testReq(marketer, shishvaId);

  process.exit(0);
}

test().catch(console.error);
