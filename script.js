const rawRows = [
  ["TTTX","WEMA1131231","/","2","是","拆转","ABE2","Truck-Walmart","2-ABE2-1","2024-04-23 15:22:43",0,0,11,0,7,4,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","LG,SZ,GD,123,Tom,123...","Truck-Other","8889990-250623-88-6","2025-07-11 15:29:34",2,2,2,0,1,1,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","LG,SZ,GD,123,Tom,123...","Truck-Other","8889990-250623-88-7","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","LG,SZ,GD,123,Tom,123...","Truck-Other","8889990-250623-88-9","2025-07-11 15:29:34",0,0,2,0,2,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-1","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-2","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-3","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-7","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-8","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["23","8889990","8889990-250623","88","是","拆转","BWI9","Truck-Walmart","8889990-250623-BWI9-9","2025-07-11 15:29:34",0,0,0,0,0,0,"暂存"],
  ["TTTX","AAAA0000000","AAAA0000000-241109","2","是","拆转","ABE2","Truck-Amazon","AAAA0000000-241109-ABE8-2","2024-11-05 15:18:21",0,0,0,0,0,0,"暂存"],
  ["TTTX","AAAA0000000","AAAA0000000-2411...","2","是","拆转","ABE8","Truck-Amazon","AAAA0000000-241109-ABE8-3","2024-11-05 15:18:21",0,0,0,0,0,0,"暂存"],
  ["TTTX","AAAA0000000","AAAA0000000-2411...","2","是","拆转","ABE8","Truck-Amazon","AAAA0000000-241109-ABE8-5","2024-11-05 15:18:21",61.8,4.436,4,2,3,1,"待审批"]
];
const inventoryRows = rawRows.map((r, index) => ({
  id: index + 1, customer: r[0], container: r[1], system: r[2], inbound: r[3],
  blocked: r[4], transfer: r[5], destination: r[6], dispatch: r[7], pallet: r[8],
  time: r[9], weight: r[10], volume: r[11], boxes: r[12], pending: r[13],
  unsent: r[14], sent: r[15], status: r[16]
}));
const instructionCatalog = [
  { code: "FY202509260001", name: "仓储渠道-免仓30天", type: "仓储费", unit: "票", price: "3", currency: "人民币", description: "提柜入仓当天起算" },
  { code: "FY202509260002", name: "仓储渠道-31-90天", type: "仓储费", unit: "票", price: "4", currency: "人民币", description: "按1级单价收取" },
  { code: "FY202509260003", name: "仓储渠道-90天以上", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按2级单价收取" },
  { code: "FY202509260004", name: "拦截-免仓7天", type: "仓储费", unit: "票", price: "4", currency: "人民币", description: "提柜入仓当天起算" },
  { code: "FY202509260005", name: "拦截-免仓8-90天", type: "仓储费", unit: "票", price: "3", currency: "人民币", description: "按1级单价收取" },
  { code: "FY202509260006", name: "拦截-免仓90天以上", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按2级单价收取" },
  { code: "FY202509260007", name: "扣货-无免仓期", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按1级单价收取" },
  { code: "FY202607240008", name: "换标操作费", type: "操作费", unit: "箱", price: "5", currency: "人民币", description: "更换外箱标签" },
  { code: "FY202607240009", name: "标签材料费", type: "操作费", unit: "张", price: "3", currency: "人民币", description: "标签打印及耗材" },
  { code: "FY202607240010", name: "拍照服务费", type: "操作费", unit: "箱", price: "2", currency: "人民币", description: "按箱拍照并回传" }
];
const instructionRecordsByInventory = new Map([
  [13, [
    {
      id: "CZ202607240001",
      boxNo: "FBA31DNZH02MU000313U0001",
      scope: "按箱",
      type: "换标",
      description: "更换外箱标签后拍照回传，标签位置保持平整清晰",
      status: "待处理",
      priority: "紧急",
      remark: "优先处理第一箱",
      createdBy: "天朗（付豪）",
      createdAt: "2026-07-24 09:18:32",
      processedBy: "",
      processedAt: "",
      processMethod: "",
      fees: [
        { ...instructionCatalog[7], quantity: "1", addedAt: "2026-07-24 09:18:32", addedBy: "天朗（付豪）" },
        { ...instructionCatalog[8], quantity: "1", addedAt: "2026-07-24 09:18:32", addedBy: "天朗（付豪）" }
      ]
    },
    {
      id: "CZ202607240002",
      boxNo: "FBA31DNZH02MU000313U0002",
      scope: "按箱",
      type: "拍照",
      description: "拍摄外箱六面及标签近照并上传",
      status: "已处理",
      priority: "普通",
      remark: "",
      createdBy: "天朗（付豪）",
      createdAt: "2026-07-24 08:46:10",
      processedBy: "仓库操作员01",
      processedAt: "2026-07-24 09:05:26",
      processMethod: "PDA处理",
      fees: [
        { ...instructionCatalog[9], quantity: "1", addedAt: "2026-07-24 08:46:10", addedBy: "天朗（付豪）" }
      ]
    }
  ]]
]);
const releaseDetailsByInventory = new Map([
  [13, {
    application: "FBA",
    destination: "ABE8",
    shipment: "FBA19DNZH02MU000319",
    method: "Truck-Amazon",
    reference: "REF-20260722-001",
    boxes: "2",
    date: "2026-07-25",
    remark: "预约完成后安排出库",
    attachment: "放货预约单.pdf"
  }]
]);
const statusCounts = {
  "暂存": 274,
  "待审批": 1,
  "指令待处理": 0,
  "指令处理中": 0,
  "待出库": 92,
  "已出库": 31,
  "审批拒绝": 36
};
const statusLabels = { "待出库": "指令处理完成，待出库" };
let instructionDraftCodes = new Set();
let instructionCreateDraftFees = [];
let feePickerContext = null;
let activeInstructionStatus = "全部";
let editingFeeContext = null;
let deletingFeeContext = null;
let instructionSequence = 3;
let instructionNoticeTimer;
let isCreatingInstruction = false;
const expandedInstructionIds = new Set(["CZ202607240001"]);
const selected = new Set();
let activeStatus = "暂存";
let visibleRows = inventoryRows.filter((row) => row.status === activeStatus);

const $ = (selector) => document.querySelector(selector);
const body = $("#inventoryBody");
const selectAll = $("#selectAll");
const filters = {
  keyword: $("#keywordFilter"), customer: $("#customerFilter"), inbound: $("#inboundFilter"),
  transfer: $("#transferFilter"), fba: $("#fbaFilter"), dispatch: $("#dispatchFilter"),
  location: $("#locationFilter"), container: $("#containerFilter"), pallet: $("#palletFilter"),
  blocked: $("#blockedFilter")
};

function addOptions(select, values) {
  [...new Set(values.filter(Boolean))].forEach((value) => {
    const option = document.createElement("option");
    option.value = value; option.textContent = value; select.appendChild(option);
  });
}
addOptions(filters.customer, inventoryRows.map((row) => row.customer));
addOptions(filters.fba, inventoryRows.map((row) => row.destination));
addOptions(filters.dispatch, inventoryRows.map((row) => row.dispatch));
addOptions(filters.location, ["A01-01", "A02-03", "B01-07"]);
function updateStatusDisplay() {
  document.querySelectorAll(".status-tab").forEach((tab) => {
    const status = tab.dataset.status;
    const label = statusLabels[status] || status;
    tab.textContent = `${label}(${statusCounts[status] ?? 0})`;
  });
  $("#tableTotal").textContent = `共 ${statusCounts[activeStatus] ?? 0} 条`;
}
function renderRows() {
  if (!visibleRows.length) {
    body.innerHTML = '<tr><td class="empty-row" colspan="19">暂无匹配库存记录</td></tr>';
    selectAll.checked = false;
    updateSummary();
    return;
  }
  body.innerHTML = visibleRows.map((row) => `
    <tr>
      <td class="index-col">${row.id}</td>
      <td class="check-col"><input class="row-check" type="checkbox" data-id="${row.id}" ${selected.has(row.id) ? "checked" : ""}></td>
      <td title="${row.customer}">${row.customer}</td>
      <td title="${row.container}">${row.container}</td>
      <td title="${row.system}">${row.system}</td>
      <td>${row.inbound}</td>
      <td class="${row.blocked === "是" ? "blocked" : ""}">${row.blocked === "是" ? "拦截" : "否"}</td>
      <td>${row.transfer}</td>
      <td title="${row.destination}">${row.destination}</td>
      <td title="${row.dispatch}">${row.dispatch}</td>
      <td title="${row.pallet}">${row.pallet}</td>
      <td>${row.time}</td>
      <td>${row.weight || 0}</td><td>${row.volume || 0}</td><td>${row.boxes}</td>
      <td>${row.pending}</td><td>${row.unsent}</td><td>${row.sent}</td>
      <td class="operation-col"><button class="action-link release-button" type="button" data-id="${row.id}" data-mode="${row.status === "待审批" ? "detail" : "release"}" aria-label="${row.status === "待审批" ? `查看柜号 ${row.container} 的放货详情` : `为柜号 ${row.container} 放货`}">${row.status === "待审批" ? "详情" : "放货"}</button><button class="action-link" type="button">日志</button></td>
    </tr>`).join("");
  document.querySelectorAll(".row-check").forEach((check) => {
    check.addEventListener("change", () => {
      const id = Number(check.dataset.id);
      check.checked ? selected.add(id) : selected.delete(id);
      selectAll.checked = visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.id));
      updateSummary();
    });
  });
  selectAll.checked = visibleRows.every((row) => selected.has(row.id));
  updateSummary();
}

function updateSummary() {
  const rows = inventoryRows.filter((row) => selected.has(row.id));
  $("#selectedPallets").textContent = rows.length;
  $("#selectedBoxes").textContent = rows.reduce((sum, row) => sum + row.boxes, 0);
  $("#selectedBoards").textContent = rows.length;
  $("#selectedWeight").textContent = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0).toFixed(1).replace(".0", "");
  $("#selectedVolume").textContent = rows.reduce((sum, row) => sum + Number(row.volume || 0), 0).toFixed(3).replace(/\.?0+$/, "");
}

function applyFilters() {
  const keyword = filters.keyword.value.trim().toLowerCase();
  const inboundTerms = filters.inbound.value.split(/[;；]/).map((term) => term.trim()).filter(Boolean);
  visibleRows = inventoryRows.filter((row) => {
    const haystack = [row.customer, row.container, row.system, row.inbound, row.pallet].join(" ").toLowerCase();
    return row.status === activeStatus
      && (!keyword || haystack.includes(keyword))
      && (!filters.customer.value || row.customer === filters.customer.value)
      && (!inboundTerms.length || inboundTerms.includes(row.inbound))
      && (!filters.transfer.value || row.transfer === filters.transfer.value)
      && (!filters.fba.value || row.destination === filters.fba.value)
      && (!filters.dispatch.value || row.dispatch === filters.dispatch.value)
      && (!filters.container.value || row.container.toLowerCase().includes(filters.container.value.trim().toLowerCase()))
      && (!filters.pallet.value || row.pallet.toLowerCase().includes(filters.pallet.value.trim().toLowerCase()))
      && (!filters.blocked.value || row.blocked === filters.blocked.value);
  });
  renderRows();
  updateStatusDisplay();
}
$("#searchButton").addEventListener("click", applyFilters);
$("#resetButton").addEventListener("click", () => {
  Object.values(filters).forEach((control) => { control.value = ""; });
  $("#dateFrom").value = ""; $("#dateTo").value = "";
  visibleRows = inventoryRows.filter((row) => row.status === activeStatus);
  renderRows();
  updateStatusDisplay();
});
Object.values(filters).forEach((control) => {
  control.addEventListener("keydown", (event) => { if (event.key === "Enter") applyFilters(); });
});
selectAll.addEventListener("change", () => {
  visibleRows.forEach((row) => selectAll.checked ? selected.add(row.id) : selected.delete(row.id));
  renderRows();
});
document.querySelectorAll(".status-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".status-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeStatus = tab.dataset.status;
    selected.clear();
    applyFilters();
  });
});
$("#collapseButton").addEventListener("click", () => {
  const card = $("#filterCard");
  const collapsed = card.classList.toggle("collapsed");
  $("#collapseButton").innerHTML = collapsed ? "<span>⌄</span> 展开" : "<span>⌃</span> 收起";
});
$("#densityButton").addEventListener("click", () => {
  document.querySelector(".inventory-card").classList.toggle("compact");
});
$(".menu-toggle").addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});
$("#exportButton").addEventListener("click", () => {
  const header = ["客户名称","柜号","系统柜号","入仓号","是否拦截","转运方式","目的地","派送方式","托盘标签","入库时间","重量","体积","总箱数","待审核箱数","未发货箱数","已发货箱数"];
  const lines = [header, ...visibleRows.map((r) => [r.customer,r.container,r.system,r.inbound,r.blocked,r.transfer,r.destination,r.dispatch,r.pallet,r.time,r.weight,r.volume,r.boxes,r.pending,r.unsent,r.sent])];
  const csv = "\ufeff" + lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "暂存库存.csv"; link.click();
  URL.revokeObjectURL(url);
});

