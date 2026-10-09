import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('./clearance-model.js', import.meta.url), 'utf8');
const M = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const fails = (fn, pattern) => { assert.throws(fn, pattern); checks++; };
const time = '2026-10-08T11:30';
function order() { const o = M.seed()[0]; o.products = o.products.slice(0, 1); return o; }
function accepted(quantity = 60, received = 100) {
  const o = order(), p = o.products[0];
  M.acceptOrder(o);
  M.addQuote(o, p.id, 'Local Outlet', quantity, quantity * 10);
  if (received) M.receive(o, p.id, received, time, '', 'UPS');
  M.decideQuote(o, o.quotes[0].id, true);
  return o;
}
const actions = ['edit', 'accept', 'cancel', 'receive', 'shipping', 'quote', 'decide', 'deliver', 'settle', 'extend', 'terminate'];
const permissions = o => actions.filter(action => M.can(o, action));

// A complete lifecycle proves the distinction between reservation and physical stock.
const o = order(), p = o.products[0];
eq(M.receipt(o), '未发运');
deep(permissions(o), ['edit', 'accept', 'cancel']);
fails(() => M.receive(o, p.id, 10, time, '', 'UPS'), /当前状态/);
fails(() => M.ship(o, p.id, 'TRACK', time, 'UPS'), /当前状态/);
fails(() => M.addQuote(o, p.id, 'Buyer', 10, 100), /当前状态/);
M.acceptOrder(o);
eq(o.status, '寻找买家中');
deep(permissions(o), ['quote', 'terminate']);
fails(() => M.acceptOrder(o), /仅待受理/);
const searchingSnapshot = structuredClone(o);
fails(() => M.receive(o, p.id, 10, time, '寻找阶段收货', 'UPS'), /当前状态/);
deep(o, searchingSnapshot, 'Searching cannot change inventory, receipts, logs, or timestamps through receiving.');
fails(() => M.ship(o, p.id, ' 1Z-100 ', time, ' UPS '), /当前状态/);
deep(o, searchingSnapshot, 'Searching cannot change tracking, shipment, logs, or timestamps through shipping.');
M.addQuote(o, p.id, 'Local Outlet', 60, 720);
const q = o.quotes[0];
eq(o.status, '待确认报价');
deep(permissions(o), ['receive', 'shipping', 'decide', 'terminate']);
M.ship(o, p.id, ' 1Z-100 ', time, ' UPS ');
eq(M.receipt(o), '运输中'); eq(p.tracking, '1Z-100'); eq(p.carrier, 'UPS');
fails(() => M.addQuote(o, p.id, 'Another', 40, 400), /当前状态/);
M.decideQuote(o, q.id, true);
eq(o.status, '待提货'); eq(M.stock(p), 0); eq(M.reserved(o, p.id), 60); eq(M.available(o, p), 0);
deep(permissions(o), ['receive', 'shipping', 'deliver']);
fails(() => M.deliver(o, q.id, 1, time, 'John', ''), /实物在库不足/);
fails(() => M.terminate(o, '客户终止'), /当前阶段/);
M.receive(o, p.id, 40, time, '第一批', 'UPS');
eq(M.receipt(o), '部分入仓'); eq(M.stock(p), 40);
M.receive(o, p.id, 60, time, '第二批', 'UPS');
eq(M.receipt(o), '已入仓'); eq(o.receipts.length, 2);
eq(M.stock(p), 100); eq(M.reserved(o, p.id), 60); eq(M.available(o, p), 40);
deep(permissions(o), ['deliver']);
fails(() => M.receive(o, p.id, 1, time, '', 'UPS'), /当前状态/);
fails(() => M.ship(o, p.id, 'OTHER', time, 'UPS'), /当前状态/);
fails(() => M.deliver(o, q.id, 61, time, 'John', ''), /剩余待提/);
fails(() => M.deliver(o, q.id, 10, time, ' ', ''), /提货时间和提货人/);
fails(() => M.deliver(o, q.id, 10, 'invalid', 'John', ''), /提货时间和提货人/);
eq(q.delivered, 0); eq(o.deliveries.length, 0); eq(M.stock(p), 100);
M.deliver(o, q.id, 20, time, ' John ', '首批提货');
eq(q.delivered, 20); eq(p.delivered, 20); eq(M.stock(p), 80);
eq(M.reserved(o, p.id), 40); eq(M.available(o, p), 40); eq(o.status, '待提货');
eq(o.deliveries[0].receiver, 'John'); eq(o.deliveries[0].quantity, 20);
fails(() => M.settle(o, q.id), /当前状态/);
M.deliver(o, q.id, 40, time, 'John', '第二批');
eq(o.status, '待结算'); eq(o.deliveries.length, 2);
eq(M.stock(p), 40); eq(M.reserved(o, p.id), 0); eq(M.available(o, p), 40);
deep(permissions(o), ['settle']);
fails(() => M.deliver(o, q.id, 1, time, 'John', ''), /当前状态/);
M.settle(o, q.id);
eq(q.settled, true); eq(o.status, '寻找买家中');
fails(() => M.settle(o, q.id), /当前状态/);
M.addQuote(o, p.id, 'Second Outlet', 40, 400);
const q2 = o.quotes[0]; M.decideQuote(o, q2.id, true);
M.deliver(o, q2.id, 40, time, 'Jane', '剩余提货');
eq(o.status, '待结算'); M.settle(o, q2.id);
eq(o.status, '已完成'); eq(M.stock(p), 0); eq(p.delivered, 100);
deep(permissions(o), []);
eq(Object.hasOwn(o, 'instructions'), false);
eq(M.createInstruction, undefined); eq(M.actInstruction, undefined);

