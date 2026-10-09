import fs from 'node:fs';
import assert from 'node:assert/strict';

const asModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const model = asModule(fs.readFileSync(new URL('./clearance-model.js', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('./clearance-arrival.js', import.meta.url), 'utf8').replace("'./clearance-model.js'", JSON.stringify(model));
const { arrivalInfo, arrivalMatches, registerArrival } = await import(asModule(source));
const M = await import(model);
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const fails = (fn, pattern) => { assert.throws(fn, pattern); checks++; };
const product = (id, quantity, received, delivered = 0) => ({ id, quantity, received, delivered });
const record = (id, product, quantity, time) => ({ id, product, quantity, time });

const legacy = {
  products: [product('A', 100, 60, 10), product('B', 40, 40, 5)],
  receipts: [record('LATE', 'A', 30, '2026-10-08 23:59:59'), record('B', 'B', 40, '2026-10-05'), record('EARLY', 'A', 30, '2026-10-01T09:30')],
  created: '2026-09-01', shipped: '2026-09-10'
};
const before = structuredClone(legacy);
deep(arrivalInfo(legacy), { status: '已到仓', arrivedAt: '2026-10-01T09:30', received: 100, stock: 85, hasMissingTime: false });
deep(arrivalInfo(legacy, 'B'), { status: '已到仓', arrivedAt: '2026-10-05', received: 40, stock: 35, hasMissingTime: false });
deep(legacy, before, 'Arrival lookups must not sort or edit stored historical records.');
eq(arrivalMatches(legacy), true);
eq(arrivalMatches(legacy, { arrival: '已到仓' }), true);
eq(arrivalMatches(legacy, { arrival: '未到仓' }), false);
eq(arrivalMatches(legacy, { arrivalFrom: '2026-10-01', arrivalTo: '2026-10-01' }), true);
eq(arrivalMatches(legacy, { arrivalTo: '2026-10-01' }), true);
eq(arrivalMatches(legacy, { arrivalFrom: '2026-10-05', arrivalTo: '2026-10-08' }), false, 'A later historical receipt cannot replace the single arrival date.');
eq(arrivalMatches(legacy, { arrivalFrom: '2026-10-08', arrivalTo: '2026-10-01' }), false);
eq(arrivalMatches(legacy, { arrivalFrom: '2026-02-30' }), false);

const explicit = structuredClone(legacy);
explicit.arrivedAt = '2026-10-07T23:59:59';
explicit.products[0].arrivedAt = '2026-10-06T09:00';
eq(arrivalInfo(explicit).arrivedAt, explicit.arrivedAt, 'An explicitly recorded order arrival takes precedence over legacy history.');
eq(arrivalInfo(explicit, 'A').arrivedAt, explicit.products[0].arrivedAt);
eq(arrivalInfo(explicit, 'B').arrivedAt, explicit.arrivedAt);
eq(arrivalMatches(explicit, { arrivalFrom: '2026-10-07', arrivalTo: '2026-10-07' }), true);
eq(arrivalMatches(explicit, { arrivalTo: '2026-10-06' }), false);
delete explicit.arrivedAt;
eq(arrivalInfo(explicit).arrivedAt, explicit.products[0].arrivedAt);
explicit.products[0].arrivedAt = 'invalid';
eq(arrivalInfo(explicit).arrivedAt, '2026-10-01T09:30');

const unknown = { products: [product('A', 100, 100)], created: '2026-09-01', shipped: '2026-09-10', receipts: [] };
deep(arrivalInfo(unknown), { status: '已到仓', arrivedAt: '', received: 100, stock: 100, hasMissingTime: true });
eq(arrivalMatches(unknown, { arrival: '已到仓' }), true);
eq(arrivalMatches(unknown, { arrivalFrom: '2026-09-01' }), false);
const emptied = { products: [product('A', 100, 100, 100)], arrivedAt: '2026-10-05' };
deep(arrivalInfo(emptied), { status: '已到仓', arrivedAt: '2026-10-05', received: 100, stock: 0, hasMissingTime: false });
const partial = { products: [product('A', 100, 10)], receipts: [record('ONE', 'A', 10, '2026-10-05')] };
eq(arrivalInfo(partial).status, '已到仓');

for (const time of ['', '09:30', '2026-10', '2026-02-30', '2026-10-05T24:00', '2026-10-05T10:61', 'invalid']) {
  const invalid = { products: [product('A', 100, 10)], receipts: [record('INVALID', 'A', 10, time)] };
  eq(arrivalInfo(invalid).hasMissingTime, true); eq(arrivalInfo(invalid).arrivedAt, '');
  eq(arrivalMatches(invalid, { arrivalTo: '2026-10-08' }), false);
}
const ignored = { products: [product('A', 100, 0)], receipts: [record('OTHER', 'B', 10, '2026-10-05'), record('ZERO', 'A', 0, '2026-10-05')] };
deep(arrivalInfo(ignored), { status: '未到仓', arrivedAt: '', received: 0, stock: 0, hasMissingTime: false });
eq(arrivalMatches(ignored, { arrival: '未到仓' }), true);
eq(arrivalMatches(ignored, { arrivalTo: '2026-10-08' }), false);
const timezone = { products: [product('A', 20, 20)], receipts: [record('SECOND', 'A', 10, '2026-10-05T09:30:00Z'), record('FIRST', 'A', 10, '2026-10-05T15:00:00+08:00')] };
eq(arrivalInfo(timezone).arrivedAt, '2026-10-05T15:00:00+08:00');
eq(arrivalInfo(timezone).hasMissingTime, false);
deep(legacy, before);

function receivable() {
  const order = M.seed()[0];
  M.acceptOrder(order);
  M.addQuote(order, order.products[0].id, 'Buyer', 60, 600);
  return order;
}
const whole = receivable();
registerArrival(whole, '2026-10-08T11:30', '整单到仓', 'UPS');
eq(M.sum(whole, 'received'), M.sum(whole, 'quantity'));
eq(whole.arrivedAt, '2026-10-08T11:30');
deep(whole.products.map(product => product.arrivedAt), ['2026-10-08T11:30', '2026-10-08T11:30']);
deep(whole.products.map(product => product.shipped), ['', ''], 'Arrival registration cannot invent a missing shipment time.');
eq(arrivalInfo(whole).status, '已到仓');
const withoutShipment = receivable();
delete withoutShipment.products[0].shipped;
withoutShipment.products[1].shipped = undefined;
registerArrival(withoutShipment, '2026-10-08T11:30');
eq(Object.hasOwn(withoutShipment.products[0], 'shipped'), false);
eq(withoutShipment.products[1].shipped, undefined);
const receivedSnapshot = structuredClone(whole);
fails(() => registerArrival(whole, '2026-10-09T11:30'), /当前状态/);
deep(whole, receivedSnapshot, 'Repeat registration must not receive goods again or rewrite arrival dates.');
const invalidTime = receivable(), invalidSnapshot = structuredClone(invalidTime);
fails(() => registerArrival(invalidTime, '2026-02-30'), /有效实际到仓时间/);
deep(invalidTime, invalidSnapshot);
const prohibited = M.seed()[0], prohibitedSnapshot = structuredClone(prohibited);
fails(() => registerArrival(prohibited, '2026-10-08T11:30'), /当前状态/);
deep(prohibited, prohibitedSnapshot);
const failing = receivable(); failing.products[1].quantity = 0.5;
const failingSnapshot = structuredClone(failing);
fails(() => registerArrival(failing, '2026-10-08T11:30'), /整数/);
deep(failing, failingSnapshot, 'A failure on a later product must roll back earlier temporary receipts.');
const legacyPartial = receivable();
M.receive(legacyPartial, legacyPartial.products[0].id, 20, '2026-10-01T09:00', '', 'UPS');
registerArrival(legacyPartial, '2026-10-08T11:30');
eq(legacyPartial.arrivedAt, '2026-10-01T09:00');
eq(legacyPartial.products[0].arrivedAt, '2026-10-01T09:00');
eq(legacyPartial.products[1].arrivedAt, '2026-10-08T11:30');
eq(M.sum(legacyPartial, 'received'), M.sum(legacyPartial, 'quantity'));
eq(legacyPartial.receipts.some(record => record.time === '2026-10-01T09:00'), true);
console.log(`${checks} assertions passed: single arrival date, historical fallback, inclusive filters, complete atomic order registration, unchanged data on invalid or repeat actions.`);
