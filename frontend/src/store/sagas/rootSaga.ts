import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { productSaga } from './productSaga';
import { orderSaga } from './orderSaga';
import { dashboardSaga } from './dashboardSaga';
import { businessSaga } from './businessSaga';
import { dealerSaga } from './dealerSaga';
import { customerSaga } from './customerSaga';
import { marketingSaga } from './marketingSaga';
import { notificationSaga } from './notificationSaga';
import { returnSaga } from './returnSaga';
import { financeSaga } from './financeSaga';
import { inventorySaga } from './inventorySaga';
import { dealerPerformanceSaga } from './dealerPerformanceSaga';
import { productIntelligenceSaga } from './productIntelligenceSaga';
import { productResearchSaga } from './productResearchSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(productSaga),
    fork(orderSaga),
    fork(dashboardSaga),
    fork(businessSaga),
    fork(dealerSaga),
    fork(dealerPerformanceSaga),
    fork(customerSaga),
    fork(marketingSaga),
    fork(notificationSaga),
    fork(returnSaga),
    fork(financeSaga),
    fork(inventorySaga),
    fork(productIntelligenceSaga),
    fork(productResearchSaga),
  ]);
}

export default rootSaga;
