import { dealerPerformanceRepository } from '../services/business-dealer-service/repositories/dealerPerformance.repository.js';

async function test() {
  const resAll = await dealerPerformanceRepository.getDealersWithPerformance({});
  console.log('--- RES ALL count:', resAll.length);

  const resShishva = await dealerPerformanceRepository.getDealersWithPerformance({
    businessId: '3c1c6d96-ceb5-4a79-a2d4-80153d492155',
  });
  console.log('--- RES SHISHVA count:', resShishva.length);
  console.log(JSON.stringify(resShishva, null, 2));

  process.exit(0);
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
