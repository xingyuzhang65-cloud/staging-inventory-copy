import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8');
function harness() {
  const nodes = new Map(), alerts = [];
  const tabs = ['全部', '待初审', '待仓库审批'].map(stage => ({ dataset: { approvalStage: stage }, classList: { toggle() {} } }));
  const rows = [
    { id: 1, status: '待审批', approvalStage: '待仓库审批', customer: '甲', applicationNo: 'A', inbound: 'I1', instructions: [{ text: '贴标', completed: false, images: [{ url: '/pc.png' }], pdaImages: [{ url: '/pda.png' }] }] },
    { id: 2, status: '待审批', approvalStage: '待初审', customer: '乙', applicationNo: 'B', inbound: 'I2', instructions: [] },
    { id: 3, status: '待审批', approvalStage: '待仓库审批', customer: '甲', applicationNo: 'C', inbound: 'I3', instructions: [] }
  ];
  const c = vm.createContext({
    activeInventoryPage: 'instructions', activeStatus: '待审批', activeApprovalStage: '待仓库审批',
    warehouseBatchApprovalIds: [], approvalRows: rows,
    visibleRows: [rows[0], rows[2]], selected: new Set(),
    instructionPendingRows: [{ id: 9, applicationNo: 'EXISTING' }], rejectedRows: [],
    document: { querySelectorAll: () => tabs },
    window: { alert: text => alerts.push(text) },
    $: id => {
      if (!nodes.has(id)) nodes.set(id, { hidden: true, value: '', required: false });
      return nodes.get(id);
    },
    filters: Object.fromEntries(['keyword', 'inbound', 'customer', 'request', 'releaseType', 'transfer', 'fba', 'dispatch', 'container', 'pallet', 'financialAudit', 'blocked'].map(name => [name, { value: '' }])),
    getActiveStatusRows: () => rows, isRequestTableView: () => true,
    getReleaseType: row => row.releaseType, formatLocalDateTime: () => '2026-10-28 12:00:00',
    updateStatusTabCount() {}, renderRows() { c.updateApprovalStageControls(); }
  });
  for (const name of ['escapeHtml', 'isApprovalView', 'isWarehouseApprovalView', 'updateApprovalStageControls',
    'openBatchWarehouseApproval', 'updateBatchWarehouseApprovalDecision', 'closeBatchWarehouseApproval',
    'submitBatchWarehouseApproval', 'applyFilters']) {
    vm.runInContext(source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))[0], c);
  }
  return { c, rows, nodes, tabs, alerts, submit: () => c.submitBatchWarehouseApproval({ preventDefault() {} }) };
}

test('批量仓库审批按钮仅出现在指令列表的待仓库审批页签', () => {
  const h = harness();
  h.c.updateApprovalStageControls();
  assert.equal(h.nodes.get('#batchWarehouseApprovalButton').hidden, false);
  for (const [page, status, stage] of [['instructions', '待审批', '全部'], ['instructions', '待审批', '待初审'], ['instructions', '指令处理中', '待仓库审批'], ['staging', '待审批', '待仓库审批']]) {
    Object.assign(h.c, { activeInventoryPage: page, activeStatus: status, activeApprovalStage: stage });
    h.c.updateApprovalStageControls();
    assert.equal(h.nodes.get('#batchWarehouseApprovalButton').hidden, true);
  }
});

test('未选择记录提示，混入初审记录时禁止审批', () => {
  const h = harness();
  h.c.openBatchWarehouseApproval();
  assert.match(h.alerts[0], /请先勾选/);
  h.c.visibleRows = h.rows;
  h.c.selected.add(2);
  h.c.openBatchWarehouseApproval();
  assert.match(h.alerts[1], /仅支持审批待仓库审批/);
  assert.equal(h.c.warehouseBatchApprovalIds.length, 0);
});

test('取消审批不修改状态或移动记录', () => {
  const h = harness(), before = JSON.stringify(h.rows);
  h.c.selected.add(1);
  h.c.openBatchWarehouseApproval();
  assert.equal(h.nodes.get('#warehouseBatchApprovalOverlay').hidden, false);
  h.c.closeBatchWarehouseApproval();
  h.submit();
  assert.equal(JSON.stringify(h.rows), before);
  assert.equal(h.c.instructionPendingRows.length, 1);
});

test('批量通过仅移动勾选记录，保留指令及两端图片并更新计数', () => {
  const h = harness();
  h.c.selected.add(1);
  h.c.selected.add(3);
  h.c.openBatchWarehouseApproval();
  h.nodes.get('#warehouseBatchApprovalReason').value = '已核验';
  h.submit();
  assert.equal(h.rows.length, 1);
  assert.equal(h.rows[0].approvalStage, '待初审');
  assert.equal(h.c.instructionPendingRows.length, 3);
  assert.equal(h.c.instructionPendingRows[0].id, 10);
  assert.equal(h.c.instructionPendingRows[0].instructions[0].images[0].url, '/pc.png');
  assert.equal(h.c.instructionPendingRows[0].instructions[0].pdaImages[0].url, '/pda.png');
  assert.equal(h.c.instructionPendingRows[0].warehouseApprovalRemark, '已核验');
  assert.equal(h.c.instructionPendingRows[0].status, '指令待处理');
  assert.equal(h.c.selected.size, 0);
  assert.equal(h.tabs[2].textContent, '待仓库审批(0)');
  assert.equal(h.c.visibleRows.length, 0);
});

test('拒绝原因必填，拒绝后进入审批拒绝且不影响未选记录', () => {
  const h = harness();
  h.c.selected.add(1);
  h.c.openBatchWarehouseApproval();
  h.nodes.get('#warehouseBatchApprovalDecision').value = 'rejected';
  h.c.updateBatchWarehouseApprovalDecision();
  assert.equal(h.nodes.get('#warehouseBatchApprovalReason').required, true);
  h.submit();
  assert.equal(h.rows.length, 3);
  assert.match(h.alerts[0], /请填写拒绝原因/);
  h.nodes.get('#warehouseBatchApprovalReason').value = '资料不完整';
  h.submit();
  assert.equal(h.rows.length, 2);
  assert.equal(h.c.rejectedRows[0].status, '审批拒绝');
  assert.equal(h.c.rejectedRows[0].rejectReason, '资料不完整');
  assert.equal(h.c.instructionPendingRows.length, 1);
});

test('弹窗打开后记录状态变化时整批不提交，重复提交不会生成重复记录', () => {
  const h = harness();
  h.c.selected.add(1);
  h.c.selected.add(3);
  h.c.openBatchWarehouseApproval();
  h.rows[2].approvalStage = '待初审';
  h.submit();
  assert.equal(h.c.instructionPendingRows.length, 1);
  assert.equal(h.rows.length, 3);
  assert.match(h.alerts[0], /状态已变化/);
  h.submit();
  assert.equal(h.c.instructionPendingRows.length, 1);
});

test('切换审批页签及搜索时，阶段筛选与查询条件同时生效', () => {
  const h = harness();
  h.c.filters.request.value = 'A';
  h.c.applyFilters();
  assert.equal(h.c.visibleRows.length, 1);
  h.c.activeApprovalStage = '待初审';
  h.c.applyFilters();
  assert.equal(h.c.visibleRows.length, 0);
  h.c.filters.request.value = '';
  h.c.applyFilters();
  assert.equal(h.c.visibleRows.length, 1);
  assert.equal(h.c.visibleRows[0].id, 2);
});