function getCargoBoxRows(row) {
  if (row.id === 1) {
    return [
      { boxNo: "FBA19DNZH02MU000319U0001", customerTracking: "YT2507100001_0710_2U0001", customerData: ["44 KG", "50*50*50 CM"], systemWeight: ["44 / 44 KG", "50*50*50 CM"], carrier: "美森正班13日达-卡派包税", transferNo: "1Z0VV966030992", warehouseReturnNo: "1Z0VV966030992", networkStatus: "已下单", status: "查看" },
      { boxNo: "FBA19DNZH02MU000319U0002", customerTracking: "YT2507100001_0710_2U0002", customerData: ["44 KG", "50*50*50 CM"], systemWeight: ["44 / 44 KG", "50*50*50 CM"], carrier: "美森正班13日达-卡派包税", transferNo: "1321636632", warehouseReturnNo: "1321636632", networkStatus: "已下单", status: "查看" }
    ];
  }
  const count = Math.max(1, Math.min(Number(row.unsent || row.boxes || 1), 8));
  const perBoxWeight = Number(row.weight || count * 44) / count;
  const fbaCode = `FBA${String(18 + row.id).padStart(2, "0")}DNZH02MU0003${String(row.id).padStart(2, "0")}`;
  const waybillNo = `YT250710${String(row.id).padStart(4, "0")}_0710_${row.id}`;
  return Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;
    const weight = Number(perBoxWeight.toFixed(2));
    const transferNo = `1Z0VV96603${String(row.id).padStart(2, "0")}${String(sequence).padStart(4, "0")}`;
    return {
      boxNo: `${fbaCode}U${String(sequence).padStart(4, "0")}`,
      customerTracking: `${waybillNo}U${String(sequence).padStart(4, "0")}`,
      customerData: [`${weight} KG`, "50*50*50 CM"],
      systemWeight: [`${weight} / ${weight} KG`, "50*50*50 CM"],
      carrier: row.dispatch || "-",
      transferNo,
      warehouseReturnNo: transferNo,
      networkStatus: "已下单",
      status: "查看"
    };
  });
}

