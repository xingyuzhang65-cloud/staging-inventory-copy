import fs from 'node:fs';
import assert from 'node:assert/strict';

const asModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const { editArrivalFields } = await import(asModule(fs.readFileSync(new URL('./clearance-edit-arrival.js', import.meta.url), 'utf8')));
const model = asModule(fs.readFileSync(new URL('./clearance-model.js', import.meta.url), 'utf8'));
const arrival = fs.readFileSync(new URL('./clearance-arrival.js', import.meta.url), 'utf8').replace("'./clearance-model.js'", JSON.stringify(model));
const { arrivalInfo } = await import(asModule(arrival));
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const fails = (fn, pattern) => { assert.throws(fn, pattern); checks++; };
const original = {
  id: 'QH-EDIT', status: '待受理', arrivedAt: '', receipts: [], deliveries: [],
  products: [
    { id: 'A', quantity: 10, received: 0, delivered: 0, shipped: '', tracking: '000123', carrier: 'UPS', extra: { note: '原资料' } },
    { id: 'B', quantity: 5, received: 0, delivered: 0, tracking: '000456', shipped: undefined }
  ]
};
const snapshot = structuredClone(original);
const edited = structuredClone(original.products); edited[0].quantity = 20;
const editedSnapshot = structuredClone(edited);
const complete = editArrivalFields(original, edited, { status: '已到仓', arrivedAt: '2026-10-08T09:30' });
deep(complete.products.map(product => product.received), [20, 5]);
deep(complete.products.map(product => product.arrivedAt), ['2026-10-08T09:30', '2026-10-08T09:30']);
eq(complete.arrivedAt, '2026-10-08T09:30');
eq(complete.receipts.length, 2);
deep(complete.receipts.map(record => [record.product, record.quantity, record.time, record.note]), [['A', 20, '2026-10-08T09:30', '编辑到仓信息'], ['B', 5, '2026-10-08T09:30', '编辑到仓信息']]);
eq(new Set(complete.receipts.map(record => record.id)).size, 2);
eq(complete.products[0].carrier, 'UPS'); eq(complete.products[0].tracking, '000123');
eq(complete.products[0].shipped, ''); eq(complete.products[1].shipped, undefined);
deep(original, snapshot); deep(edited, editedSnapshot);
complete.products[0].extra.note = '修改副本';
deep(original, snapshot);

const arrivedOrder = { ...structuredClone(original), ...structuredClone(complete) };
const arrivedSnapshot = structuredClone(arrivedOrder);
const corrected = editArrivalFields(arrivedOrder, arrivedOrder.products, { status: '已到仓', arrivedAt: '2026-10-09T11:00' });
eq(corrected.arrivedAt, '2026-10-09T11:00');
deep(corrected.products.map(product => product.arrivedAt), ['2026-10-09T11:00', '2026-10-09T11:00']);
deep(corrected.receipts, arrivedOrder.receipts, 'Changing the single arrival date must preserve receipt history without adding quantities again.');
deep(corrected.products.map(product => product.received), [20, 5]);
deep(arrivedOrder, arrivedSnapshot);
const changedQuantity = structuredClone(arrivedOrder.products); changedQuantity[0].quantity = 30;
const correctedQuantity = editArrivalFields(arrivedOrder, changedQuantity, { status: '已到仓', arrivedAt: '2026-10-09' });
eq(correctedQuantity.products[0].received, 30);
deep(correctedQuantity.receipts, arrivedOrder.receipts);

const cleared = editArrivalFields(arrivedOrder, arrivedOrder.products, { status: '未到仓', arrivedAt: '' });
deep(cleared.products.map(product => [product.received, product.arrivedAt]), [[0, ''], [0, '']]);
eq(cleared.arrivedAt, ''); deep(cleared.receipts, arrivedOrder.receipts, 'History remains available when correcting arrival back to not arrived.');
deep(arrivalInfo({ ...arrivedOrder, ...cleared }), { status: '未到仓', arrivedAt: '', received: 0, stock: 0, hasMissingTime: false });
deep(arrivedOrder, arrivedSnapshot);

const deliveredOrder = structuredClone(arrivedOrder); deliveredOrder.products[0].delivered = 20;
fails(() => editArrivalFields(deliveredOrder, deliveredOrder.products, { status: '未到仓' }), /已有实际提货记录/);
const physicalRecord = structuredClone(arrivedOrder); physicalRecord.deliveries.push({ product: 'A', quantity: 1 });
fails(() => editArrivalFields(physicalRecord, physicalRecord.products, { status: '未到仓' }), /已有实际提货记录/);
const deliveredSnapshot = structuredClone(deliveredOrder);
const correctedDelivered = editArrivalFields(deliveredOrder, deliveredOrder.products, { status: '已到仓', arrivedAt: '2026-10-10' });
eq(correctedDelivered.products[0].delivered, 20);
eq(arrivalInfo({ ...deliveredOrder, ...correctedDelivered }, 'A').status, '已到仓');
eq(arrivalInfo({ ...deliveredOrder, ...correctedDelivered }, 'A').stock, 0);
const tooFew = structuredClone(deliveredOrder.products); tooFew[0].quantity = 19;
fails(() => editArrivalFields(deliveredOrder, tooFew, { status: '已到仓', arrivedAt: '2026-10-10' }), /清货数量.*已提货数量/);
deep(deliveredOrder, deliveredSnapshot);

for (const arrivedAt of ['', '2026-10', '09:30', '2026-02-30', '2026-10-10T24:00', '2026-10-10T09:60', 'invalid']) {
  fails(() => editArrivalFields(original, edited, { status: '已到仓', arrivedAt }), /有效实际到仓时间/);
}
fails(() => editArrivalFields(original, edited, { status: '未到仓', arrivedAt: '2026-10-08' }), /清空到仓时间/);
fails(() => editArrivalFields(original, edited, { status: '部分到仓', arrivedAt: '2026-10-08' }), /有效到仓状态/);
fails(() => editArrivalFields(original, edited.slice(0, 1), { status: '未到仓' }), /产品信息不完整/);
const duplicates = structuredClone(edited); duplicates[1].id = 'A';
fails(() => editArrivalFields(original, duplicates, { status: '未到仓' }), /ID 不存在或重复/);
deep(original, snapshot); deep(edited, editedSnapshot);
console.log(`${checks} assertions passed: arrival edits in both directions, one order arrival time, receipt history retention, delivery protection, quantity consistency, immutable inputs.`);
