import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

function actualFunction(name) {
  const match = source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'));
  assert.ok(match, `Cannot find the actual ${name} function.`);
  return match[0];
}
function actualBlock(start, end) {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Cannot find the actual handler beginning ${start}.`);
  return source.slice(from, to);
}
function classList(initial = '') {
  const values = new Set(initial.split(/\s+/).filter(Boolean));
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle(name, on = !values.has(name)) { on ? values.add(name) : values.delete(name); }
  };
}

// A small DOM built from the real HTML retains parent classes, disabled fields,
// default values and native validation while the real listeners run in a VM.
function harness({ bypassNativeValidity = false } = {}) {
  const nodes = [], events = new Map(), navigations = [], counts = [];
  const root = { tag: '', children: [] }, stack = [root];
  function matches(node, selector) {
    if (!node.tag) return false;
    const selectors = selector.split(',').map(value => value.trim());
    return selectors.some(value => {
      const parts = value.split(/\s+/), last = parts.pop();
      const tag = last.match(/^[\w-]+/)?.[0];
      if (tag && node.tag !== tag) return false;
      if ([...last.matchAll(/\.([\w-]+)/g)].some(match => !node.classList.contains(match[1]))) return false;
      if ([...last.matchAll(/\[([\w-]+)="([^"]*)"\]/g)].some(match => node.attributes[match[1]] !== match[2])) return false;
      if (last.startsWith('#') && node.id !== last.slice(1)) return false;
      let ancestor = node.parent;
      for (let index = parts.length - 1; index >= 0; index--) {
        while (ancestor && !matches(ancestor, parts[index])) ancestor = ancestor.parent;
        if (!ancestor) return false;
        ancestor = ancestor.parent;
      }
      return true;
    });
  }
  function descendants(parent) {
    return nodes.filter(node => { for (let p = node.parent; p; p = p.parent) if (p === parent) return true; return false; });
  }
  for (const token of html.matchAll(/<[^>]+>|[^<]+/g)) {
    const text = token[0];
    if (!text.startsWith('<')) { stack.at(-1).textContent = (stack.at(-1).textContent || '') + text; continue; }
    if (/^<!|^<\?/.test(text)) continue;
    if (text.startsWith('</')) {
      const tag = text.match(/^<\/([\w-]+)/)?.[1];
      while (stack.length > 1) if (stack.pop().tag === tag) break;
      continue;
    }
    const tag = text.match(/^<([\w-]+)/)?.[1];
    if (!tag) continue;
    const attributes = Object.fromEntries([...text.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(match => [match[1], match[2] ?? '']));
    const node = {
      tag, attributes, id: attributes.id || '', parent: stack.at(-1), children: [],
      textContent: '', value: attributes.value || '', hidden: 'hidden' in attributes,
      disabled: 'disabled' in attributes, required: 'required' in attributes,
      checked: 'checked' in attributes, type: attributes.type || '',
      min: attributes.min || '', max: attributes.max || '', step: attributes.step || '',
      classList: classList(attributes.class), validationMessage: '', validityReports: 0,
      addEventListener(name, handler) { events.set(`${this.id || this.attributes.value}:${name}`, handler); },
      querySelectorAll(selector) { return descendants(this).filter(candidate => matches(candidate, selector)); },
      closest(selector) { for (let p = this; p?.tag; p = p.parent) if (matches(p, selector)) return p; return null; },
      setCustomValidity(message) { this.validationMessage = message; },
      reportValidity() {
        this.validityReports++;
        if (this.tag === 'form') return bypassNativeValidity || this.querySelectorAll('input, select, textarea').every(control => control.reportValidity());
        if (this.disabled) return true;
        if (this.validationMessage || (this.required && !String(this.value).trim())) return false;
        if (this.type !== 'number' || this.value === '') return true;
        const value = Number(this.value);
        return Number.isFinite(value) && (!this.min || value >= Number(this.min)) && (!this.max || value <= Number(this.max)) && (this.step === 'any' || Number.isInteger(value));
      },
      reset() { for (const control of this.querySelectorAll('input, select, textarea')) { control.value = control.defaultValue; control.checked = 'checked' in control.attributes; control.validationMessage = ''; } },
      focus() {}, insertBefore() {}, replaceChildren() {},
    };
    node.parent.children.push(node); nodes.push(node);
    if (!['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tag) && !text.endsWith('/>')) stack.push(node);
  }
  for (const node of nodes) {
    if (node.tag === 'select') {
      node.options = descendants(node).filter(option => option.tag === 'option');
      node.options.forEach(option => { option.value = option.attributes.value ?? option.textContent.trim(); });
      node.value = (node.options.find(option => 'selected' in option.attributes) || node.options[0])?.value || '';
    }
    node.defaultValue = node.value;
  }
  const document = {
    body: nodes.find(node => node.tag === 'body'),
    querySelectorAll: selector => nodes.filter(node => matches(node, selector)),
    querySelector: selector => nodes.find(node => matches(node, selector)) || null,
  };
  const $ = selector => {
    const node = document.querySelector(selector);
    assert.ok(node, `Actual HTML must contain ${selector}.`);
    return node;
  };
  const c = {
    $, document, releaseForm: $('#releaseForm'), releaseOverlay: $('#releaseOverlay'),
    activeReleaseRow: null, activeReleaseSourceRow: null, activeReleaseReadOnly: false,
    activeReleaseStatus: '暂存', activeReleaseOrderType: '发货', activeStatus: '暂存',
    selectedDetailInstructionCodes: new Set(), instructionRowsByInventory: new Map(),
    attachmentRowsByInventory: new Map(), instructionCatalog: [], instructionWorkflowRows: [],
    marketplaceReleaseTypes: new Set(['Walmart', 'Tiktok']), blockedStatusOptions: ['暂存', '拦截', '退换货'],
    approvalRows: [], formatLocalDateTime: () => '2026-10-09 10:00:00',
    updateStatusTabCount: (...args) => counts.push(args), showInstructionList: status => navigations.push(status),
    renderRows() {}, renderCargoBoxRows() {}, renderReleaseAttachments() {}, renderInstructionList() {},
    resetInstructionTableScroll() {}, requestAnimationFrame: callback => callback(),
  };
  const names = [
    'getReleaseType', 'normalizeInventoryType', 'getInstructionDetailKey', 'parseInstructionText',
    'ensureInstructionDetailRows', 'buildInstructionText', 'syncInstructionDetails',
    'getActiveInstructionRows', 'getReleaseAttachments', 'getSubmittedInstructionRows', 'getNextApprovalApplicationNo',
    'getReleaseApplicationTypeValue', 'getReleaseDestinationValue', 'getReleaseDispatchValue',
    'getReleaseScheduleValue', 'getReleaseRemarkValue', 'createApprovalRequestFromActiveRelease',
    'finishReleaseSubmission', 'normalizeReleaseRow', 'isMarketplaceRelease', 'isPrivateAddressRelease',
    'updateReleaseTextCount', 'updateReleaseApplicationFields', 'updateReleaseShippingState',
    'setReleaseDrawerMode', 'openReleaseDrawer', 'closeReleaseDrawer',
  ];
  const fragments = names.map(actualFunction);
  fragments.push(actualBlock('document.querySelectorAll(\'input[name="releaseOrderType"]\').forEach', '$("#releaseAddressDetail").addEventListener'));
  fragments.push(actualBlock('releaseForm.addEventListener("submit"', 'function buildWatermarks()'));
  vm.runInNewContext(fragments.join('\n'), c);
  return {
    c, $, events, navigations, counts,
    choose(type) {
      const radio = $(`input[name="releaseOrderType"][value="${type}"]`);
      document.querySelectorAll('input[name="releaseOrderType"]').forEach(control => { control.checked = control === radio; });
      events.get(`${type}:change`)({ target: radio });
    },
    submit() { events.get('releaseForm:submit')({ preventDefault() {} }); },
  };
}
function stock(overrides = {}) {
  return {
    id: 7, customer: '测试客户', container: 'PICKUP-CONTAINER', pallet: 'PICKUP-PALLET',
    system: 'STAGING-SYSTEM', inbound: 'STAGING-INBOUND', blocked: '暂存', status: '暂存',
    applicationType: 'FBA仓库', releaseType: '发货', dispatch: 'Truck-Amazon', destination: 'ABE2',
    boxes: 8, unsent: 8, pending: 0, sent: 0, volume: 4, shippingEnabled: true,
    instructions: [], attachments: [], ...overrides,
  };
}
function pickup(h, row = stock()) {
  h.c.instructionWorkflowRows = [[row], h.c.approvalRows];
  h.c.openReleaseDrawer(row);
  h.choose('自提');
  return row;
}

test('the actual order type radio selects only pickup fields, with box count required and other fields optional', () => {
  const h = harness(); pickup(h);
  assert.equal(h.c.activeReleaseOrderType, '自提');
  assert.ok(h.$('#releaseFields').classList.contains('shipping-disabled'));
  const visible = h.$('#releaseFields').querySelectorAll('.ship-out-conditional').filter(field => !field.hidden).map(field => field.id).sort();
  assert.deepEqual(visible, ['releasePickupTimeField', 'releaseShipOutBoxesField', 'releaseShipOutRemarkField']);
  for (const id of ['releaseShipOutBoxes', 'releasePickupTime', 'releaseShipOutRemark']) assert.equal(h.$(`#${id}`).disabled, false);
  assert.equal(h.$('#releaseShipOutBoxes').required, true);
  assert.equal(h.$('#releasePickupTime').required, false);
  assert.equal(h.$('#releasePickupTime').type, 'datetime-local');
  assert.equal(h.$('#releaseShipOutRemark').required, false);
  for (const id of ['releaseDestroyBoxNo', 'releaseShipOutFile', 'releaseApplication', 'releaseDestination', 'releaseShipment', 'releaseReference', 'releaseDate']) assert.equal(h.$(`#${id}`).disabled, true, `${id} must not block a pickup.`);
  assert.equal(h.$('#releaseDestroyBoxNo').required, false);
});

