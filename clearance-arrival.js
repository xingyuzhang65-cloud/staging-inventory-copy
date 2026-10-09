import { can, receive } from './clearance-model.js';

const present = value => value != null && String(value).trim() !== '';
const amount = value => Number.isFinite(Number(value)) ? Number(value) : 0;

// Only complete calendar dates or timestamps are reliable arrival history.
function arrivalTime(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    const at = value.toISOString();
    return { at, day: at.slice(0, 10), timestamp: value.getTime() };
  }
  if (!present(value)) return null;
  const at = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(at);
  if (!match) return null;
  const day = at.slice(0, 10), calendar = new Date(`${day}T00:00:00Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== day) return null;
  if (match[4] && (Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6] || 0) > 59)) return null;
  const timestamp = Date.parse(at.replace(' ', 'T'));
  return Number.isFinite(timestamp) ? { at, day, timestamp } : null;
}

/** Return one arrival date; physical receipt quantities determine whether goods arrived. */
export function arrivalInfo(order, productId = '') {
  const products = (order.products || []).filter(product => !productId || product.id === productId);
  const productIds = new Set(products.map(product => product.id));
  const received = products.reduce((total, product) => total + amount(product.received), 0);
  const stock = products.reduce((total, product) => total + amount(product.received) - amount(product.delivered), 0);
  const earliest = times => times.filter(Boolean).sort((left, right) => left.timestamp - right.timestamp)[0];
  let actualTime = null;
  if (received > 0) {
    const productTime = earliest(products.filter(product => amount(product.received) > 0).map(product => arrivalTime(product.arrivedAt)));
    const orderTime = arrivalTime(order.arrivedAt);
    actualTime = productId ? productTime || orderTime : orderTime || productTime;
    actualTime ||= earliest((order.receipts || [])
      .filter(record => productIds.has(record.product) && amount(record.quantity) > 0)
      .map(record => arrivalTime(record.time)));
  }
  return {
    status: received > 0 ? '已到仓' : '未到仓',
    arrivedAt: actualTime?.at || '', received, stock,
    hasMissingTime: received > 0 && !actualTime
  };
}

/** Date filters use the single arrival date and include either boundary day. */
export function arrivalMatches(order, filters = {}) {
  const info = arrivalInfo(order);
  if (present(filters.arrival) && info.status !== String(filters.arrival).trim()) return false;
  if (!present(filters.arrivalFrom) && !present(filters.arrivalTo)) return true;
  const from = present(filters.arrivalFrom) ? arrivalTime(filters.arrivalFrom)?.day : '';
  const to = present(filters.arrivalTo) ? arrivalTime(filters.arrivalTo)?.day : '';
  if ((present(filters.arrivalFrom) && !from) || (present(filters.arrivalTo) && !to) || (from && to && from > to)) return false;
  const time = arrivalTime(info.arrivedAt);
  return Boolean(time) && (!from || time.day >= from) && (!to || time.day <= to);
}

/** Receive the remaining goods in one atomic order update, retaining earlier actual dates. */
export function registerArrival(order, time, note = '', carrier = '') {
  if (!can(order, 'receive')) throw Error('当前状态不可登记到仓');
  const actualTime = arrivalTime(time);
  if (!actualTime) throw Error('请输入有效实际到仓时间');
  const draft = structuredClone(order);
  const previousArrival = arrivalInfo(order).arrivedAt;
  for (const product of draft.products) {
    const remaining = product.quantity - product.received;
    if (remaining <= 0) continue;
    const previousProductArrival = arrivalInfo(order, product.id).arrivedAt;
    const hadShipmentTime = Object.hasOwn(product, 'shipped'), previousShipmentTime = product.shipped;
    receive(draft, product.id, remaining, actualTime.at, note, carrier);
    if (hadShipmentTime) product.shipped = previousShipmentTime;
    else delete product.shipped;
    product.arrivedAt = previousProductArrival || actualTime.at;
  }
  draft.arrivedAt = previousArrival || actualTime.at;
  Object.assign(order, draft);
  return arrivalInfo(order);
}
