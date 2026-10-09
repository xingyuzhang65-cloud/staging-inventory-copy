// Spreadsheet import stays local to the browser; no file contents are uploaded.
export const TEMPLATE_URL = './清货导入模板.xlsx?v=f716579763d0b3c4';
export const HEADERS = Object.freeze([
  '产品名称*', 'SKU', '清货数量(件)*', '单件重量(KG)', '外箱长(cm)', '外箱宽(cm)',
  '外箱高(cm)', '预报箱数(箱)', '产品销售链接*', '产品图片链接*', '亚马逊售价',
  '币种', '追踪单号', '发运时间', '操作要求'
]);
const MAX_ROWS = 500;
let xlsxLoader;

function cellValue(cell) {
  return cell && typeof cell === 'object' && !(cell instanceof Date) ? cell.v : cell;
}
function asText(cell) {
  const value = cellValue(cell);
  if (value == null) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  return String(value).trim();
}
function isFormula(cell) {
  if (cell && typeof cell === 'object' && cell.f != null) return true;
  return /^[=+@]/.test(asText(cell)) || /^-\D/.test(asText(cell));
}
function isEmptyRow(row) {
  return !row.some(cell => asText(cell) !== '' || isFormula(cell));
}
function numberValue(row, index, errors, { required = false, integer = false, positive = false } = {}) {
  const text = asText(row[index]);
  const label = HEADERS[index].replace('*', '');
  if (!text) {
    if (required) errors.push(`${label}不能为空`);
    return 0;
  }
  const value = Number(text);
  if (!/^\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(value) || (integer && !Number.isSafeInteger(value)) || (positive && value <= 0)) {
    errors.push(`${label}须为${positive ? '大于 0 的' : '非负'}${integer ? '整数' : '数字'}`);
    return 0;
  }
  return value;
}
function urlValue(row, index, errors) {
  const text = asText(row[index]);
  const label = HEADERS[index].replace('*', '');
  if (!text) { errors.push(`${label}不能为空`); return ''; }
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
  } catch { errors.push(`${label}须为有效的 http/https 链接`); }
  return text;
}

