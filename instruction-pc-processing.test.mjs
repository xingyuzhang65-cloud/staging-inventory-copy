import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
function harness(status = '指令待处理', rows = [
  { code: 'A-1', name: '贴标', status: '待处理', images: [{ name: 'PC.jpg', url: 'blob:pc' }], pdaImages: [] },
  { code: 'A-2', name: '查验', status: '待处理', images: [], pdaImages: [{ name: 'PDA.jpg', url: '/pda.jpg' }] }
]) {
  const nodes = new Map(), handlers = new Map(), alerts = [];
  const original = { applicationNo: 'A', status, instructions: rows.map(row => ({ text: row.name, completed: row.status === '已处理' })) };
  const other = { applicationNo: 'B', status, instructions: [{ text: '其它单据', completed: false }] };
  const active = { ...original, instructions: original.instructions.map(row => ({ ...row })) };
  const c = vm.createContext({
    activeReleaseRow: active, activeReleaseStatus: status, activeReleaseReadOnly: true,
    instructionWorkflowRows: [[original, other]], instructionRowsByInventory: new Map([['A', rows]]),
    selectedDetailInstructionCodes: new Set(), instructionCatalog: [],
    window: { alert: text => alerts.push(text) },
    $: id => {
      if (!nodes.has(id)) nodes.set(id, { hidden: false, disabled: false, checked: false, indeterminate: false,
        addEventListener: (event, fn) => handlers.set(`${id}:${event}`, fn) });
      return nodes.get(id);
    },
    renderRows() {},
    renderInstructionList() { c.updateInstructionProcessingToolbar(c.getActiveInstructionRows()); }
  });
  for (const name of ['getInstructionDetailKey', 'ensureInstructionDetailRows', 'getActiveInstructionRows',
    'syncInstructionStatus', 'canProcessActiveInstructions', 'updateInstructionProcessingToolbar',
    'validateInstructionPcImages', 'completeSelectedDetailInstructions']) {
    vm.runInContext(source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))[0], c);
  }
  const changeStart = source.indexOf('$("#instructionBody").addEventListener("change",');
  vm.runInContext(source.slice(changeStart, source.indexOf('\n});', changeStart) + 4), c);
  return { c, rows, original, active, other, nodes, alerts, handlers };
}

