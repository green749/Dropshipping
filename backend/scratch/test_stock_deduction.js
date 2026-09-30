import { orderService } from '../services/order-service/services/order.service.js';
import { productService } from '../services/product-service/services/product.service.js';
import { customerRepository } from '../services/order-service/repositories/customer.repository.js';
import { CacheService } from '../services/shared/services/cache.service.js';

async function testStockDeduction() {
  console.log('🧪 Testing order creation and product stock deduction...');

  // 1. Get initial products
  const { products } = await productService.getAllProducts({}, { role: 'DROPSHIPPER' });
  const testProduct = products[0];
  console.log(`Initial Product: "${testProduct.name}" (ID: ${testProduct.id})`);
  console.log(`Initial Stock: ${testProduct.stock_quantity} units`);

  // 2. Get customer
  const { customers } = await customerRepository.findAll({}, 0, 10);
  const testCustomer = customers[0];
  console.log(`Customer: "${testCustomer.name}" (Business ID: ${testCustomer.business_id})`);

  // 3. Place an order for 5 units
  console.log('\n🛒 Placing order for 5 units...');
  const orderData = {
    business_id: testCustomer.business_id,
    customer_id: testCustomer.id,
    shipping_address: '123 Test St, San Francisco, CA',
    items: [
      {
        product_id: testProduct.id,
        quantity: 5,
        unit_price: testProduct.selling_price,
      },
    ],
  };

  const created = await orderService.createOrder(orderData, { role: 'DROPSHIPPER' });
  console.log(`✅ Order created successfully: ${created.order_number}`);

  // 4. Query product again
  const updatedProduct = await productService.getProductById(testProduct.id, { role: 'DROPSHIPPER' });
  console.log(`Updated Stock: ${updatedProduct.stock_quantity} units`);

  if (Number(updatedProduct.stock_quantity) === Number(testProduct.stock_quantity) - 5) {
    console.log('🎉 SUCCESS: Product stock reduced correctly by 5 units!');
  } else {
    console.error(`❌ FAILURE: Expected ${Number(testProduct.stock_quantity) - 5} but got ${updatedProduct.stock_quantity}`);
  }

  process.exit(0);
}

testStockDeduction().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
