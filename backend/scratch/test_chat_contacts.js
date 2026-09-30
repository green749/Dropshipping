import { BusinessDealer, Dealer, DealerInvitation } from '../services/business-dealer-service/models/index.js';
import { User, USER_ROLES } from '../services/auth-service/models/index.js';
import { Sequelize, Op } from 'sequelize';

async function testContactsForBiz(businessId) {
  const currentUserId = 'a0000000-0000-4000-8000-000000000001';
  let targetPartners = [];

  const isValidUuid = businessId && businessId !== 'all' && businessId !== 'null' && businessId !== 'undefined';

  if (isValidUuid) {
    const businessDealers = await BusinessDealer.findAll({
      where: {
        business_id: businessId,
        status: 'ACTIVE',
      },
      attributes: ['dealer_id'],
    });
    const dealerIds = businessDealers.map((bd) => bd.dealer_id);

    const dealers = dealerIds.length > 0 ? await Dealer.findAll({
      where: {
        id: { [Op.in]: dealerIds },
        status: 'ACTIVE',
      },
      attributes: ['id', 'user_id', 'company_name', 'contact_name', 'email'],
    }) : [];

    const invites = await DealerInvitation.findAll({
      where: {
        business_id: businessId,
        status: { [Op.ne]: 'CANCELLED' },
      },
      attributes: ['email', 'role', 'company_name'],
    });

    const allowedUserIds = dealers.map((d) => d.user_id).filter(Boolean);
    const allowedEmails = [
      ...dealers.map((d) => (d.email || '').toLowerCase().trim()).filter(Boolean),
      ...invites.map((inv) => (inv.email || '').toLowerCase().trim()).filter(Boolean),
    ];

    if (allowedUserIds.length > 0 || allowedEmails.length > 0) {
      targetPartners = await User.findAll({
        where: {
          id: { [Op.ne]: currentUserId },
          is_active: true,
          [Op.or]: [
            ...(allowedUserIds.length > 0 ? [{ id: { [Op.in]: allowedUserIds } }] : []),
            ...(allowedEmails.length > 0
              ? [
                  Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('email')),
                    { [Op.in]: allowedEmails }
                  ),
                ]
              : []),
          ],
        },
        attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
        order: [['name', 'ASC']],
      });
    }
  } else {
    targetPartners = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
        is_active: true,
      },
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      order: [['name', 'ASC']],
    });
  }

  console.log(`Results for businessId: "${businessId}":`, targetPartners.map(p => ({ id: p.id, name: p.name, email: p.email, role: p.role })));
}

async function run() {
  console.log('--- SHISHVA (specific business) ---');
  await testContactsForBiz('3c1c6d96-ceb5-4a79-a2d4-80153d492155');

  console.log('--- ALL BUSINESSES ("all") ---');
  await testContactsForBiz('all');

  process.exit(0);
}

run().catch(console.error);