/** Validate a row grid including its header row. Cells may be plain values or SheetJS cells. */
export function validateRows(grid) {
  if (!Array.isArray(grid) || !grid.length) throw new Error('文件为空，请使用清货导入模板填写产品。');
  const header = grid[0] || [];
  const mismatch = HEADERS.filter((label, index) => asText(header[index]).replace(/^\uFEFF/, '') !== label);
  if (mismatch.length || header.some(isFormula) || header.slice(HEADERS.length).some(cell => asText(cell))) {
    throw new Error(`模板表头不匹配，请保留第一行 ${HEADERS.length} 列原始标题并使用最新模板。`);
  }
  const rows = [];
  for (let index = 1; index < grid.length; index++) {
    const raw = grid[index] || [];
    if (isEmptyRow(raw)) continue;
    if (rows.length >= MAX_ROWS) throw new Error(`一次最多导入 ${MAX_ROWS} 行产品，请拆分文件后重试。`);
    const errors = [];
    raw.forEach((cell, column) => { if (isFormula(cell)) errors.push(`${HEADERS[column]?.replace('*', '') || `第 ${column + 1} 列`}禁止填写公式，请粘贴为值`); });
    if (raw.slice(HEADERS.length).some(cell => asText(cell))) errors.push('存在模板以外的内容，请删除多余列');
    const name = asText(raw[0]);
    if (!name) errors.push('产品名称不能为空');
    const quantity = numberValue(raw, 2, errors, { required: true, integer: true, positive: true });
    const weight = numberValue(raw, 3, errors);
    const dimensions = [4, 5, 6].map(i => numberValue(raw, i, errors));
    const boxes = numberValue(raw, 7, errors, { integer: true });
    const link = urlValue(raw, 8, errors);
    const image = urlValue(raw, 9, errors);
    const price = numberValue(raw, 10, errors);
    const currency = asText(raw[11]).toUpperCase() || 'USD';
    if (!/^[A-Z]{3}$/.test(currency)) errors.push('币种须为三位英文代码，例如 USD');
    const shipped = asText(raw[13]);
    if (shipped && (!/^\d{4}-\d{2}-\d{2}$/.test(shipped) || Number.isNaN(Date.parse(`${shipped}T00:00:00Z`)) || new Date(`${shipped}T00:00:00Z`).toISOString().slice(0, 10) !== shipped)) errors.push('发运时间须为有效日期，格式 YYYY-MM-DD');
    rows.push({ line: index + 1, product: {
      id: `import-${index}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
      name, sku: asText(raw[1]), quantity, received: 0, delivered: 0, image, weight, dimensions, boxes,
      link, price, currency, tracking: asText(raw[12]), shipped, requirement: asText(raw[14])
    }, errors });
  }
  if (!rows.length) throw new Error('未找到产品数据，请在模板第二行开始填写，每行一个产品。');
  const skuGroups = new Map();
  rows.forEach(row => {
    if (!row.product.sku) return;
    const key = row.product.sku.toLocaleUpperCase();
    if (!skuGroups.has(key)) skuGroups.set(key, []);
    skuGroups.get(key).push(row);
  });
  skuGroups.forEach(group => {
    if (group.length > 1) group.forEach(row => row.errors.push(`SKU 重复，与第 ${group.filter(other => other !== row).map(other => other.line).join('、')} 行相同`));
  });
  const errorCount = rows.filter(row => row.errors.length > 0).length;
  return { rows, total: rows.length, validCount: rows.length - errorCount, errorCount };
}

export function parseCsv(text) {
  const grid = [];
  let row = [], value = '', quoted = false, afterQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (char === '"') { quoted = false; afterQuote = true; }
      else value += char;
      continue;
    }
    if (char === '"') {
      if (value || afterQuote) throw new Error('CSV 格式错误：引号位置不正确。');
      quoted = true;
    } else if (char === ',') { row.push(value); value = ''; afterQuote = false; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(value); grid.push(row); row = []; value = ''; afterQuote = false;
    } else {
      if (afterQuote && !/\s/.test(char)) throw new Error('CSV 格式错误：引号结束后存在多余内容。');
      if (!afterQuote) value += char;
    }
  }
  if (quoted) throw new Error('CSV 格式错误：存在未闭合的引号。');
  if (value || row.length) { row.push(value); grid.push(row); }
  return grid;
}

async function loadXlsx() {
  if (globalThis.XLSX) return globalThis.XLSX;
  if (!globalThis.document) throw new Error('Excel 解析器未加载。');
  if (!xlsxLoader) xlsxLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('./vendor/xlsx.full.min.js', import.meta.url).href;
    script.onload = () => globalThis.XLSX ? resolve(globalThis.XLSX) : reject(new Error('Excel 解析器加载失败，请刷新重试。'));
    script.onerror = () => { script.remove(); xlsxLoader = null; reject(new Error('Excel 解析器加载失败，请刷新重试。')); };
    document.head.appendChild(script);
  });
  return xlsxLoader;
}

export async function readImportFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new Error('请选择要导入的文件。');
  const extension = String(file.name || '').toLowerCase().split('.').pop();
  if (!['xlsx', 'csv'].includes(extension)) throw new Error('请上传 .xlsx 或 .csv 格式的清货模板。');
  if (file.size > 10 * 1024 * 1024) throw new Error('文件不能超过 10 MB，请拆分后重试。');
  const data = await file.arrayBuffer();
  if (extension === 'csv') {
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(data); }
    catch { text = new TextDecoder('gb18030', { fatal: true }).decode(data); }
    if (text.includes('\0')) throw new Error('CSV 内容无法读取，请另存为 UTF-8 CSV 后重试。');
    return validateRows(parseCsv(text.replace(/^\uFEFF/, '')));
  }
  const XLSX = await loadXlsx();
  let workbook;
  try { workbook = XLSX.read(data, { type: 'array', cellFormula: true, cellDates: true }); }
  catch { throw new Error('Excel 文件无法读取，请确认文件未加密且为有效的 .xlsx 文件。'); }
  const sheet = workbook.Sheets['清货产品'];
  if (!sheet) throw new Error('找不到“清货产品”工作表，请使用最新清货模板。');
  if (!sheet['!ref']) throw new Error('“清货产品”工作表为空，请填写模板后重试。');
  const range = XLSX.utils.decode_range(sheet['!ref']);
  if (range.e.r > 20000 || range.e.c > 50) throw new Error('工作表范围过大，请仅保留模板列及有效产品行。');
  const grid = [];
  for (let r = 0; r <= range.e.r; r++) {
    const row = [];
    for (let c = 0; c <= Math.max(range.e.c, HEADERS.length - 1); c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      row.push(cell || '');
    }
    grid.push(row);
  }
  return validateRows(grid);
}