// Input validation cannot alter inventory or create partial records on failure.
for (const quantity of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  const invalid = accepted();
  fails(() => M.deliver(invalid, invalid.quotes[0].id, quantity, time, 'John', ''), /整数/);
  eq(invalid.products[0].delivered, 0); eq(invalid.deliveries.length, 0);
}
const receiving = order(), rp = receiving.products[0]; M.acceptOrder(receiving);
fails(() => M.addQuote(receiving, rp.id, 'Buyer', 101, 100), /未成交数量/);
fails(() => M.addQuote(receiving, rp.id, '', 10, 100), /有效报价/);
fails(() => M.addQuote(receiving, rp.id, 'Buyer', 10, 0), /有效报价/);
M.addQuote(receiving, rp.id, 'Buyer', 10, 100);
fails(() => M.receive(receiving, rp.id, 101, time, '', 'UPS'), /剩余待收/);
fails(() => M.receive(receiving, rp.id, 1, 'invalid', '', 'UPS'), /入库时间/);
fails(() => M.receive(receiving, 'missing', 1, time, '', 'UPS'), /选择产品/);
fails(() => M.ship(receiving, rp.id, '', time, 'UPS'), /追踪单号/);
eq(rp.received, 0); eq(receiving.receipts.length, 0);

// Rejecting a quote returns to searching; cancellation and termination remain distinct logs.
const rejected = order(), rjp = rejected.products[0]; M.acceptOrder(rejected);
M.addQuote(rejected, rjp.id, 'Declined Buyer', 30, 300);
M.decideQuote(rejected, rejected.quotes[0].id, false);
eq(rejected.status, '寻找买家中'); eq(rejected.quotes[0].result, '已拒绝'); eq(M.reserved(rejected, rjp.id), 0);
const canceled = order(); M.terminate(canceled, '重复申请');
eq(canceled.status, '已终止'); eq(canceled.logs[0].action, '取消申请'); deep(permissions(canceled), []);
const ended = order(), ep = ended.products[0]; M.acceptOrder(ended);
M.addQuote(ended, ep.id, 'Pending Buyer', 30, 300); M.receive(ended, ep.id, 50, time, '', 'UPS');
M.terminate(ended, '客户选择停止');
eq(ended.status, '已终止'); eq(ended.logs[0].action, '终止清货');
eq(ended.quotes[0].result, '已取消'); eq(M.stock(ep), 50); eq(M.reserved(ended, ep.id), 0);
for (const closed of [canceled, ended, o]) {
  fails(() => M.acceptOrder(closed)); fails(() => M.receive(closed, closed.products[0].id, 1, time, '', 'UPS'));
  fails(() => M.addQuote(closed, closed.products[0].id, 'Buyer', 1, 10)); fails(() => M.terminate(closed, 'again'));
}

