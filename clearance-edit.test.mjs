import fs from 'node:fs';
import assert from 'node:assert/strict';

const asModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const importer = asModule(fs.readFileSync(new URL('./clearance-import.js', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('./clearance-edit.js', import.meta.url), 'utf8').replace("'./clearance-import.js'", JSON.stringify(importer));
const { editProductFields } = await import(asModule(source));
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const fails = (fn, pattern) => { assert.throws(fn, pattern); checks++; };
const original = (id = 'P1') => ({
  id, name: '原产品', sku: `SKU-${id}`, quantity: 20, received: 4, delivered: 2,
  weight: 0.8, dimensions: [30, 20, 10], boxes: 2, link: 'https://amazon.com/dp/ORIGINAL', image: 'https://example.com/original.jpg',
  price: 9.99, currency: 'USD', tracking: 'OLD-TRACK', shipped: '2026-09-28', requirement: '原操作要求',
  carrier: 'UPS', arrivedAt: '2026-10-01T09:00', extra: { note: '保留附加数据' }
});
const values = () => ['修改后产品', 'EDITED-SKU', '30', '1.8', '40', '30', '20', '3', 'https://amazon.com/dp/EDITED', 'https://example.com/edited.jpg', '42.5', 'cad', '00012345', '2026-10-08', '新要求\n完整保留'];
const row = (id = 'P1', edited = values()) => ({ id, values: edited });

const products = [original()], snapshot = structuredClone(products), edits = [row()], editSnapshot = structuredClone(edits);
const result = editProductFields(products, edits);
deep(result[0], {
  ...products[0], name: '修改后产品', sku: 'EDITED-SKU', quantity: 30, weight: 1.8, dimensions: [40, 30, 20], boxes: 3,
  link: 'https://amazon.com/dp/EDITED', image: 'https://example.com/edited.jpg', price: 42.5, currency: 'CAD',
  tracking: '00012345', shipped: '2026-10-08', requirement: '新要求\n完整保留'
});
deep(products, snapshot); deep(edits, editSnapshot);
result[0].extra.note = '改动返回副本';
deep(products, snapshot, 'Nested extra fields are cloned rather than shared with the original product.');
eq(result[0].id, 'P1'); eq(result[0].received, 4); eq(result[0].delivered, 2);
eq(result[0].carrier, 'UPS'); eq(result[0].arrivedAt, '2026-10-01T09:00');

const blank = values(); for (const index of [3, 4, 5, 6, 7, 10, 11, 12, 13, 14]) blank[index] = '';
const defaults = editProductFields(products, [row('P1', blank)])[0];
deep([defaults.weight, ...defaults.dimensions, defaults.boxes, defaults.price], [0, 0, 0, 0, 0, 0]);
eq(defaults.currency, 'USD'); eq(defaults.tracking, ''); eq(defaults.shipped, '');

const pair = [original('P1'), original('P2')], pairSnapshot = structuredClone(pair);
const badWeight = values(), badPrice = values(); badWeight[3] = '-1'; badPrice[10] = 'bad'; badPrice[1] = 'OTHER-SKU';
fails(() => editProductFields(pair, [row('P1', badWeight), row('P2', badPrice)]), /产品 1：.*单件重量[\s\S]*产品 2：.*亚马逊售价/);
deep(pair, pairSnapshot);
const duplicate = values(); duplicate[1] = 'edited-sku';
fails(() => editProductFields(pair, [row('P1'), row('P2', duplicate)]), /产品 1：.*SKU 重复[\s\S]*产品 2：.*SKU 重复/);
for (const [index, value, label] of [[0, '', '产品名称'], [2, 0, '清货数量'], [2, 0.5, '清货数量'], [7, 1.5, '预报箱数'], [8, 'javascript:alert(1)', '产品销售链接'], [9, 'ftp://example.com/image.jpg', '产品图片链接'], [13, '2026-02-30', '发运时间']]) {
  const invalid = values(); invalid[index] = value;
  fails(() => editProductFields(products, [row('P1', invalid)]), new RegExp(`产品 1：.*${label}`));
}
const belowStock = values(); belowStock[2] = 3;
fails(() => editProductFields(products, [row('P1', belowStock)]), /产品 1：.*清货数量.*已实收或已提货/);
const deliveredOnly = original(); deliveredOnly.received = 0; deliveredOnly.delivered = 5;
const belowDelivered = values(); belowDelivered[2] = 4;
fails(() => editProductFields([deliveredOnly], [row('P1', belowDelivered)]), /清货数量.*已实收或已提货/);
fails(() => editProductFields(pair, [row('P1')]), /产品 2：.*遗漏/);
fails(() => editProductFields(products, [row('UNKNOWN')]), /产品 1：.*ID 不存在/);
fails(() => editProductFields(pair, [row('P1'), row('P1')]), /产品 2：.*ID 重复/);
fails(() => editProductFields(products, [row('P1', values().slice(0, 14))]), /产品 1：.*15/);
const reorderedSecond = values(); reorderedSecond[1] = 'SECOND-SKU';
deep(editProductFields(pair, [row('P2', reorderedSecond), row('P1')]).map(product => product.id), ['P1', 'P2']);

const legacy = original(); legacy.image = 'data:image/svg+xml;charset=utf-8,<svg></svg>'; legacy.shipped = '2026-09-28T09:00';
const unchangedLegacy = values(); unchangedLegacy[9] = legacy.image; unchangedLegacy[13] = legacy.shipped;
const savedLegacy = editProductFields([legacy], [row('P1', unchangedLegacy)])[0];
eq(savedLegacy.image, legacy.image); eq(savedLegacy.shipped, legacy.shipped); eq(savedLegacy.name, '修改后产品');
const forgedLegacyImage = unchangedLegacy.slice(); forgedLegacyImage[9] = 'data:image/png;base64,changed';
fails(() => editProductFields([legacy], [row('P1', forgedLegacyImage)]), /产品 1：.*产品图片链接/);
const forgedTimestamp = unchangedLegacy.slice(); forgedTimestamp[13] = '2026-10-08T10:30';
fails(() => editProductFields([legacy], [row('P1', forgedTimestamp)]), /产品 1：.*发运时间/);
const updatedLegacy = unchangedLegacy.slice(); updatedLegacy[9] = 'https://example.com/new.jpg'; updatedLegacy[13] = '2026-10-08';
const savedUpdatedLegacy = editProductFields([legacy], [row('P1', updatedLegacy)])[0];
eq(savedUpdatedLegacy.image, updatedLegacy[9]); eq(savedUpdatedLegacy.shipped, updatedLegacy[13]);
deep(products, snapshot); deep(pair, pairSnapshot);
console.log(`${checks} assertions passed: all editable template fields, complete row validation, product identity and inventory preservation, unchanged historical values, rejected legacy value changes.`);