function renderCargoBoxRows(row) {
  $("#cargoBoxBody").innerHTML = getCargoBoxRows(row).map((box) => `<tr>
    <td class="cargo-check"><input type="checkbox" disabled aria-label="货箱 ${box.boxNo}" /></td>
    <td class="box-code"><div>${box.boxNo}</div><div class="subline">${box.customerTracking}</div></td>
    <td><div>${box.customerData[0]}</div><div class="subline">${box.customerData[1]}</div></td>
    <td><div>${box.systemWeight[0]}</div><div class="subline">${box.systemWeight[1]}</div></td>
    <td><div>${box.carrier}</div><div class="subline">${box.transferNo}</div></td>
    <td class="muted">-</td><td class="return-no">${box.warehouseReturnNo}</td>
    <td>${box.networkStatus}</td><td class="muted">${box.status}</td>
  </tr>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function getLocalTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function getActiveInstructions() {
  if (!activeReleaseRow) return [];
  return instructionRecordsByInventory.get(activeReleaseRow.id) || [];
}

function getInstructionById(instructionId) {
  return getActiveInstructions().find((instruction) => instruction.id === instructionId);
}

function getFeeRowsForContext(context) {
  if (!context) return [];
  if (context.mode === "create") return instructionCreateDraftFees;
  return getInstructionById(context.instructionId)?.fees || [];
}

function setFeeRowsForContext(context, fees) {
  if (!context) return;
  if (context.mode === "create") {
    instructionCreateDraftFees = fees;
    renderInstructionCreateFees();
    return;
  }
  const instruction = getInstructionById(context.instructionId);
  if (!instruction || instruction.status !== "待处理") return;
  instruction.fees = fees;
  expandedInstructionIds.add(instruction.id);
  renderInstructionList();
}

function makeFeeRow(catalogRow) {
  return {
    ...catalogRow,
    quantity: "1",
    addedAt: getLocalTimestamp(),
    addedBy: "天朗（付豪）"
  };
}

function getFeeSubtotal(fee) {
  return Number(fee.price || 0) * Number(fee.quantity || 1);
}

function formatFeeTotals(fees) {
  if (!fees.length) return '<span class="instruction-readonly-hint">无费用</span>';
  const totals = new Map();
  fees.forEach((fee) => {
    totals.set(fee.currency, (totals.get(fee.currency) || 0) + getFeeSubtotal(fee));
  });
  return `<span class="instruction-fee-total">${[...totals.entries()].map(([currency, total]) =>
    `<span>${escapeHtml(currency)} ${Number(total.toFixed(2))}</span>`
  ).join("")}</span>`;
}

function renderInstructionFeeRows(instruction) {
  if (!instruction.fees.length) {
    return '<tr class="fee-empty"><td colspan="11">暂无费用明细</td></tr>';
  }
  const editable = instruction.status === "待处理";
  return instruction.fees.map((fee) => `<tr>
    <td title="${escapeHtml(fee.code)}">${escapeHtml(fee.name)}</td>
    <td>${escapeHtml(fee.type)}</td>
    <td>${escapeHtml(fee.unit)}</td>
    <td>${escapeHtml(fee.price)}</td>
    <td>${escapeHtml(fee.quantity || "1")}</td>
    <td>${escapeHtml(fee.currency)}</td>
    <td>${Number(getFeeSubtotal(fee).toFixed(2))}</td>
    <td>${escapeHtml(fee.addedAt)}</td>
    <td>${escapeHtml(fee.addedBy)}</td>
    <td><span class="instruction-fee-description" title="${escapeHtml(fee.description)}">${escapeHtml(fee.description)}</span></td>
    <td>${editable
      ? `<button class="fee-edit" data-instruction-id="${escapeHtml(instruction.id)}" data-code="${escapeHtml(fee.code)}" type="button">编辑</button><button class="fee-delete" data-instruction-id="${escapeHtml(instruction.id)}" data-code="${escapeHtml(fee.code)}" type="button">删除</button>`
      : '<span class="instruction-readonly-hint">只读</span>'}</td>
  </tr>`).join("");
}

function renderInstructionTabs() {
  const rows = getActiveInstructions();
  const counts = {
    "全部": rows.length,
    "待处理": rows.filter((row) => row.status === "待处理").length,
    "已处理": rows.filter((row) => row.status === "已处理").length
  };
  document.querySelectorAll("#instructionStatusTabs button").forEach((button) => {
    const status = button.dataset.instructionStatus;
    const active = status === activeInstructionStatus;
    button.textContent = `${status}（${counts[status]}）`;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function renderInstructionList() {
  const target = $("#instructionBody");
  renderInstructionTabs();
  const rows = getActiveInstructions().filter((row) =>
    activeInstructionStatus === "全部" || row.status === activeInstructionStatus
  );
  if (!rows.length) {
    target.innerHTML = '<tr class="instruction-empty"><td colspan="10"><i>▤</i>当前筛选下暂无指令</td></tr>';
    return;
  }
  target.innerHTML = rows.map((instruction) => {
    const expanded = expandedInstructionIds.has(instruction.id);
    const processedInfo = instruction.status === "已处理"
      ? `<span>${escapeHtml(instruction.processedBy || "—")}</span><small>${escapeHtml(instruction.processedAt || "—")}</small><small>${escapeHtml(instruction.processMethod || "—")}</small>`
      : '<span class="instruction-readonly-hint">尚未处理</span>';
    const addFeeButton = instruction.status === "待处理"
      ? `<button class="instruction-fee-add" data-instruction-id="${escapeHtml(instruction.id)}" type="button">新增费用</button>`
      : "";
    return `<tr class="instruction-main-row">
      <td><span class="instruction-code">${escapeHtml(instruction.id)}</span></td>
      <td><span class="instruction-box-no" title="${escapeHtml(instruction.boxNo)}">${escapeHtml(instruction.boxNo)}</span></td>
      <td><span class="instruction-name">${escapeHtml(instruction.type)}</span><span class="instruction-dimension">${escapeHtml(instruction.scope)}</span></td>
      <td><span class="instruction-description" title="${escapeHtml(instruction.description)}">${escapeHtml(instruction.description)}</span></td>
      <td><b class="instruction-state ${instruction.status === "待处理" ? "pending" : "processed"}">${escapeHtml(instruction.status)}</b></td>
      <td><span class="instruction-priority ${instruction.priority === "紧急" ? "urgent" : ""}">${escapeHtml(instruction.priority)}</span></td>
      <td>${formatFeeTotals(instruction.fees)}</td>
      <td><span class="instruction-meta"><span>${escapeHtml(instruction.createdBy)}</span><small>${escapeHtml(instruction.createdAt)}</small></span></td>
      <td><span class="instruction-meta">${processedInfo}</span></td>
      <td><span class="instruction-actions"><button class="instruction-fee-toggle" data-instruction-id="${escapeHtml(instruction.id)}" type="button" aria-expanded="${expanded}">${expanded ? "收起费用" : "查看费用"}</button>${addFeeButton}</span></td>
    </tr>
    <tr class="instruction-fee-detail" ${expanded ? "" : "hidden"}>
      <td colspan="10">
        <div class="instruction-fee-panel">
          <div class="instruction-fee-head"><strong>费用明细（${instruction.fees.length}）</strong>${addFeeButton}</div>
          <div class="instruction-fee-wrap">
            <table class="instruction-fee-table">
              <thead><tr><th>费用名称</th><th>类型</th><th>单位</th><th>单价</th><th>数量</th><th>币种</th><th>小计</th><th>添加时间</th><th>添加人</th><th>描述</th><th>操作</th></tr></thead>
              <tbody>${renderInstructionFeeRows(instruction)}</tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function showInstructionNotice(message) {
  const notice = $("#instructionNotice");
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(instructionNoticeTimer);
  instructionNoticeTimer = setTimeout(() => { notice.hidden = true; }, 4200);
}

function renderInstructionCreateFees() {
  const target = $("#instructionCreateFeeBody");
  if (!instructionCreateDraftFees.length) {
    target.innerHTML = '<tr class="fee-empty"><td colspan="9">暂未添加费用，可直接新增指令</td></tr>';
    return;
  }
  target.innerHTML = instructionCreateDraftFees.map((fee) => `<tr>
    <td title="${escapeHtml(fee.code)}">${escapeHtml(fee.name)}</td><td>${escapeHtml(fee.type)}</td><td>${escapeHtml(fee.unit)}</td>
    <td>${escapeHtml(fee.price)}</td><td>${escapeHtml(fee.quantity || "1")}</td><td>${escapeHtml(fee.currency)}</td>
    <td>${Number(getFeeSubtotal(fee).toFixed(2))}</td>
    <td><span class="instruction-fee-description" title="${escapeHtml(fee.description)}">${escapeHtml(fee.description)}</span></td>
    <td><button class="fee-edit" data-code="${escapeHtml(fee.code)}" type="button">编辑</button><button class="fee-delete" data-code="${escapeHtml(fee.code)}" type="button">删除</button></td>
  </tr>`).join("");
}

function renderInstructionBoxOptions() {
  if (!activeReleaseRow) return;
  $("#instructionBoxOptions").innerHTML = getCargoBoxRows(activeReleaseRow).map((box) =>
    `<label title="${escapeHtml(box.boxNo)}"><input type="checkbox" value="${escapeHtml(box.boxNo)}" /><span>${escapeHtml(box.boxNo)}</span></label>`
  ).join("");
}

function resetInstructionCreateForm() {
  $("#instructionCreateForm").reset();
  $("#createInstructionCustomType").hidden = true;
  $("#createInstructionCustomType").disabled = true;
  $("#createInstructionCustomType").required = false;
  $("#createInstructionCustomType").setCustomValidity("");
  $("#instructionBoxField").hidden = true;
  $("#createInstructionBoxError").textContent = "";
  $("#instructionCreateError").hidden = true;
  $("#instructionCreateError").textContent = "";
  $("#instructionCreateSubmit").disabled = false;
  isCreatingInstruction = false;
  instructionCreateDraftFees = [];
  renderInstructionCreateFees();
}

function openInstructionCreate() {
  if (!activeReleaseRow || releaseDrawerMode !== "detail") return;
  resetInstructionCreateForm();
  renderInstructionBoxOptions();
  $("#instructionCreateOverlay").hidden = false;
  requestAnimationFrame(() => $("#createInstructionType").focus());
}

function closeInstructionCreate() {
  $("#instructionCreateOverlay").hidden = true;
  if (!$("#instructionOverlay").hidden) closeInstructionPicker();
  resetInstructionCreateForm();
}

function getFilteredInstructionCatalog() {
  const keyword = $("#instructionSearchName").value.trim().toLowerCase();
  const type = $("#instructionSearchType").value;
  return instructionCatalog.filter((row) =>
    (!keyword || `${row.code} ${row.name}`.toLowerCase().includes(keyword))
    && (!type || row.type === type)
  );
}

function getExistingFeeCodesForPicker() {
  if (feePickerContext?.mode !== "record") return new Set();
  return new Set(getFeeRowsForContext(feePickerContext).map((fee) => fee.code));
}

function renderInstructionPicker() {
  const rows = getFilteredInstructionCatalog();
  const existingCodes = getExistingFeeCodesForPicker();
  const displayRows = [...rows, ...Array(Math.max(0, 18 - rows.length)).fill(null)].slice(0, 18);
  $("#instructionPickerBody").innerHTML = displayRows.map((row) => {
    const alreadyAdded = row && existingCodes.has(row.code);
    const checked = row && (instructionDraftCodes.has(row.code) || alreadyAdded);
    return `<tr>
      <td><input class="instruction-pick" type="checkbox" ${row ? `data-code="${escapeHtml(row.code)}"` : "disabled"} ${alreadyAdded || !row ? "disabled" : ""} ${checked ? "checked" : ""} /></td>
      <td>${escapeHtml(row?.code || "")}</td><td>${escapeHtml(row?.name || "")}</td><td>${escapeHtml(row?.type || "")}</td><td>${escapeHtml(row?.unit || "")}</td>
      <td>${escapeHtml(row?.price || "")}</td><td>${escapeHtml(row?.currency || "")}</td><td>${escapeHtml(row?.description || "")}</td>
    </tr>`;
  }).join("");
  const availableCodes = instructionCatalog.filter((row) => !existingCodes.has(row.code)).map((row) => row.code);
  $("#instructionSelectAll").checked = availableCodes.length > 0 && availableCodes.every((code) => instructionDraftCodes.has(code));
  $("#instructionSelectedCount").textContent = `本次选中${instructionDraftCodes.size}条`;
}

function openInstructionPicker(context) {
  feePickerContext = context;
  instructionDraftCodes = context.mode === "create"
    ? new Set(instructionCreateDraftFees.map((row) => row.code))
    : new Set();
  $("#instructionSearchName").value = "";
  $("#instructionSearchType").value = "";
  $("#instructionDrawerTitle").textContent = context.mode === "create" ? "选择费用明细" : "新增费用";
  $("#instructionOverlay").hidden = false;
  renderInstructionPicker();
}

function closeInstructionPicker() {
  $("#instructionOverlay").hidden = true;
  feePickerContext = null;
  instructionDraftCodes = new Set();
}

function generateInstructionId() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `CZ${date}${String(instructionSequence++).padStart(4, "0")}`;
}

function openFeeEdit(context, feeCode) {
  const fee = getFeeRowsForContext(context).find((row) => row.code === feeCode);
  if (!fee) return;
  editingFeeContext = { ...context, code: feeCode };
  $("#editInstructionCode").value = fee.code;
  $("#editInstructionName").value = fee.name;
  $("#editInstructionType").value = fee.type;
  $("#editInstructionUnit").value = fee.unit;
  $("#editInstructionPrice").value = fee.price;
  $("#editInstructionQuantity").value = fee.quantity || "1";
  $("#editInstructionCurrency").value = fee.currency;
  $("#editInstructionDescription").value = fee.description || "";
  $("#instructionEditOverlay").hidden = false;
}

function openFeeDelete(context, feeCode) {
  const fee = getFeeRowsForContext(context).find((row) => row.code === feeCode);
  if (!fee) return;
  deletingFeeContext = { ...context, code: feeCode };
  $("#deleteInstructionName").textContent = fee.name;
  $("#instructionDeleteOverlay").hidden = false;
}

const releaseOverlay = $("#releaseOverlay");
const releaseForm = $("#releaseForm");
let activeReleaseRow = null;
let releaseDrawerMode = "release";

const releaseReadonlyInputSelectors = [
  "#releaseShipment",
  "#releaseReference",
  "#releaseBoxes",
  "#releaseDate",
  "#releaseRemark"
];
const releaseDisabledSelectSelectors = ["#releaseDestination", "#releaseMethod"];

function setReleaseFormReadonly(readonly) {
  releaseReadonlyInputSelectors.forEach((selector) => { $(selector).readOnly = readonly; });
  releaseDisabledSelectSelectors.forEach((selector) => { $(selector).disabled = readonly; });
  document.querySelectorAll('input[name="application"]').forEach((radio) => { radio.disabled = readonly; });
  $("#releaseFile").disabled = readonly;
  $("#uploadButton").hidden = readonly;
  $("#releaseSubmit").hidden = readonly;
  $("#releaseSubmit").disabled = readonly;
  $("#releaseModeBadge").hidden = !readonly;
  $("#releaseCancel").textContent = readonly ? "关闭" : "取消";
  releaseForm.classList.toggle("detail-mode", readonly);
  document.querySelector(".release-drawer").classList.toggle("detail-wide", readonly);
}

function populateReleaseFields(row, details) {
  const data = details || {};
  const application = data.application || "FBA";
  document.querySelectorAll('input[name="application"]').forEach((radio) => {
    radio.checked = radio.value === application;
  });
  $("#releaseDestination").value = data.destination || "";
  $("#releaseShipment").value = data.shipment || "";
  $("#releaseMethod").value = data.method || "Truck-Amazon";
  $("#releaseReference").value = data.reference || "";
  $("#releaseBoxes").value = data.boxes || "";
  $("#releaseDate").value = data.date || "";
  $("#releaseRemark").value = data.remark || "";
  $("#releaseFile").value = "";
  $("#uploadName").textContent = data.attachment || (releaseDrawerMode === "detail" ? "—" : "");
  $("#releaseBoxes").max = Math.max(1, row.unsent);
  $("#releaseBoxes").placeholder = "请输入";
}

function openReleaseDrawer(row, requestedMode) {
  activeReleaseRow = row;
  releaseDrawerMode = requestedMode === "detail" || row.status === "待审批" ? "detail" : "release";
  releaseForm.reset();
  $("#releaseContainer").textContent = row.container;
  $("#releaseDispatch").textContent = row.dispatch;
  $("#releasePallet").textContent = row.pallet;
  $("#releaseTransfer").textContent = row.transfer;
  $("#releaseUnsent").textContent = row.unsent;
  $("#releaseTitle").textContent = releaseDrawerMode === "detail" ? "放货详情" : "放货";
  populateReleaseFields(row, releaseDetailsByInventory.get(row.id));
  setReleaseFormReadonly(releaseDrawerMode === "detail");
  $("#instructionSection").hidden = releaseDrawerMode !== "detail";
  const destination = $("#releaseDestination");
  releaseOverlay.hidden = false;
  document.body.classList.add("release-open");
  renderCargoBoxRows(row);
  if (releaseDrawerMode === "detail") {
    activeInstructionStatus = "全部";
    $("#instructionNotice").hidden = true;
    renderInstructionList();
  }
  requestAnimationFrame(() => releaseDrawerMode === "detail" ? $("#releaseClose").focus() : destination.focus());
}

function closeReleaseDrawer() {
  releaseOverlay.hidden = true;
  $("#instructionCreateOverlay").hidden = true;
  $("#instructionOverlay").hidden = true;
  $("#instructionEditOverlay").hidden = true;
  $("#instructionDeleteOverlay").hidden = true;
  $("#instructionSection").hidden = true;
  feePickerContext = null;
  editingFeeContext = null;
  deletingFeeContext = null;
  resetInstructionCreateForm();
  document.body.classList.remove("release-open");
  setReleaseFormReadonly(false);
  releaseDrawerMode = "release";
  activeReleaseRow = null;
  releaseForm.reset();
  $("#uploadName").textContent = "";
}

body.addEventListener("click", (event) => {
  const button = event.target.closest(".release-button");
  if (!button) return;
  const row = inventoryRows.find((item) => item.id === Number(button.dataset.id));
  if (row) openReleaseDrawer(row, button.dataset.mode);
});
$("#releaseClose").addEventListener("click", closeReleaseDrawer);
$("#releaseCancel").addEventListener("click", closeReleaseDrawer);
releaseOverlay.addEventListener("click", (event) => {
  if (event.target === releaseOverlay) closeReleaseDrawer();
});
$("#instructionAdd").addEventListener("click", openInstructionCreate);
$("#instructionStatusTabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-instruction-status]");
  if (!button) return;
  activeInstructionStatus = button.dataset.instructionStatus;
  renderInstructionList();
});
$("#instructionCreateClose").addEventListener("click", closeInstructionCreate);
$("#instructionCreateCancel").addEventListener("click", closeInstructionCreate);
$("#instructionCreateOverlay").addEventListener("click", (event) => {
  if (event.target === $("#instructionCreateOverlay")) closeInstructionCreate();
});
$("#createInstructionType").addEventListener("change", (event) => {
  const customInput = $("#createInstructionCustomType");
  const custom = event.target.value === "自定义";
  customInput.hidden = !custom;
  customInput.disabled = !custom;
  customInput.required = custom;
  if (!custom) customInput.value = "";
  if (custom) requestAnimationFrame(() => customInput.focus());
});
$("#createInstructionCustomType").addEventListener("input", (event) => {
  event.target.setCustomValidity("");
});
document.querySelectorAll('input[name="instructionScope"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const byBox = document.querySelector('input[name="instructionScope"]:checked')?.value === "按箱";
    $("#instructionBoxField").hidden = !byBox;
    $("#createInstructionBoxError").textContent = "";
    if (!byBox) {
      document.querySelectorAll("#instructionBoxOptions input").forEach((checkbox) => { checkbox.checked = false; });
    }
  });
});
$("#instructionBoxOptions").addEventListener("change", () => {
  $("#createInstructionBoxError").textContent = "";
  $("#instructionCreateError").hidden = true;
});
$("#createInstructionAddFee").addEventListener("click", () => openInstructionPicker({ mode: "create" }));
$("#instructionCreateFeeBody").addEventListener("click", (event) => {
  const editButton = event.target.closest(".fee-edit");
  const deleteButton = event.target.closest(".fee-delete");
  if (editButton) openFeeEdit({ mode: "create" }, editButton.dataset.code);
  if (deleteButton) openFeeDelete({ mode: "create" }, deleteButton.dataset.code);
});
$("#instructionCreateForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!activeReleaseRow || releaseDrawerMode !== "detail" || isCreatingInstruction || !form.reportValidity()) return;
  const scope = document.querySelector('input[name="instructionScope"]:checked')?.value || "整票";
  const selectedBoxNos = [...document.querySelectorAll("#instructionBoxOptions input:checked")].map((checkbox) => checkbox.value);
  if (scope === "按箱" && !selectedBoxNos.length) {
    $("#createInstructionBoxError").textContent = "按箱新增时请至少选择一个关联箱号";
    $("#instructionCreateError").textContent = "请选择需要执行该指令的箱号。";
    $("#instructionCreateError").hidden = false;
    $("#instructionBoxOptions input")?.focus();
    return;
  }
  isCreatingInstruction = true;
  $("#instructionCreateSubmit").disabled = true;
  const selectedType = $("#createInstructionType").value;
  const type = selectedType === "自定义" ? $("#createInstructionCustomType").value.trim() : selectedType;
  if (!type) {
    $("#createInstructionCustomType").setCustomValidity("请输入自定义指令类型");
    $("#createInstructionCustomType").reportValidity();
    isCreatingInstruction = false;
    $("#instructionCreateSubmit").disabled = false;
    return;
  }
  const createdAt = getLocalTimestamp();
  const boxNos = scope === "按箱" ? selectedBoxNos : ["整票"];
  const newInstructions = boxNos.map((boxNo) => ({
    id: generateInstructionId(),
    boxNo,
    scope,
    type,
    description: $("#createInstructionDescription").value.trim(),
    status: "待处理",
    priority: $("#createInstructionPriority").value,
    remark: $("#createInstructionRemark").value.trim(),
    createdBy: "天朗（付豪）",
    createdAt,
    processedBy: "",
    processedAt: "",
    processMethod: "",
    fees: instructionCreateDraftFees.map((fee) => ({ ...fee }))
  }));
  instructionRecordsByInventory.set(activeReleaseRow.id, [...getActiveInstructions(), ...newInstructions]);
  newInstructions.forEach((instruction) => expandedInstructionIds.add(instruction.id));
  activeInstructionStatus = "待处理";
  $("#instructionCreateOverlay").hidden = true;
  resetInstructionCreateForm();
  renderInstructionList();
  showInstructionNotice(`已新增 ${newInstructions.length} 条待处理指令${newInstructions.length > 1 ? "，多箱已拆分为独立记录" : ""}`);
});
$("#instructionClose").addEventListener("click", closeInstructionPicker);
$("#instructionCancel").addEventListener("click", closeInstructionPicker);
$("#instructionOverlay").addEventListener("click", (event) => {
  if (event.target === $("#instructionOverlay")) closeInstructionPicker();
});
$("#instructionSearch").addEventListener("click", renderInstructionPicker);
$("#instructionReset").addEventListener("click", () => {
  $("#instructionSearchName").value = "";
  $("#instructionSearchType").value = "";
  renderInstructionPicker();
});
$("#instructionSearchName").addEventListener("keydown", (event) => {
  if (event.key === "Enter") renderInstructionPicker();
});
$("#instructionPickerBody").addEventListener("change", (event) => {
  const checkbox = event.target.closest(".instruction-pick");
  if (!checkbox || !checkbox.dataset.code) return;
  checkbox.checked ? instructionDraftCodes.add(checkbox.dataset.code) : instructionDraftCodes.delete(checkbox.dataset.code);
  renderInstructionPicker();
});
$("#instructionSelectAll").addEventListener("change", (event) => {
  const existingCodes = getExistingFeeCodesForPicker();
  const availableCodes = instructionCatalog.filter((row) => !existingCodes.has(row.code)).map((row) => row.code);
  instructionDraftCodes = event.target.checked ? new Set(availableCodes) : new Set();
  renderInstructionPicker();
});
$("#instructionConfirm").addEventListener("click", () => {
  if (!activeReleaseRow || !feePickerContext) return;
  const targetContext = { ...feePickerContext };
  const currentRows = getFeeRowsForContext(targetContext);
  const currentByCode = new Map(currentRows.map((row) => [row.code, row]));
  const selectedRows = instructionCatalog
    .filter((row) => instructionDraftCodes.has(row.code))
    .map((row) => currentByCode.get(row.code) || makeFeeRow(row));
  const rows = targetContext.mode === "create"
    ? selectedRows
    : [...currentRows, ...selectedRows.filter((row) => !currentByCode.has(row.code))];
  setFeeRowsForContext(targetContext, rows);
  closeInstructionPicker();
  if (targetContext.mode === "record" && selectedRows.length) {
    showInstructionNotice(`已为指令 ${targetContext.instructionId} 新增 ${selectedRows.length} 条费用`);
  }
});