// Multiple quote records must expose independently eligible deliveries and settlements.
const mixed = accepted(60), mp = mixed.products[0], mq = mixed.quotes[0];
mixed.quotes.push({id: 'MIXED-2', product: mp.id, buyer: 'Second Buyer', quantity: 40, amount: 400, result: '已接受', delivered: 0, settled: false});
M.deliver(mixed, mq.id, 60, time, 'John', '');
eq(mixed.status, '待提货'); eq(M.can(mixed, 'deliver'), true); eq(M.can(mixed, 'settle'), true);
fails(() => M.settle(mixed, 'MIXED-2'), /全部交付/);
M.settle(mixed, mq.id); eq(mixed.status, '待提货'); eq(mq.settled, true);
M.deliver(mixed, 'MIXED-2', 40, time, 'Jane', ''); M.settle(mixed, 'MIXED-2');
eq(mixed.status, '已完成'); eq(M.stock(mp), 0);
const pendingMix = accepted(60), pm = pendingMix.products[0], pq = pendingMix.quotes[0];
pendingMix.quotes.push({id: 'PENDING-2', product: pm.id, buyer: 'Pending Buyer', quantity: 40, amount: 400, result: '待确认', delivered: 0, settled: false});
M.refresh(pendingMix); eq(pendingMix.status, '待确认报价');
eq(M.can(pendingMix, 'deliver'), true); M.deliver(pendingMix, pq.id, 20, time, 'John', '');
fails(() => M.terminate(pendingMix, '停止'), /已交付未结算/);
M.deliver(pendingMix, pq.id, 40, time, 'John', ''); eq(M.can(pendingMix, 'settle'), true);
M.settle(pendingMix, pq.id); M.terminate(pendingMix, '停止未成交部分');
eq(pendingMix.status, '已终止'); eq(M.stock(pm), 40); eq(M.reserved(pendingMix, pm.id), 0);

// Customer consent is recorded once; the total search period does not reset.
const older = order(); M.acceptOrder(older);
fails(() => M.extend(older, true), /当前状态/);
older.searchAt = new Date(Date.now() - 9 * 86400000).toISOString();
eq(M.can(older, 'extend'), true); fails(() => M.extend(older, false), /同意/);
const originalSearch = older.searchAt; M.extend(older, true);
eq(older.extended, true); eq(Boolean(older.consentAt), true); eq(older.searchAt, originalSearch);
fails(() => M.extend(older, true), /当前状态/);
older.searchAt = new Date(Date.now() - 31 * 86400000).toISOString();
eq(M.can(older, 'quote'), false); eq(M.can(older, 'terminate'), true);
fails(() => M.addQuote(older, older.products[0].id, 'Late Buyer', 10, 100), /当前状态/);

// Migration retains completed physical delivery and removes the former instruction workflow.
const legacy = M.seed()[4], lp = legacy.products[0];
legacy.deliveries = [];
legacy.instructions = [
  {id: 'OLD-DONE', product: lp.id, quantity: 120, quote: legacy.quotes[0].id, status: '已完成', created: time, completed: time},
  {id: 'OLD-PENDING', product: lp.id, quantity: 5, quote: '', status: '待审批', created: time},
  {id: 'OLD-REJECTED', product: lp.id, quantity: 2, quote: '', status: '已拒绝', created: time}
];
legacy.logs.unshift({action: '创建指令'}, {action: '审批通过'}, {action: '执行完成'}, {action: '登记收货', note: '有效历史'});
const migrated = M.migrate([legacy])[0];
eq(Object.hasOwn(migrated, 'instructions'), false); eq(legacy.instructions.length, 3);
eq(migrated.deliveries.length, 1); eq(migrated.deliveries[0].quantity, 120);
eq(migrated.deliveries[0].quote, migrated.quotes[0].id); eq(migrated.deliveries[0].buyer, migrated.quotes[0].buyer);
eq(migrated.products[0].delivered, 120); eq(migrated.quotes[0].delivered, 120);
eq(M.stock(migrated.products[0]), 0); eq(M.reserved(migrated, lp.id), 0);
eq(migrated.logs.some(l => /(指令|审批|执行)/.test(l.action)), false);
eq(migrated.logs.some(l => l.action === '登记收货'), true);
M.settle(migrated, migrated.quotes[0].id); eq(migrated.status, '已完成');
const migratedAgain = M.migrate([migrated])[0]; eq(migratedAgain.deliveries.length, 1);

for (const seeded of M.seed()) for (const product of seeded.products) {
  eq(M.stock(product) >= 0, true); eq(M.reserved(seeded, product.id) >= 0, true);
}
console.log(`${checks} assertions passed: state permissions, direct pickup, batched receipts, partial trade settlement, mixed quote eligibility, search deadlines, cancellation and legacy migration.`);