test('实际页面提供待处理统计、勾选数及PC端处理按钮', () => {
  for (const id of ['instructionProcessingToolbar', 'instructionProcessSummary', 'instructionProcessSelectedCount', 'instructionBatchComplete']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(source, /addEventListener\("click", completeSelectedDetailInstructions\)/);
});

test('批量处理逐条校验PC图片，PDA图片不替代PC图片，失败时整批不变', () => {
  const h = harness();
  h.c.getActiveInstructionRows();
  h.rows.forEach(row => h.c.selectedDetailInstructionCodes.add(row.code));
  const before = JSON.stringify([h.rows, h.original, h.active, h.other]);
  h.c.completeSelectedDetailInstructions();
  assert.equal(JSON.stringify([h.rows, h.original, h.active, h.other]), before);
  assert.equal(h.c.selectedDetailInstructionCodes.size, 2);
  assert.equal(h.alerts.length, 1);
  assert.match(h.alerts[0], /至少上传1张PC端图片/);
  assert.match(h.alerts[0], /查验（A-2）/);
  assert.doesNotMatch(h.alerts[0], /贴标（A-1）/);
});

test('两种指令阶段的详情中，每条上传一张PC图片即可完成且同步列表', () => {
  for (const status of ['指令待处理', '指令处理中']) {
    const h = harness(status);
    h.rows[1].images.push({ name: '查验.jpg', url: 'blob:pc2' });
    h.rows.forEach(row => h.c.selectedDetailInstructionCodes.add(row.code));
    h.c.completeSelectedDetailInstructions();
    assert.ok(h.rows.every(row => row.status === '已处理'));
    assert.ok(h.original.instructions.every(row => row.completed));
    assert.ok(h.active.instructions.every(row => row.completed));
    assert.equal(h.other.instructions[0].completed, false);
    assert.equal(h.c.selectedDetailInstructionCodes.size, 0);
    assert.equal(h.alerts.length, 0);
    assert.equal(h.nodes.get('#instructionProcessSummary').textContent, '待处理 0 项，已处理 2 项');
    assert.equal(h.rows[1].pdaImages.length, 1);
    assert.equal(h.rows[0].images.length, 1);
  }
});

test('仅处理勾选的待处理指令，已处理指令无需重新上传PC图片', () => {
  const h = harness();
  h.rows[1].status = '已处理';
  h.original.instructions[1].completed = h.active.instructions[1].completed = true;
  h.rows.forEach(row => h.c.selectedDetailInstructionCodes.add(row.code));
  h.c.completeSelectedDetailInstructions();
  assert.ok(h.rows.every(row => row.status === '已处理'));
  assert.equal(h.alerts.length, 0);
  const unselected = harness();
  unselected.c.selectedDetailInstructionCodes.add('A-1');
  unselected.c.completeSelectedDetailInstructions();
  assert.equal(unselected.rows[0].status, '已处理');
  assert.equal(unselected.rows[1].status, '待处理');
});

test('无图片或无效图片不能完成，上传补齐后可重试', () => {
  for (const images of [undefined, [], [{ url: '' }], [{ url: '  ' }], [null]]) {
    const h = harness();
    h.rows[0].images = images;
    h.c.selectedDetailInstructionCodes.add('A-1');
    h.c.completeSelectedDetailInstructions();
    assert.equal(h.rows[0].status, '待处理');
    h.rows[0].images = [{ url: 'blob:uploaded' }];
    h.c.completeSelectedDetailInstructions();
    assert.equal(h.rows[0].status, '已处理');
  }
});

test('其它状态没有处理入口，空选择和仅选已处理指令时不能再次处理', () => {
  for (const status of ['待审批', '暂存', '待出库', '已出库', '审批拒绝']) {
    const h = harness(status);
    h.c.selectedDetailInstructionCodes.add('A-1');
    h.c.updateInstructionProcessingToolbar(h.rows);
    assert.equal(h.nodes.get('#instructionProcessingToolbar').hidden, true);
    assert.equal(h.nodes.get('#instructionBatchComplete').disabled, true);
    h.c.completeSelectedDetailInstructions();
    assert.equal(h.rows[0].status, '待处理');
  }
  const h = harness();
  h.c.updateInstructionProcessingToolbar(h.rows);
  assert.equal(h.nodes.get('#instructionBatchComplete').disabled, true);
  h.c.selectedDetailInstructionCodes.add('A-1');
  h.c.updateInstructionProcessingToolbar(h.rows);
  assert.equal(h.nodes.get('#instructionDetailSelectAll').indeterminate, true);
  assert.equal(h.nodes.get('#instructionBatchComplete').disabled, false);
  h.c.completeSelectedDetailInstructions();
  h.c.selectedDetailInstructionCodes.add('A-1');
  h.c.updateInstructionProcessingToolbar(h.rows);
  assert.equal(h.nodes.get('#instructionBatchComplete').disabled, true);
});

test('单条状态修改也不能绕过PC图片校验', () => {
  const h = harness('指令处理中');
  h.c.activeReleaseReadOnly = false;
  const control = { value: '已处理', dataset: { instructionIndex: '1' } };
  h.handlers.get('#instructionBody:change')({ target: {
    closest: selector => selector === '.instruction-detail-status' ? control : null
  } });
  assert.equal(h.rows[1].status, '待处理');
  assert.equal(h.alerts.length, 1);
});

test('从待处理开始处理时保留已完成指令及其图片', () => {
  const row = { id: 1, instructions: [{ completed: true, images: [{ url: 'blob:pc' }] }] };
  const c = vm.createContext({
    selected: new Set([1]), instructionPendingRows: [row], instructionProcessingRows: [],
    isInstructionPendingView: () => true, updateStatusTabCount() {}, applyFilters() {},
    $: () => ({ addEventListener: (event, fn) => { c.start = fn; } })
  });
  const start = source.indexOf('$("#contextAction").addEventListener("click",');
  vm.runInContext(source.slice(start, source.indexOf('\n});', start) + 4), c);
  c.start();
  assert.equal(c.instructionPendingRows.length, 0);
  assert.equal(c.instructionProcessingRows[0].instructions[0].completed, true);
  assert.equal(c.instructionProcessingRows[0].instructions[0].images[0].url, 'blob:pc');
});
