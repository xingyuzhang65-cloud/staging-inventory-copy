/* Connect received returns to the existing inventory and instruction workflow. */
(() => {
  'use strict';
  const storageKey = 'mw-returns-instruction-bridge-v1';
  const stages = [
    ['待审批', approvalRows], ['指令待处理', instructionPendingRows],
    ['指令处理中', instructionProcessingRows], ['待出库', outboundRows],
    ['已出库', shippedRows], ['销毁', destroyedRows], ['审批拒绝', rejectedRows]
  ];
  const own = row => Boolean(row.returnSource && row.returnInstructionId);
  const service = row => row.returnType === '库内增值服务' || row.releaseType === '增值服务';
  const nextId = rows => rows.reduce((n, row) => Math.max(n, Number(row.id) || 0), 0) + 1;
  const canonical = (stage, row) => row.returnCompleted ? '已完成' : stage === '待出库'
    ? service(row) ? '指令处理完成' : '指令处理完成、待出库'
    : stage === '销毁' ? '已完成' : row.returnCancelled ? '已取消' : stage;
  function find(id) {
    for (const [stage, rows] of stages) {
      const row = rows.find(item => own(item) && item.returnInstructionId === id);
      if (row) return { stage, rows, row };
    }
    return null;
  }
  function persist() {
    const snapshots = stages.flatMap(([stage, rows]) => rows.filter(own).map(row => ({ stage, row })));
    try { localStorage.setItem(storageKey, JSON.stringify(snapshots)); } catch { /* UI stores the source separately. */ }
  }
  function counts() {
    stages.forEach(([stage, rows]) => updateStatusTabCount(stage, rows.length));
  }
  function refresh() {
    counts();
    if (!document.querySelector('#inventoryPage')?.hidden) applyFilters();
    persist();
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) for (const entry of saved) {
      const rows = stages.find(([stage]) => stage === entry.stage)?.[1];
      if (rows && own(entry.row) && !find(entry.row.returnInstructionId)) {
        rows.unshift({ ...entry.row, id: nextId(rows), status: entry.stage });
      }
    }
  } catch { /* Invalid saved data does not alter existing records. */ }

  function publish(order, instruction, seeded = false) {
    if (!order?.id || !instruction?.id) throw new Error('缺少退换货单或指令编号');
    const existing = find(instruction.id);
    if (existing) return canonical(existing.stage, existing.row);
    const requested = new Set(instruction.boxIds || []);
    const boxes = (order.boxes || []).filter(box => requested.has(box.id));
    const terminalSeed = seeded && (['已出库', '已完成', '审批拒绝', '已取消'].includes(instruction.status)
      || instruction.type === '库内增值服务' && instruction.status === '指令处理完成');
    if (!boxes.length || boxes.length !== requested.size || boxes.some(box => !box.receivedAt || (box.outbound && !terminalSeed))) {
      throw new Error('指令只能使用已实际收到且尚未出库的箱');
    }
    if (!terminalSeed && boxes.some(box => !box.claimed || !box.customerCode || box.customerCode !== order.customerCode
      || (box.reservedBy && box.reservedBy !== instruction.id))) {
      throw new Error('箱必须已认领、货主一致且未被其他指令占用');
    }
    const type = instruction.type;
    const releaseType = type === '库内增值服务' ? '增值服务' : type === '销毁' ? '销毁' : '发货';
    const row = {
      id: nextId(approvalRows), returnSource: order.id, returnInstructionId: instruction.id,
      returnBoxIds: [...requested], returnType: type, source: order.id,
      customer: order.customer || boxes[0].customer || '待识别货主', applicationNo: instruction.id,
      container: order.id, system: order.id, inbound: order.id, blocked: '退换货',
      applicationType: type === '自提' ? '客户自提' : '退换货', releaseType,
      shippingEnabled: releaseType !== '增值服务', transfer: '退换货',
      dispatch: type === '自提' ? '客户自提' : order.warehouse || '退回仓库',
      destination: order.warehouse || '-', shipmentId: '', referenceId: order.id,
      pallet: boxes.map(box => box.storageNo || box.id).join('；'),
      inboundTime: boxes.map(box => box.receivedAt).sort()[0], appliedBoxes: boxes.length,
      appliedVolume: 0, chargedPallets: '', financialAudit: '未审核', instructionAudit: '未审核',
      approvalStage: '待仓库审批', applicationTime: instruction.created || new Date().toISOString(),
      appointmentDeliveryTime: '-', shippingApplicationAttachment: '-', processingStartedAt: '-',
      processingFinishedAt: '-', timeoutCount: 0,
      applicationRemark: instruction.note || '', operator: instruction.operator || '仓库操作员',
      instructions: [{ text: `${type}：${instruction.note || '按客户指令处理'}`, completed: false }],
      status: '待审批'
    };
    // Seeded instructions can begin later in the same existing workflow.
    const initial = instruction.status || '待审批';
    const target = initial === '指令处理完成' || initial === '指令处理完成、待出库' ? '待出库'
      : initial === '已完成' ? type === '销毁' ? '销毁' : service(row) ? '待出库' : '已出库'
      : initial === '已取消' ? '审批拒绝' : initial;
    const destination = stages.find(([stage]) => stage === target) || stages[0];
    row.id = nextId(destination[1]); row.status = destination[0];
    row.returnCancelled = initial === '已取消';
    row.returnCompleted = initial === '已完成';
    if (['待出库', '已出库', '销毁'].includes(row.status)) {
      row.instructions.forEach(item => { item.completed = true; });
      row.instructionAudit = '已审核';
    }
    destination[1].unshift(row);
    refresh();
    return canonical(row.status, row);
  }

  function sync(orders) {
    const received = new Map();
    for (const order of orders || []) {
      for (const instruction of order.instructions || []) {
        if (!find(instruction.id)) publish(order, instruction, true);
      }
      for (const box of order.boxes || []) {
        const departed = stages.some(([stage, rows]) => ['已出库', '销毁'].includes(stage)
          && rows.some(row => own(row) && !service(row) && row.returnSource === order.id && row.returnBoxIds.includes(box.id)));
        if (!box.receivedAt || box.outbound || departed) continue;
        const key = `${order.id}::${box.id}`;
        const current = inventoryRows.find(row => row.returnBoxKey === key);
        const available = box.claimed && box.customerCode && box.customerCode === order.customerCode && !box.reservedBy;
        received.set(key, {
          id: current?.id || nextId(inventoryRows), returnSource: order.id, returnBoxKey: key,
          returnBoxId: box.id, returnAvailable: Boolean(available), customer: box.customer || '待识别货主',
          container: order.id, system: order.id, inbound: order.id, blocked: '退换货', transfer: '退换货',
          destination: order.warehouse || '-', dispatch: '-', pallet: box.storageNo || box.id,
          time: box.receivedAt, weight: 0, volume: 0, boxes: 1,
          pending: box.reservedBy ? 1 : 0, unsent: 1, sent: 0, status: '暂存',
          instructions: [{ text: `${box.counted ? '已清点' : '未清点'} · ${box.claimed ? '已认领' : '待认领'}${box.reservedBy ? ' · 指令占用' : ''}`, completed: false }]
        });
        if (current) Object.assign(current, received.get(key));
        else inventoryRows.unshift(received.get(key));
      }
    }
    for (let index = inventoryRows.length - 1; index >= 0; index--) {
      if (inventoryRows[index].returnBoxKey && !received.has(inventoryRows[index].returnBoxKey)) inventoryRows.splice(index, 1);
    }
    refresh();
  }
  function status(id) {
    const entry = find(id);
    if (!entry) return null;
    persist();
    return canonical(entry.stage, entry.row);
  }
  function openInstruction(id) {
    const entry = find(id);
    if (!entry) throw new Error('未找到关联指令');
    if (window.confirmDiscardInstructionStatusDrafts && !window.confirmDiscardInstructionStatusDrafts()) return;
    if (['待出库', '已出库'].includes(entry.stage)) showInventorySection('staging', entry.stage);
    else showInstructionList(entry.stage);
    Object.values(filters).forEach(control => { control.value = ''; });
    for (const selector of ['#dateFrom', '#dateTo']) {
      const control = document.querySelector(selector); if (control) control.value = '';
    }
    filters.request.value = entry.row.applicationNo;
    applyFilters();
  }

  // Allow warehouse progress updates in the existing read-only instruction detail.
  const originalRenderInstructionList = renderInstructionList;
  renderInstructionList = function (...args) {
    originalRenderInstructionList(...args);
    if (!own(activeReleaseSourceRow || {}) || activeReleaseStatus !== '指令处理中') return;
    document.querySelectorAll('#instructionBody .instruction-detail-status-tag').forEach((tag, index) => {
      const completed = tag.textContent.trim() === '已处理';
      const control = document.createElement('select');
      control.className = `instruction-detail-status ${completed ? 'is-complete' : 'is-pending'}`;
      control.dataset.instructionIndex = String(index);
      control.setAttribute('aria-label', `设置第 ${index + 1} 条指令处理状态`);
      control.innerHTML = `<option value="待处理" ${completed ? '' : 'selected'}>待处理</option><option value="已处理" ${completed ? 'selected' : ''}>已处理</option>`;
      tag.replaceWith(control);
    });
  };

  // Extend the existing table only for rows originating from returns.
  const originalRenderRows = renderRows;
  renderRows = function (...args) {
    originalRenderRows(...args);
    const rendered = body.querySelectorAll('tr');
    visibleRows.forEach((row, index) => {
      if (!row.returnSource || !rendered[index]) return;
      const cell = rendered[index].querySelector('.operation-col');
      if (!cell) return;
      if (row.returnBoxKey) {
        const button = cell.querySelector('.release-button');
        if (button) {
          button.textContent = row.returnAvailable ? '退换货下指令' : '查看退换货';
          button.title = row.returnAvailable ? '通过退换货单选择可用箱' : '未认领、未识别或被占用的箱不能下指令';
        }
      } else if (activeStatus === '待出库' && own(row)) {
        if (service(row)) {
          const label = document.createElement('span'); label.className = 'action-link'; label.textContent = '增值服务已完成';
          cell.prepend(label);
        } else {
          const button = document.createElement('button'); button.className = 'action-link returns-confirm-outbound';
          button.dataset.instruction = row.returnInstructionId;
          button.textContent = row.returnType === '销毁' ? '确认实际销毁' : row.returnType === '自提' ? '确认实际提货' : '确认实际出库';
          cell.prepend(button);
        }
      }
    });
    persist();
  };

  document.addEventListener('click', event => {
    const release = event.target.closest('.release-button');
    if (release) {
      const row = inventoryRows.find(item => item.id === Number(release.dataset.id));
      if (row?.returnSource) {
        event.preventDefault(); event.stopImmediatePropagation();
        window.ReturnsUI?.open(row.returnSource);
        return;
      }
    }
    if (event.target.closest('#approvalReviewConfirm') && own(activeApprovalReviewRow || {})) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!approvalReviewDecision) { window.alert('请先选择通过或拒绝，再确认审批'); return; }
      const row = activeApprovalReviewRow;
      const accepted = approvalReviewDecision === 'passed';
      const target = accepted ? instructionPendingRows : rejectedRows;
      const index = approvalRows.indexOf(row);
      if (index >= 0) approvalRows.splice(index, 1);
      target.unshift({ ...row, id: nextId(target), status: accepted ? '指令待处理' : '审批拒绝', approvalStage: accepted ? '审批通过' : '审批拒绝' });
      closeApprovalReview(); refresh();
      return;
    }
    const outbound = event.target.closest('.returns-confirm-outbound');
    if (!outbound) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const entry = find(outbound.dataset.instruction);
    if (!entry || entry.stage !== '待出库' || service(entry.row)) return;
    if (!window.confirm(`确认 ${entry.row.applicationNo} 的 ${entry.row.appliedBoxes} 箱已实际${entry.row.returnType === '销毁' ? '销毁' : '出库'}？确认后将扣除暂存库存。`)) return;
    const destination = entry.row.returnType === '销毁' ? destroyedRows : shippedRows;
    const departed = { ...entry.row, id: nextId(destination), status: entry.row.returnType === '销毁' ? '销毁' : '已出库', processingFinishedAt: new Date().toISOString() };
    destination.unshift(departed); entry.rows.splice(entry.rows.indexOf(entry.row), 1);
    for (let index = inventoryRows.length - 1; index >= 0; index--) {
      const row = inventoryRows[index];
      if (row.returnSource === departed.returnSource && departed.returnBoxIds.includes(row.returnBoxId)) inventoryRows.splice(index, 1);
    }
    refresh();
  }, true);
  window.ReturnsBridge = { sync, publish, status, openInstruction };
  counts();
})();