test('pickup can submit just box count into the existing approval workflow without deducting inventory', () => {
  const h = harness(), row = pickup(h);
  h.$('#releaseShipOutBoxes').value = '3'; h.submit();
  assert.equal(h.c.approvalRows.length, 1);
  const request = h.c.approvalRows[0];
  assert.equal(request.releaseType, '自提'); assert.equal(request.applicationType, '客户自提');
  assert.equal(request.releaseApplication, '客户自提'); assert.equal(request.dispatch, '客户自提');
  assert.equal(request.status, '待审批'); assert.equal(request.approvalStage, '待仓库审批');
  assert.equal(request.appliedBoxes, 3); assert.equal(request.appliedVolume, 1.5);
  assert.equal(request.scheduledPickupTime, ''); assert.equal(request.scheduledShippingTime, '');
  assert.equal(request.customerRemark, ''); assert.equal(request.shippingEnabled, false);
  assert.equal(request.shipmentId, ''); assert.equal(request.referenceId, '');
  assert.deepEqual([row.boxes, row.unsent, row.pending, row.sent], [8, 8, 0, 0]);
  assert.deepEqual(h.navigations, ['待审批']); assert.deepEqual(h.counts, [['待审批', 1]]);
  assert.equal(h.$('#releaseOverlay').hidden, true);
});