$("#instructionBody").addEventListener("click", (event) => {
  const toggleButton = event.target.closest(".instruction-fee-toggle");
  const addButton = event.target.closest(".instruction-fee-add");
  const editButton = event.target.closest(".fee-edit");
  const deleteButton = event.target.closest(".fee-delete");
  if (toggleButton) {
    const instructionId = toggleButton.dataset.instructionId;
    expandedInstructionIds.has(instructionId) ? expandedInstructionIds.delete(instructionId) : expandedInstructionIds.add(instructionId);
    renderInstructionList();
    return;
  }
  if (addButton) {
    openInstructionPicker({ mode: "record", instructionId: addButton.dataset.instructionId });
    return;
  }
  if (editButton) {
    openFeeEdit({ mode: "record", instructionId: editButton.dataset.instructionId }, editButton.dataset.code);
    return;
  }
  if (deleteButton) {
    openFeeDelete({ mode: "record", instructionId: deleteButton.dataset.instructionId }, deleteButton.dataset.code);
  }
});

$("#instructionEditCancel").addEventListener("click", () => {
  $("#instructionEditOverlay").hidden = true;
  editingFeeContext = null;
});
$("#instructionEditForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeReleaseRow || !editingFeeContext || !event.currentTarget.reportValidity()) return;
  const context = { ...editingFeeContext };
  const rows = getFeeRowsForContext(context).map((row) => row.code === context.code ? {
    ...row,
    type: $("#editInstructionType").value,
    unit: $("#editInstructionUnit").value,
    price: $("#editInstructionPrice").value,
    quantity: $("#editInstructionQuantity").value,
    currency: $("#editInstructionCurrency").value,
    description: $("#editInstructionDescription").value.trim()
  } : row);
  setFeeRowsForContext(context, rows);
  $("#instructionEditOverlay").hidden = true;
  editingFeeContext = null;
});
$("#instructionDeleteCancel").addEventListener("click", () => {
  $("#instructionDeleteOverlay").hidden = true;
  deletingFeeContext = null;
});
$("#instructionDeleteConfirm").addEventListener("click", () => {
  if (!activeReleaseRow || !deletingFeeContext) return;
  const context = { ...deletingFeeContext };
  setFeeRowsForContext(context, getFeeRowsForContext(context).filter((row) => row.code !== context.code));
  $("#instructionDeleteOverlay").hidden = true;
  deletingFeeContext = null;
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!$("#instructionEditOverlay").hidden) {
    $("#instructionEditOverlay").hidden = true;
    editingFeeContext = null;
  } else if (!$("#instructionDeleteOverlay").hidden) {
    $("#instructionDeleteOverlay").hidden = true;
    deletingFeeContext = null;
  } else if (!$("#instructionOverlay").hidden) {
    closeInstructionPicker();
  } else if (!$("#instructionCreateOverlay").hidden) {
    closeInstructionCreate();
  } else if (!releaseOverlay.hidden) {
    closeReleaseDrawer();
  }
});
$("#uploadButton").addEventListener("click", () => $("#releaseFile").click());
$("#releaseFile").addEventListener("change", (event) => {
  $("#uploadName").textContent = event.target.files[0]?.name || "";
});
releaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (releaseDrawerMode !== "release" || !activeReleaseRow || !releaseForm.reportValidity()) return;
  const boxes = Number($("#releaseBoxes").value);
  if (boxes > activeReleaseRow.unsent) {
    $("#releaseBoxes").setCustomValidity(`箱数不能超过未发货箱数 ${activeReleaseRow.unsent}`);
    $("#releaseBoxes").reportValidity();
    return;
  }
  $("#releaseBoxes").setCustomValidity("");
  const submittedRow = activeReleaseRow;
  const previousStatus = submittedRow.status;
  releaseDetailsByInventory.set(submittedRow.id, {
    application: document.querySelector('input[name="application"]:checked')?.value || "FBA",
    destination: $("#releaseDestination").value,
    shipment: $("#releaseShipment").value.trim(),
    method: $("#releaseMethod").value,
    reference: $("#releaseReference").value.trim(),
    boxes: String(boxes),
    date: $("#releaseDate").value,
    remark: $("#releaseRemark").value.trim(),
    attachment: $("#releaseFile").files[0]?.name || ""
  });
  submittedRow.status = "待审批";
  submittedRow.pending = boxes;
  selected.delete(submittedRow.id);
  if (previousStatus === "暂存") {
    statusCounts["暂存"] = Math.max(0, statusCounts["暂存"] - 1);
    statusCounts["待审批"] += 1;
  }
  closeReleaseDrawer();
  document.querySelector('.status-tab[data-status="待审批"]').click();
});
$("#releaseBoxes").addEventListener("input", () => $("#releaseBoxes").setCustomValidity(""));

function buildWatermarks() {
  const layer = $("#watermarks");
  const fragment = document.createDocumentFragment();
  const width = window.innerWidth;
  const height = window.innerHeight;
  for (let y = 34; y < height + 80; y += 82) {
    for (let x = -35; x < width + 150; x += 195) {
      const mark = document.createElement("span");
      mark.className = "watermark";
      mark.textContent = "admin2026-07-22";
      mark.style.left = `${x + ((y / 82) % 2) * 72}px`;
      mark.style.top = `${y}px`;
      fragment.appendChild(mark);
    }
  }
  layer.replaceChildren(fragment);
}
let watermarkTimer;
window.addEventListener("resize", () => {
  clearTimeout(watermarkTimer);
  watermarkTimer = setTimeout(buildWatermarks, 120);
});
applyFilters();
buildWatermarks();
