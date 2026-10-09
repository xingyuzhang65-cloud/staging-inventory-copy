const count = value => Number.isFinite(Number(value)) ? Number(value) : 0;

function validArrivalTime(value) {
  const time = String(value ?? '').trim();
  const match = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(time);
  if (!match) return '';
  const calendar = new Date(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== match[1]) return '';
  if (match[2] && (Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4] || 0) > 59)) return '';
  return Number.isFinite(Date.parse(time.replace(' ', 'T'))) ? time : '';
}

const newReceiptId = () => 'RC-EDIT-' + (globalThis.crypto?.randomUUID?.()
  || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));

/** Return an atomic edit of the order's single arrival status/date without changing inputs. */
export function editArrivalFields(originalOrder, editedProducts, { status, arrivedAt = '' } = {}) {
  if (!['未到仓', '已到仓'].includes(status)) throw Error('请选择有效到仓状态');
  const originals = originalOrder.products || [];
  if (!originals.length || !Array.isArray(editedProducts) || editedProducts.length !== originals.length) throw Error('产品信息不完整，不能新增或删除原产品');
  const byId = new Map(originals.map(product => [product.id, product]));
  if (byId.size !== originals.length) throw Error('原产品 ID 重复');
  const seen = new Set();
  const products = editedProducts.map((edited, index) => {
    const original = byId.get(edited?.id);
    if (!original || seen.has(edited.id)) throw Error(`产品 ${index + 1}：产品 ID 不存在或重复`);
    seen.add(edited.id);
    const quantity = Number(edited.quantity), delivered = count(original.delivered);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw Error(`产品 ${index + 1}：清货数量(件)须为大于 0 的整数`);
    if (quantity < delivered) throw Error(`产品 ${index + 1}：清货数量(件)不能小于已提货数量 ${delivered}`);
    return { ...structuredClone(original), ...structuredClone(edited), id: original.id, quantity, delivered: original.delivered };
  });
  const receipts = structuredClone(originalOrder.receipts || []);
  if (status === '未到仓') {
    const delivered = originals.some(product => count(product.delivered) > 0)
      || (originalOrder.deliveries || []).some(record => count(record.quantity) > 0);
    if (delivered) throw Error('已有实际提货记录，不能改为未到仓');
    if (String(arrivedAt ?? '').trim()) throw Error('未到仓时请清空到仓时间');
    for (const product of products) { product.received = 0; product.arrivedAt = ''; }
    return { products, arrivedAt: '', receipts };
  }
  const time = validArrivalTime(arrivedAt);
  if (!time) throw Error('已到仓时请填写有效实际到仓时间');
  const wasArrived = originals.some(product => count(product.received) > 0);
  for (const product of products) {
    product.received = product.quantity;
    product.arrivedAt = time;
    if (!wasArrived) receipts.push({
      id: newReceiptId(), product: product.id, quantity: product.quantity, time,
      tracking: product.tracking || '', carrier: product.carrier || '', note: '编辑到仓信息'
    });
  }
  return { products, arrivedAt: time, receipts };
}
