const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const databasePath = path.join(os.tmpdir(), `roomie-plan-entitlements-${process.pid}.sqlite`);
process.env.ROOMIE_DB_PATH = databasePath;

const db = require('./db');

const user = {
  id: `test-student-${process.pid}`,
  role: 'student',
  name: 'Sinh viên kiểm thử',
  gender: 'Nữ',
  school: 'ĐH Khoa học Tự nhiên (HCMUS)',
  shortSchool: 'HCMUS'
};

function makeUser(suffix) {
  return { ...user, id: `${user.id}-${suffix}` };
}

const listing = {
  postType: 'has-room',
  area: 'Thủ Đức',
  areaKey: 'thu-duc',
  roomType: 'Studio',
  schoolPreference: 'HCMUS',
  budget: 2000000
};

test('free account can post once per Vietnam calendar day, even after deleting the post', () => {
  const testUser = makeUser('free-post');
  const first = db.createRoommateListing(testUser, listing);
  assert.equal(first.ok, true);
  assert.equal(db.deleteRoommateListing(testUser, first.roommate.id), true);

  const second = db.createRoommateListing(testUser, listing);
  assert.equal(second.ok, false);
  assert.equal(second.code, 'daily_limit');
});

test('the extra-posts package raises the daily roommate post limit to four', () => {
  const testUser = makeUser('extra-posts');
  const order = db.createPlanOrder(testUser.id, {
    packageId: 'extra-posts-day',
    priceVnd: 1
  });
  assert.equal(order.ok, true);
  assert.equal(order.order.amountVnd, 49000);

  const activation = db.confirmPlanOrder(testUser.id, order.order.id);
  assert.equal(activation.ok, true);
  assert.equal(db.confirmPlanOrder(testUser.id, order.order.id).alreadyConfirmed, true);
  const activePlan = db.getUserPlans(testUser.id).find((plan) => plan.id === 'extra-posts-day');
  const vietnamOffset = 7 * 60 * 60 * 1000;
  const nextVietnamMidnight = Math.floor((Date.now() + vietnamOffset) / 86400000 + 1) * 86400000 - vietnamOffset;
  assert.ok(Math.abs(activePlan.expiresAt - nextVietnamMidnight) < 1000);

  for (let count = 0; count < 4; count += 1) {
    assert.equal(db.createRoommateListing(testUser, listing).ok, true);
  }
  const fifth = db.createRoommateListing(testUser, listing);
  assert.equal(fifth.ok, false);
  assert.equal(fifth.code, 'daily_limit');
});

test('an expired extra-posts package returns the account to the free daily limit', () => {
  const testUser = makeUser('expired-extra-posts');
  const order = db.createPlanOrder(testUser.id, { packageId: 'extra-posts-day' });
  assert.equal(order.ok, true);
  assert.equal(db.confirmPlanOrder(testUser.id, order.order.id).ok, true);

  db.openDatabaseConnection()
    .prepare("UPDATE user_plans SET expires_at = ? WHERE user_id = ? AND package_id = 'extra-posts-day'")
    .run(Date.now() - 1, testUser.id);

  assert.equal(db.createRoommateListing(testUser, listing).ok, true);
  assert.equal(db.createRoommateListing(testUser, listing).code, 'daily_limit');
});

test('free accounts can submit one complete match per Vietnam day', () => {
  const testUser = makeUser('match-limit');
  const answers = { 1: 'A', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'B', 8: 'C', 9: 'A' };

  assert.equal(db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 }).ok, true);
  const second = db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 });
  assert.equal(second.ok, false);
  assert.equal(second.code, 'daily_match_limit');
});

test('the unlimited-match package allows repeated complete matches during its active period', () => {
  const testUser = makeUser('unlimited-matches');
  const order = db.createPlanOrder(testUser.id, { packageId: 'unlimited-matches-day' });
  assert.equal(order.ok, true);
  assert.equal(db.confirmPlanOrder(testUser.id, order.order.id).ok, true);

  const answers = { 1: 'A', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'B', 8: 'C', 9: 'A' };
  assert.equal(db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 }).ok, true);
  assert.equal(db.saveQuizSubmission(testUser.id, answers, { answeredCount: 9 }).ok, true);
});

test('a purchased boost targets an owned listing and gives it an expiry', () => {
  const testUser = makeUser('boost');
  const created = db.createRoommateListing(testUser, listing);
  assert.equal(created.ok, true);

  const order = db.createPlanOrder(testUser.id, {
    packageId: 'boost-24h',
    targetId: created.roommate.id
  });
  assert.equal(order.ok, true);
  assert.equal(db.confirmPlanOrder(testUser.id, order.order.id).ok, true);

  const boosted = db.getAllRoommates(testUser.id).find((roommate) => roommate.id === created.roommate.id);
  assert.equal(boosted.isBoosted, true);
  assert.ok(boosted.boostExpiresAt > Date.now());
});

test('the bundle grants both additional posts and boost controls for 30 days', () => {
  const testUser = makeUser('bundle');
  const created = db.createRoommateListing(testUser, listing);
  assert.equal(created.ok, true);

  const order = db.createPlanOrder(testUser.id, { packageId: 'all-in-one' });
  assert.equal(order.ok, true);
  assert.equal(db.confirmPlanOrder(testUser.id, order.order.id).ok, true);

  assert.equal(db.boostRoommateListing(testUser.id, created.roommate.id, '7d').ok, true);
  for (let count = 1; count < 4; count += 1) {
    assert.equal(db.createRoommateListing(testUser, listing).ok, true);
  }
  assert.equal(db.createRoommateListing(testUser, listing).ok, false);
});
