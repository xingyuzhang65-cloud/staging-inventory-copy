import fs from 'node:fs';
import assert from 'node:assert/strict';

const asModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const importer = asModule(fs.readFileSync(new URL('./clearance-import.js', import.meta.url), 'utf8'));
const model = asModule(fs.readFileSync(new URL('./clearance-model.js', import.meta.url), 'utf8'));
const arrival = asModule(fs.readFileSync(new URL('./clearance-arrival.js', import.meta.url), 'utf8')
  .replace("'./clearance-model.js'", JSON.stringify(model)));
const source = fs.readFileSync(new URL('./clearance-fields.js', import.meta.url), 'utf8')
  .replace("'./clearance-import.js'", JSON.stringify(importer))
  .replace("'./clearance-model.js'", JSON.stringify(model))
  .replace("'./clearance-arrival.js'", JSON.stringify(arrival));
const { TEMPLATE_FIELDS, productFieldValue, matchesProductFilters, exportProductGrid } = await import(asModule(source));
const { HEADERS } = await import(importer);
let checks = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };
const deep = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
const order = products => ({ id: 'QH-1', customer: '客户甲', warehouse: 'LAX', status: '待确认报价', created: '2026-10-01 09:00', updated: '2026-10-08 10:00', products });
const first = {
  id: 'P1', name: '蓝牙 Speaker', sku: 'SPK-001', quantity: 100, weight: 0.8, dimensions: [42, 30, 25], boxes: 10,
  link: 'https://amazon.com/dp/BLUE', image: 'https://example.com/Blue.jpg', price: 29.99, currency: 'USD',
  tracking: '00012345', shipped: '2026-10-08T23:59:59', requirement: '保留包装\n备注完整', received: 80, delivered: 20
};
const second = { ...first, id: 'P2', name: '收纳架', sku: 'RACK-002', tracking: 'SECOND-999', quantity: 40, received: 0, delivered: 0 };
const multiple = order([first, second]);

deep(TEMPLATE_FIELDS.map(field => field.label), HEADERS.map(label => label.replaceAll('*', '')));
deep(TEMPLATE_FIELDS.map(field => field.index), Array.from({ length: 15 }, (_, index) => index));
deep(['length', 'width', 'height'].map(key => productFieldValue(first, key)), [42, 30, 25]);
eq(productFieldValue({}, 'weight'), '');
eq(productFieldValue({ price: 0 }, 'price'), 0);
eq(matchesProductFilters({ products: [] }, {}), true);
eq(matchesProductFilters(multiple, { productName: 'SPEAKER', tracking: '000123', sku: 'spk' }), true);
eq(matchesProductFilters(multiple, { productName: 'speaker', tracking: 'SECOND' }), false, 'Different products cannot jointly satisfy one product search.');
eq(matchesProductFilters(multiple, { link: '/blue', image: 'BLUE.JPG', requirement: '备注', currency: 'usd' }), true);
eq(matchesProductFilters(multiple, { currency: 'US' }), false);
eq(matchesProductFilters(multiple, { sku: 'spk', quantityMin: 100, quantityMax: 100, weightMin: 0.8, weightMax: 0.8, lengthMin: 42, widthMax: 30, heightMin: 25, boxesMax: 10, priceMin: 29.99 }), true);
eq(matchesProductFilters(multiple, { sku: 'spk', quantityMax: 40 }), false);
eq(matchesProductFilters(multiple, { priceMin: 30, priceMax: 20 }), false);
eq(matchesProductFilters(multiple, { priceMin: 'invalid' }), false);

// Blank optional numbers never act like zero; an explicitly supplied zero remains searchable.
for (const key of ['weight', 'length', 'width', 'height', 'boxes', 'price']) {
  eq(matchesProductFilters(order([{ quantity: 10, dimensions: [], [key]: null }]), { [`${key}Min`]: 0, [`${key}Max`]: 0 }), false);
}
eq(matchesProductFilters(order([{ weight: '', price: ' ' }]), { weightMax: 1 }), false);
eq(matchesProductFilters(order([{ weight: 0, price: 0, dimensions: [0, 0, 0], boxes: 0 }]), { weightMin: 0, weightMax: 0, priceMax: 0, lengthMax: 0, widthMax: 0, heightMax: 0, boxesMax: 0 }), true);

