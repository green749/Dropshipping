import { call, put, takeLatest, takeEvery, all } from 'redux-saga/effects';
import { marketingApi } from '../../api/marketingApi';
import {
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  fetchSocialAccounts,
  createSocialAccount,
  deleteSocialAccount,
  fetchPosts,
  createPost,
  publishPost,
  deletePost,
  fetchAds,
  createAd,
  deleteAd,
  fetchMarketingData,
  setLoading,
  setError,
  setCampaigns,
  campaignCreated,
  campaignUpdated,
  campaignDeleted,
  setSocialAccounts,
  socialAccountCreated,
  socialAccountDeleted,
  setPosts,
  postCreated,
  postPublished,
  postDeleted,
  setAds,
  adCreated,
  adDeleted,
  setMarketingAllData,
} from '../slices/marketingSlice';
import type { SagaAction } from '../sagaUtils';

// ─── Campaigns Sagas ────────────────────────────────────────────────────────
function* handleFetchCampaigns(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(marketingApi.getCampaigns, action.payload);
    yield put(setCampaigns(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to load campaigns';
    yield put(setError(msg));
    action.meta?.reject?.(msg);
  }
}

function* handleCreateCampaign(action: SagaAction): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.createCampaign, action.payload);
    yield put(campaignCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to create campaign';
    action.meta?.reject?.(msg);
  }
}

function* handleUpdateCampaign(action: SagaAction): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.updateCampaign, action.payload.id, action.payload.data);
    yield put(campaignUpdated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    const msg = err.message || 'Failed to update campaign';
    action.meta?.reject?.(msg);
  }
}

function* handleDeleteCampaign(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield call(marketingApi.deleteCampaign, action.payload);
    yield put(campaignDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    const msg = err.message || 'Failed to delete campaign';
    action.meta?.reject?.(msg);
  }
}

// ─── Social Accounts Sagas ──────────────────────────────────────────────────
function* handleFetchSocialAccounts(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(marketingApi.getSocialAccounts, action.payload);
    yield put(setSocialAccounts(res.data || res));
    action.meta?.resolve?.(res.data || res);

  } catch (err: any) {
    yield put(setError(err.message || 'Failed to load social accounts'));
    action.meta?.reject?.(err.message || 'Failed to load social accounts');
  }
}

function* handleCreateSocialAccount(action: SagaAction): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.createSocialAccount, action.payload);
    yield put(socialAccountCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to add social account');
  }
}

function* handleDeleteSocialAccount(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield call(marketingApi.deleteSocialAccount, action.payload);
    yield put(socialAccountDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to delete social account');
  }
}

// ─── Posts Sagas ────────────────────────────────────────────────────────────
function* handleFetchPosts(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(marketingApi.getPosts, action.payload);
    yield put(setPosts(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to load posts'));
    action.meta?.reject?.(err.message || 'Failed to load posts');
  }
}

function* handleCreatePost(action: SagaAction): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.createPost, action.payload);
    yield put(postCreated(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to create post');
  }
}

function* handlePublishPost(action: SagaAction<string>): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.publishPost, action.payload);
    yield put(postPublished(res.data));
    action.meta?.resolve?.(res.data);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to publish post');
  }
}

function* handleDeletePost(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield call(marketingApi.deletePost, action.payload);
    yield put(postDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to delete post');
  }
}

// ─── Ads Sagas ──────────────────────────────────────────────────────────────
function* handleFetchAds(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const res = yield call(marketingApi.getAds, action.payload);
    yield put(setAds(res.data || res));
    action.meta?.resolve?.(res.data || res);
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to load ads'));
    action.meta?.reject?.(err.message || 'Failed to load ads');
  }
}

function* handleCreateAd(action: SagaAction): Generator<any, void, any> {
  try {
    const res = yield call(marketingApi.createAd, action.payload);
    yield put(adCreated(res.data));
    action.meta?.resolve?.(res.data);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to create ad');
  }
}

function* handleDeleteAd(action: SagaAction<string>): Generator<any, void, any> {
  try {
    yield call(marketingApi.deleteAd, action.payload);
    yield put(adDeleted(action.payload));
    action.meta?.resolve?.(action.payload);
  } catch (err: any) {
    action.meta?.reject?.(err.message || 'Failed to delete ad');
  }
}

// ─── All Marketing Data Saga ────────────────────────────────────────────────
function* handleFetchMarketingData(action: SagaAction): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const params = action.payload;
    const [cRes, sRes, pRes, aRes] = yield all([
      call(() => marketingApi.getCampaigns(params).catch(() => ({ data: [] }))),
      call(() => marketingApi.getSocialAccounts(params).catch(() => ({ data: [] }))),
      call(() => marketingApi.getPosts(params).catch(() => ({ data: [] }))),
      call(() => marketingApi.getAds(params).catch(() => ({ data: [] }))),
    ]);
    const bundle = {
      campaigns: cRes.data || [],
      socialAccounts: sRes.data || [],
      posts: pRes.data || [],
      ads: aRes.data || [],
    };

    yield put(setMarketingAllData(bundle));
    action.meta?.resolve?.(bundle);
  } catch (err: any) {
    yield put(setError(err.message || 'Failed to fetch marketing data'));
    action.meta?.reject?.(err.message);
  }
}

export function* marketingSaga() {
  yield all([
    takeLatest(fetchCampaigns.type, handleFetchCampaigns),
    takeEvery(createCampaign.type, handleCreateCampaign),
    takeEvery(updateCampaign.type, handleUpdateCampaign),
    takeEvery(deleteCampaign.type, handleDeleteCampaign),
    takeLatest(fetchSocialAccounts.type, handleFetchSocialAccounts),
    takeEvery(createSocialAccount.type, handleCreateSocialAccount),
    takeEvery(deleteSocialAccount.type, handleDeleteSocialAccount),
    takeLatest(fetchPosts.type, handleFetchPosts),
    takeEvery(createPost.type, handleCreatePost),
    takeEvery(publishPost.type, handlePublishPost),
    takeEvery(deletePost.type, handleDeletePost),
    takeLatest(fetchAds.type, handleFetchAds),
    takeEvery(createAd.type, handleCreateAd),
    takeEvery(deleteAd.type, handleDeleteAd),
    takeLatest(fetchMarketingData.type, handleFetchMarketingData),
  ]);
}