test('pickup schedule and remark survive serialization and populate actual read-only detail fields', () => {
  const h = harness();
  const row = pickup(h, stock({ shipmentId: 'OLD-SHIPMENT', referenceId: 'OLD-REFERENCE', scheduledShippingTime: '2026-10-01 08:00', customerRemark: '旧备注', instructions: [{ text: '12 CNY 贴标 (6/箱)', completed: false }] }));
  h.$('#releaseShipOutBoxes').value = '2'; h.$('#releasePickupTime').value = '2026-10-12T14:30'; h.$('#releaseShipOutRemark').value = '  下午自提  ';
  h.submit();
  const request = h.c.approvalRows[0];
  assert.equal(request.scheduledPickupTime, '2026-10-12 14:30'); assert.equal(request.scheduledShippingTime, '');
  assert.equal(request.customerRemark, '下午自提'); assert.equal(request.shipmentId, ''); assert.equal(request.referenceId, '');
  assert.equal(row.scheduledPickupTime, request.scheduledPickupTime); assert.equal(row.customerRemark, request.customerRemark);
  assert.equal(request.instructions.length, 1); assert.equal(request.instructions[0].text, '12 CNY 贴标 (6/箱)'); assert.equal(request.instructionAudit, '未审核');
  const saved = JSON.parse(JSON.stringify(request));
  assert.equal(h.c.getReleaseType(saved), '自提');
  h.c.openReleaseDrawer(saved, { readOnly: true, status: '待审批' });
  assert.equal(h.c.activeReleaseOrderType, '自提');
  assert.equal(h.$('#releaseShipOutBoxes').value, '2');
  assert.equal(h.$('#releasePickupTime').value, '2026-10-12T14:30');
  assert.equal(h.$('#releaseShipOutRemark').value.trim(), '下午自提');
  for (const id of ['releaseShipOutBoxes', 'releasePickupTime', 'releaseShipOutRemark']) assert.equal(h.$(`#${id}`).disabled, true);
  assert.equal(h.$('#releaseConfirm').hidden, true);
  h.c.closeReleaseDrawer(); assert.equal(h.$('#releasePickupTime').value, '');
});

