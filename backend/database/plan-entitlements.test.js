const assert = require('node:assert/strict');
const test = require('node:test');

const { createMockPgPool } = require('../test-utils/mock-pg-pool');
const db = require('./db');

db.setPoolForTesting(createMockPgPool());

const user = {
  id: `test-student-${process.pid}`,
  role: 'student',
  name: 'Sinh viên kiểm thử',
  gender: 'Nữ',
  school: 'ĐH Khoa học Tự nhiên (HCMUS)',
  shortSchool: 'HCMUS'
};

async function makeUser(suffix) {
  const email = `student-${process.pid}-${suffix}@student.hcmus.edu.vn`;
  const reg = await db.registerUser({
    id: `${user.id}-${suffix}`,
    name: user.name,
    email,
    password: 'password123',
    schoolCode: 'HCMUS',
    gender: 'Nữ'
  });
  assert.equal(reg.ok, true);
  return reg.user;
}

const listingHcm = {
  postType: 'has-room',
  area: 'Thủ Đức',
  areaKey: 'thu-duc',
  city: 'TP.HCM',
  roomType: 'Studio',
  schoolPreference: 'HCMUS',
  budget: 2000000
};

const listingHn = {
  postType: 'find-room',
  area: 'Xuân Thủy, Cầu Giấy',
  areaKey: 'cau-giay',
  city: 'Hà Nội',
  roomType: 'Ở ghép',
  schoolPreference: 'VNU',
  budget: 1800000
};

test('free account can post once per Vietnam calendar day across HCM and HN, even after deleting the post', async () => {
  const testUser = await makeUser('free-post');
  const first = await db.createRoommateListing(testUser, listingHn);
  assert.equal(first.ok, true);
  assert.equal(first.roommate.city, 'Hà Nội');
  assert.equal(await db.deleteRoommateListing(testUser, first.roommate.id), true);

  const second = await db.createRoommateListing(testUser, listingHcm);
  assert.equal(second.ok, false);
  assert.equal(second.code, 'daily_limit');
});

test('the extra-posts package raises the daily roommate post limit to four', async () => {
  const testUser = await makeUser('extra-posts');
  const order = await db.createPlanOrder(testUser.id, {
    packageId: 'extra-posts-day',
    priceVnd: 1
  });
  assert.equal(order.ok, true);
  assert.equal(order.order.amountVnd, 49000);

  const activation = await db.confirmPlanOrder(testUser.id, order.order.id);
  assert.equal(activation.ok, true);
  assert.equal((await db.confirmPlanOrder(testUser.id, order.order.id)).alreadyConfirmed, true);

  const plans = await db.getUserPlans(testUser.id);
  const activePlan = plans.find((plan) => plan.id === 'extra-posts-day');
  const vietnamOffset = 7 * 60 * 60 * 1000;
  const nextVietnamMidnight = Math.floor((Date.now() + vietnamOffset) / 86400000 + 1) * 86400000 - vietnamOffset;
  assert.ok(Math.abs(activePlan.expiresAt - nextVietnamMidnight) < 1000);

  for (let count = 0; count < 4; count += 1) {
    assert.equal((await db.createRoommateListing(testUser, listingHcm)).ok, true);
  }
  const fifth = await db.createRoommateListing(testUser, listingHcm);
  assert.equal(fifth.ok, false);
  assert.equal(fifth.code, 'daily_limit');
});

test('an expired extra-posts package returns the account to the free daily limit', async () => {
  const testUser = await makeUser('expired-extra-posts');
  const order = await db.createPlanOrder(testUser.id, { packageId: 'extra-posts-day' });
  assert.equal(order.ok, true);
  assert.equal((await db.confirmPlanOrder(testUser.id, order.order.id)).ok, true);

  await db.openDatabaseConnection().query(
    "UPDATE user_plans SET expires_at = $1 WHERE user_id = $2 AND package_id = 'extra-posts-day'",
    [Date.now() - 1, testUser.id]
  );

  assert.equal((await db.createRoommateListing(testUser, listingHcm)).ok, true);
  assert.equal((await db.createRoommateListing(testUser, listingHcm)).code, 'daily_limit');
});

test('free accounts can submit one complete match per Vietnam day and quiz predictions stay locked until Plan 4/5', async () => {
  const testUser = await makeUser('match-limit');
  const answers = { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' };

  const firstSubmit = await db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 });
  assert.equal(firstSubmit.ok, true);
  assert.equal(firstSubmit.unlockedPrediction, false);

  const lockedPred = await db.getQuizPredictions(testUser.id);
  assert.equal(lockedPred.ok, false);
  assert.equal(lockedPred.locked, true);
  assert.equal(lockedPred.code, 'PLAN_REQUIRED');

  const second = await db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 });
  assert.equal(second.ok, false);
  assert.equal(second.code, 'daily_match_limit');
});

test('the unlimited-match package allows repeated complete matches and unlocks predictions', async () => {
  const testUser = await makeUser('unlimited-matches');
  const order = await db.createPlanOrder(testUser.id, { packageId: 'unlimited-matches-day' });
  assert.equal(order.ok, true);
  assert.equal((await db.confirmPlanOrder(testUser.id, order.order.id)).ok, true);

  const answers = { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' };
  const submit1 = await db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 });
  assert.equal(submit1.ok, true);
  assert.equal(submit1.unlockedPrediction, true);
  assert.equal((await db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 })).ok, true);

  const unlockedPred = await db.getQuizPredictions(testUser.id);
  assert.equal(unlockedPred.ok, true);
  assert.equal(unlockedPred.locked, false);
  assert.ok(unlockedPred.predictions.length > 0);
  assert.equal(typeof unlockedPred.predictions[0].matchScore, 'number');
});

test('a purchased boost targets an owned listing and gives it an expiry', async () => {
  const testUser = await makeUser('boost');
  const created = await db.createRoommateListing(testUser, listingHcm);
  assert.equal(created.ok, true);

  const order = await db.createPlanOrder(testUser.id, {
    packageId: 'boost-24h',
    targetId: created.roommate.id
  });
  assert.equal(order.ok, true);
  assert.equal((await db.confirmPlanOrder(testUser.id, order.order.id)).ok, true);

  const all = await db.getAllRoommates(testUser.id);
  const boosted = all.find((roommate) => roommate.id === created.roommate.id);
  assert.equal(boosted.isBoosted, true);
  assert.ok(boosted.boostExpiresAt > Date.now());
});

test('the bundle grants additional posts and bounded boost controls without infinite stacking', async () => {
  const testUser = await makeUser('bundle');
  const created = await db.createRoommateListing(testUser, listingHcm);
  assert.equal(created.ok, true);

  const order = await db.createPlanOrder(testUser.id, { packageId: 'all-in-one' });
  assert.equal(order.ok, true);
  assert.equal((await db.confirmPlanOrder(testUser.id, order.order.id)).ok, true);

  const firstBoost = await db.boostRoommateListing(testUser.id, created.roommate.id, '7d');
  assert.equal(firstBoost.ok, true);
  const secondBoost = await db.boostRoommateListing(testUser.id, created.roommate.id, '7d');
  assert.equal(secondBoost.ok, true);
  assert.equal(secondBoost.alreadyBoosted, true);
  assert.equal(secondBoost.expiresAt, firstBoost.expiresAt);

  for (let count = 1; count < 4; count += 1) {
    assert.equal((await db.createRoommateListing(testUser, listingHcm)).ok, true);
  }
  assert.equal((await db.createRoommateListing(testUser, listingHcm)).ok, false);
});
