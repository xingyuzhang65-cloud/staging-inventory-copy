import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8');
function harness(tasks) {
  const nodes = new Map();
  const context = vm.createContext({
    interceptActiveTab: '待处理', selectedInterceptIds: new Set(tasks.map(task => task.id)),
    interceptRemarkContext: null, interceptRemarkField: 'remark',
    interceptAttachmentForm: { fileName: '附件.png' }, interceptAttachmentDeletingId: 'attachment-1',
    getInterceptTask: id => tasks.find(task => task.id === (id ?? tasks[0].id)),
    getVisibleSelectableInterceptTasks: () => tasks,
    refreshInterceptUI() {}, addInterceptLog() {}, showInterceptToast() {},
    $: id => {
      if (!nodes.has(id)) nodes.set(id, { hidden: true, value: '', focus() {}, setAttribute() {} });
      return nodes.get(id);
    }
  });
  for (const name of ['canEditInterceptTask', 'getSelectedPendingInterceptTasks',
    'updateInterceptBatchControls', 'batchRemarkInterceptTasks', 'submitInterceptBatchNote',
    'openInterceptRemark', 'submitInterceptRemark', 'openInterceptFeeModal', 'saveInterceptFeeDraftRows',
    'openInterceptAttachmentModal', 'openInterceptAttachmentDelete', 'saveInterceptAttachment', 'confirmDeleteInterceptAttachment']) {
    vm.runInContext(source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))[0], context);
  }
  return context;
}

test('批量备注仅在待审批显示，拦截中的处理按钮仍可用', () => {
  const c = harness([{ id: 1, status: '待处理' }]);
  for (const status of ['待处理', '拦截中', '已完成', '已取消/已驳回', '全部']) {
    c.interceptActiveTab = status;
    c.updateInterceptBatchControls();
    assert.equal(c.$('#interceptBatchNoteButton').hidden, status !== '待处理');
    if (status === '拦截中') {
      for (const action of ['Cancel', 'Success', 'Failure']) {
        assert.equal(c.$(`#interceptBatch${action}Button`).hidden, false);
      }
    }
  }
});

test('待审批可编辑备注，审批后禁止从已打开的弹窗保存', () => {
  const task = { id: 1, status: '待处理', remark: '原备注', customerRemark: '客户备注' };
  const c = harness([task]);
  c.openInterceptRemark(1);
  assert.equal(c.$('#interceptRemarkOverlay').hidden, false);
  c.$('#interceptRemarkText').value = '新备注';
  c.submitInterceptRemark({ preventDefault() {} });
  assert.equal(task.remark, '新备注');
  c.openInterceptRemark(1, 'customerRemark');
  task.status = '拦截中';
  c.$('#interceptRemarkText').value = '不应保存';
  c.submitInterceptRemark({ preventDefault() {} });
  assert.equal(task.customerRemark, '客户备注');
});

test('批量备注只写入仍待审批的记录', () => {
  const tasks = [{ id: 1, status: '待处理', remark: '原备注' }, { id: 2, status: '拦截中', remark: '处理中备注' }];
  const c = harness(tasks);
  c.batchRemarkInterceptTasks();
  assert.equal(c.$('#interceptBatchNoteOverlay').hidden, false);
  c.$('#interceptBatchNoteText').value = '补充';
  c.submitInterceptBatchNote({ preventDefault() {} });
  assert.equal(tasks[0].remark, '原备注；补充');
  assert.equal(tasks[1].remark, '处理中备注');
  c.interceptActiveTab = '拦截中';
  c.batchRemarkInterceptTasks();
  assert.equal(c.$('#interceptBatchNoteOverlay').hidden, true);
});

test('非待审批状态不能打开编辑弹窗或提交备注、指令费用及附件修改', () => {
  for (const status of ['拦截中', '已完成', '拦截成功', '拦截失败', '已取消', '已驳回']) {
    const task = { id: 1, status, remark: '原备注', customerRemark: '客户备注' };
    const before = JSON.stringify(task);
    const c = harness([task]);
    c.openInterceptRemark(1);
    c.openInterceptFeeModal();
    c.openInterceptAttachmentModal();
    c.openInterceptAttachmentDelete('attachment-1');
    c.saveInterceptFeeDraftRows({ preventDefault() {} });
    c.saveInterceptAttachment();
    c.confirmDeleteInterceptAttachment();
    for (const overlay of ['Remark', 'Fee', 'Attachment', 'AttachmentDelete']) {
      assert.equal(c.$(`#intercept${overlay}Overlay`).hidden, true);
    }
    assert.equal(JSON.stringify(task), before);
  }
});
