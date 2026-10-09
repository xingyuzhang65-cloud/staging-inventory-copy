import { HEADERS } from './clearance-import.js';
import { stock } from './clearance-model.js';
import { arrivalInfo } from './clearance-arrival.js';

const keys = ['name', 'sku', 'quantity', 'weight', 'length', 'width', 'height', 'boxes', 'link', 'image', 'price', 'currency', 'tracking', 'shipped', 'requirement'];
export const TEMPLATE_FIELDS = Object.freeze(keys.map((key, index) => Object.freeze({
  key, label: HEADERS[index].replaceAll('*', ''), index
})));

const present = value => value != null && String(value).trim() !== '';
const text = value => String(value ?? '').trim().toLowerCase();
const dimensions = { length: 0, width: 1, height: 2 };
const textFilters = { productName: 'name', sku: 'sku', tracking: 'tracking', link: 'link', image: 'image', requirement: 'requirement' };
const numericFields = ['quantity', 'weight', 'length', 'width', 'height', 'boxes', 'price'];

/** Return the stored value, retaining zero while exposing missing optional values as blank. */
export function productFieldValue(product, key) {
  const value = Object.hasOwn(dimensions, key) ? product?.dimensions?.[dimensions[key]] : product?.[key];
  return present(value) ? value : '';
}

function day(value) {
  if (!present(value)) return '';
  const valueText = value instanceof Date
    ? (Number.isNaN(value.getTime()) ? '' : value.toISOString())
    : String(value).trim();
  const match = /^(\d{4}-\d{2}-\d{2})(?:$|[T ])/.exec(valueText);
  if (!match || !Number.isFinite(Date.parse(valueText))) return '';
  const timestamp = Date.parse(`${match[1]}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === match[1] ? match[1] : '';
}

/** All supplied product conditions must match the same product in the order. */
export function matchesProductFilters(order, filters = {}) {
  const conditions = [];
  for (const [filter, key] of Object.entries(textFilters)) {
    if (present(filters[filter])) conditions.push(product => text(productFieldValue(product, key)).includes(text(filters[filter])));
  }
  if (present(filters.currency)) conditions.push(product => text(productFieldValue(product, 'currency')) === text(filters.currency));
  for (const key of numericFields) {
    const lower = filters[`${key}Min`], upper = filters[`${key}Max`];
    if (!present(lower) && !present(upper)) continue;
    const min = present(lower) ? Number(lower) : -Infinity;
    const max = present(upper) ? Number(upper) : Infinity;
    if ((present(lower) && !Number.isFinite(min)) || (present(upper) && !Number.isFinite(max)) || min > max) return false;
    conditions.push(product => {
      const raw = productFieldValue(product, key), value = Number(raw);
      return present(raw) && Number.isFinite(value) && value >= min && value <= max;
    });
  }
  if (present(filters.shippedFrom) || present(filters.shippedTo)) {
    const from = present(filters.shippedFrom) ? day(filters.shippedFrom) : '';
    const to = present(filters.shippedTo) ? day(filters.shippedTo) : '';
    if ((present(filters.shippedFrom) && !from) || (present(filters.shippedTo) && !to) || (from && to && from > to)) return false;
    conditions.push(product => {
      const shipped = day(productFieldValue(product, 'shipped'));
      return Boolean(shipped) && (!from || shipped >= from) && (!to || shipped <= to);
    });
  }
  return !conditions.length || (order.products || []).some(product => conditions.every(condition => condition(product)));
}

/** A header row followed by one complete row per product, suitable for CSV or XLSX. */
export function exportProductGrid(orders) {
  const header = [
    ...TEMPLATE_FIELDS.map(field => field.label),
    '清货单号', '客户名称', '清货仓库', '清货状态', '到仓状态',
    '实收数量(件)', '当前在库(件)', '已提货数量(件)', '申请时间', '最后更新时间', '到仓时间'
  ];
  const rows = orders.flatMap(order => (order.products || []).map(product => {
    const arrival = arrivalInfo(order, product.id);
    return [
      ...TEMPLATE_FIELDS.map(field => productFieldValue(product, field.key)),
      order.id ?? '', order.customer ?? '', order.warehouse ?? '', order.status ?? '', arrival.status,
      product.received ?? 0, stock(product), product.delivered ?? 0, order.created ?? '', order.updated ?? '', arrival.arrivedAt
    ];
  }));
  return [header, ...rows];
}