test('invalid pickup counts are rejected before any source or approval mutation even if native validation is bypassed', () => {
  for (const [value, available] of [['', 8], ['0', 8], ['-1', 8], ['1.5', 8], ['NaN', 8], ['Infinity', 8], ['9', 8], ['1', 0]]) {
    const h = harness({ bypassNativeValidity: true }), row = pickup(h, stock({ unsent: available, boxes: available }));
    const sourceBefore = JSON.stringify(row), activeBefore = JSON.stringify(h.c.activeReleaseRow);
    h.$('#releaseShipOutBoxes').value = value; h.submit();
    assert.equal(JSON.stringify(row), sourceBefore, `${value || 'empty'} cannot mutate source stock.`);
    assert.equal(JSON.stringify(h.c.activeReleaseRow), activeBefore, `${value || 'empty'} cannot mutate drawer stock.`);
    assert.equal(h.c.approvalRows.length, 0); assert.equal(h.navigations.length, 0);
    assert.equal(h.$('#releaseOverlay').hidden, false);
    assert.ok(h.$('#releaseShipOutBoxes').validationMessage, `${value || 'empty'} must explain the invalid quantity.`);
  }
});

test('correcting a rejected pickup quantity clears its custom error and allows submission', () => {
  const h = harness({ bypassNativeValidity: true }); pickup(h);
  h.$('#releaseShipOutBoxes').value = '9'; h.submit();
  assert.ok(h.$('#releaseShipOutBoxes').validationMessage);
  h.$('#releaseShipOutBoxes').value = '8'; h.events.get('releaseShipOutBoxes:input')();
  assert.equal(h.$('#releaseShipOutBoxes').validationMessage, '');
  h.submit(); assert.equal(h.c.approvalRows.length, 1); assert.equal(h.c.approvalRows[0].appliedBoxes, 8);
});

test('switching away from pickup disables its optional schedule and preserves existing destroy box requirements', () => {
  const h = harness(); pickup(h);
  h.choose('销毁');
  assert.equal(h.$('#releasePickupTimeField').hidden, true); assert.equal(h.$('#releasePickupTime').disabled, true);
  assert.equal(h.$('#releaseDestroyBoxNoField').hidden, false); assert.equal(h.$('#releaseDestroyBoxNo').required, true);
  assert.equal(h.$('#releaseShipOutAttachmentField').hidden, false); assert.equal(h.$('#releaseShipOutFile').disabled, false);
  h.choose('发货');
  assert.equal(h.$('#releasePickupTimeField').hidden, true); assert.equal(h.$('#releaseShipOutBoxes').required, false);
  assert.equal(h.$('#releaseDestroyBoxNo').required, false); assert.equal(h.$('#releaseDestination').disabled, false);
  assert.equal(h.$('#releaseFields').classList.contains('shipping-disabled'), false);
});
