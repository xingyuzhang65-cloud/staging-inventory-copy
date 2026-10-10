// Address data is shared by clearance and returns, and survives page refreshes.
export const ADDRESS_STORE_KEY = 'mw-warehouse-addresses-v1';
const text = value => String(value ?? '').trim();
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function addresses(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(ADDRESS_STORE_KEY) || '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}
export function warehouseAddress(warehouse, storage = globalThis.localStorage) {
  const saved = addresses(storage);
  return Object.hasOwn(saved, warehouse) && typeof saved[warehouse] === 'string' ? saved[warehouse] : '';
}
export function saveWarehouseAddress(warehouse, address, storage = globalThis.localStorage) {
  warehouse = text(warehouse); address = text(address);
  if (!warehouse) throw Error('请先选择仓库');
  if (!address) throw Error('请填写仓库地址');
  if (address.length > 500) throw Error('仓库地址最多 500 字');
  if (!storage) throw Error('仓库地址无法保存，请检查本地存储');
  storage.setItem(ADDRESS_STORE_KEY, JSON.stringify({...addresses(storage), [warehouse]: address}));
  return address;
}
export function syncWarehouseAddress(form, storage = globalThis.localStorage) {
  if (!form?.elements.warehouseAddress) return;
  form.elements.warehouseAddress.value = warehouseAddress(form.elements.warehouse.value, storage);
}
export function rememberWarehouseAddress(form, storage = globalThis.localStorage) {
  const address = text(form?.elements.warehouseAddress?.value);
  if (address) saveWarehouseAddress(form.elements.warehouse.value, address, storage);
  return address;
}
export function warehouseAddressField(warehouse, prefix) {
  const address = warehouseAddress(warehouse);
  return `<div class="cl-warehouse-address cl-wide"><label class="cl-field"><span>仓库地址</span><textarea name="warehouseAddress" maxlength="500" rows="2" placeholder="选择仓库后自动带出，未维护时可填写">${escape(address)}</textarea></label><div class="cl-address-help"><span>地址保存后，选择该仓库时自动带出。</span><button type="button" class="cl-link" data-${prefix}-action="save-address">保存仓库地址</button></div></div>`;
}