// Date bounds include the full boundary day, and require a real shipment date.
eq(matchesProductFilters(multiple, { shippedFrom: '2026-10-08', shippedTo: '2026-10-08' }), true);
eq(matchesProductFilters(multiple, { shippedTo: '2026-10-07' }), false);
eq(matchesProductFilters(multiple, { shippedFrom: '2026-10-09' }), false);
eq(matchesProductFilters(order([{ shipped: '' }]), { shippedTo: '2026-10-08' }), false);
eq(matchesProductFilters(order([{ shipped: '2026-02-30' }]), { shippedFrom: '2026-02-01' }), false);
eq(matchesProductFilters(order([{ shipped: '2026-10-08Tinvalid' }]), { shippedFrom: '2026-10-08' }), false);
eq(matchesProductFilters(multiple, { shippedFrom: '2026-10-09', shippedTo: '2026-10-08' }), false);
eq(matchesProductFilters(multiple, { shippedFrom: '2026-02-30' }), false);

const grid = exportProductGrid([multiple]);
eq(grid.length, 3);
eq(grid[0].length, 29);
deep(grid[0].slice(0, 15), HEADERS.map(label => label.replaceAll('*', '')));
deep(grid[0].slice(15), ['清货单号', '客户名称', '清货仓库', '清货状态', '到仓状态', '实收数量(件)', '当前在库(件)', '已提货数量(件)', '申请时间', '最后更新时间', '到仓时间', '出仓时间', '受理时间', '清货时长']);
deep(grid[1].slice(0, 15), ['蓝牙 Speaker', 'SPK-001', 100, 0.8, 42, 30, 25, 10, first.link, first.image, 29.99, 'USD', '00012345', '2026-10-08T23:59:59', first.requirement]);
deep(grid[1].slice(15), ['QH-1', '客户甲', 'LAX', '待确认报价', '已到仓', 80, 60, 20, multiple.created, multiple.updated, '', '', '', '受理时间待补录']);
deep(grid[2].slice(0, 3), ['收纳架', 'RACK-002', 40]);
eq(grid[2][12], 'SECOND-999');
deep(grid[2].slice(20, 23), [0, 0, 0]);
eq(grid[2][19], '未到仓'); eq(grid[2][25], '');
eq(exportProductGrid([]).length, 1);

// Actual outbound records stay separate from arrivals and forecasts.
const departed=structuredClone(multiple);
departed.deliveries=[{product:'P1',quantity:10,time:'2026-10-07T09:00'},{product:'P1',quantity:10,time:'2026-10-08T13:00'}];
departed.acceptedAt='2026-10-01T09:00';
departed.closedAt='2026-10-10T13:00';departed.status='已终止';
const departureGrid=exportProductGrid([departed]);
eq(departureGrid[1][26],'2026-10-07T09:00；2026-10-08T13:00');
eq(departureGrid[2][26],'');eq(departureGrid[1][27],departed.acceptedAt);eq(departureGrid[1][28],'9 天 4 小时');

// Arrival columns trace actual receipt history, never shipment or application dates.
const history = order([{ ...first }, { ...second }]);
history.receipts = [
  { product: 'P1', quantity: 30, time: '2026-10-05T13:00' },
  { product: 'P1', quantity: 50, time: '2026-10-03T10:00' },
  { product: 'P2', quantity: 0, time: '2026-09-01T10:00' }
];
const historyGrid = exportProductGrid([history]);
eq(historyGrid[1][19], '已到仓'); eq(historyGrid[1][25], '2026-10-03T10:00');
eq(historyGrid[2][19], '未到仓'); eq(historyGrid[2][25], '');
eq(historyGrid.every(row => row.length === 29), true);
const explicit = structuredClone(history);
explicit.arrivedAt = '2026-10-07T09:00';
explicit.products[0].arrivedAt = '2026-10-02T12:00';
explicit.products[1].received = 40;
const explicitGrid = exportProductGrid([explicit]);
eq(explicitGrid[1][25], '2026-10-02T12:00');
eq(explicitGrid[2][25], '2026-10-07T09:00'); eq(explicitGrid[2][19], '已到仓');
const historicalMissing = order([{ ...first, delivered: 80 }]);
historicalMissing.receipts = [{ product: 'P1', quantity: 80, time: 'invalid' }];
const missingGrid = exportProductGrid([historicalMissing]);
eq(missingGrid[1][19], '已到仓'); eq(missingGrid[1][21], 0); eq(missingGrid[1][25], '');
eq(missingGrid[1][13], first.shipped, 'Shipment remains a distinct template field.');
eq(missingGrid[1][23], historicalMissing.created, 'Application date remains distinct from actual arrival.');
eq(grid[0].includes('收货状态'), false);
eq(grid[0].some(label => /首次|最近|批次|仓租/.test(label)), false);
console.log(`${checks} assertions passed: template field mapping, same-product filters, zero and blank values, shipment boundaries, complete product export and actual arrival columns.`);
