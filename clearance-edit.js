import { HEADERS, validateRows } from './clearance-import.js';

const rowError = (index, message) => Error(`产品 ${index + 1}：${message}`);
const isOriginalImage = (original, value) => value === original.image && typeof value === 'string' && /^data:image\//i.test(value);
const isOriginalTimestamp = (original, value) => value === original.shipped && typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
  && Number.isFinite(Date.parse(value.replace(' ', 'T')));

/** Validate all edited fields together and return replacement products without mutating inputs. */
export function editProductFields(originalProducts, editedRows) {
  if (!Array.isArray(originalProducts) || !originalProducts.length) throw rowError(0, '缺少原产品信息');
  if (!Array.isArray(editedRows)) throw rowError(0, '缺少待保存的产品信息');
  const originals = new Map(originalProducts.map(product => [product.id, product]));
  if (originals.size !== originalProducts.length) throw rowError(0, '原产品 ID 重复');
  const seen = new Set(), preserved = [];
  const rows = editedRows.map((edited, index) => {
    const original = originals.get(edited?.id);
    if (!original) throw rowError(index, '产品 ID 不存在，不能新增或替换产品');
    if (seen.has(edited.id)) throw rowError(index, '产品 ID 重复');
    seen.add(edited.id);
    if (!Array.isArray(edited.values) || edited.values.length !== HEADERS.length) throw rowError(index, `请填写完整的 ${HEADERS.length} 个产品字段`);
    const values = edited.values.slice();
    if (values.every(value => value == null || String(value).trim() === '')) throw rowError(index, '产品名称不能为空');
    const preserve = { original, image: isOriginalImage(original, values[9]), shipped: isOriginalTimestamp(original, values[13]) };
    // Unchanged historical values remain editable alongside current template-compatible values.
    if (preserve.image) values[9] = 'https://example.invalid/original-product-image';
    if (preserve.shipped) values[13] = original.shipped.slice(0, 10);
    preserved.push(preserve);
    return values;
  });
  if (seen.size !== originalProducts.length) {
    const missingIndex = originalProducts.findIndex(product => !seen.has(product.id));
    throw rowError(missingIndex, '原产品信息遗漏，不能删除产品');
  }
  let parsed;
  try { parsed = validateRows([HEADERS, ...rows]); }
  catch (error) { throw rowError(0, error.message); }
  if (parsed.errorCount) throw Error(parsed.rows.filter(row => row.errors.length)
    .map(row => `产品 ${row.line - 1}：${row.errors.join('；')}`).join('\n'));
  const replacements = new Map();
  for (const [index, row] of parsed.rows.entries()) {
    const { original, image, shipped } = preserved[index];
    const quantityFloor = Math.max(Number(original.received) || 0, Number(original.delivered) || 0);
    if (row.product.quantity < quantityFloor) throw rowError(index, `清货数量(件)不能小于已实收或已提货数量 ${quantityFloor}`);
    const replacement = {
      ...structuredClone(original), ...row.product, id: original.id,
      received: original.received, delivered: original.delivered
    };
    if (image) replacement.image = original.image;
    if (shipped) replacement.shipped = original.shipped;
    replacements.set(original.id, replacement);
  }
  return originalProducts.map(original => replacements.get(original.id));
}
