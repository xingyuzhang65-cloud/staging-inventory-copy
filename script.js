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
  ["TTTX","AAAA0000000","AAAA0000000-2411...","2","是","拆转","ABE8","Truck-Amazon","AAAA0000000-241109-ABE8-5","2024-11-05 15:18:21",61.8,4.436,4,0,3,1,"暂存"]
];
const inventoryRows = rawRows.map((r, index) => ({
  id: index + 1, customer: r[0], container: r[1], system: r[2], inbound: r[3],
  blocked: r[4], transfer: r[5], destination: r[6], dispatch: r[7], pallet: r[8],
  time: r[9], weight: r[10], volume: r[11], boxes: r[12], pending: r[13],
  unsent: r[14], sent: r[15], status: r[16]
}));
const approvalRows = [{
  id: 1,
  customer: "TTTX",
  applicationNo: "",
  container: "CCCA1414141",
  system: "/",
  inbound: "111",
  blocked: "",
  applicationType: "FBA仓库",
  shipmentId: "1",
  referenceId: "1",
  transfer: "拆转",
  destination: "ABE3",
  dispatch: "Truck-Amazon",
  pallet: "CCCA1414141-240411-111-1",
  inboundTime: "",
  appliedBoxes: 1,
  appliedVolume: 0,
  chargedPallets: "",
  approvalStage: "待仓库审批",
  status: "待审批"
}];
const instructionPendingRows = [{
  id: 1,
  customer: "23",
  applicationNo: "20260722001",
  container: "8889990",
  system: "8889990-250623",
  inbound: "88",
  blocked: "是",
  applicationType: "FBA仓库",
  shipmentId: "1237454",
  referenceId: "134354",
  transfer: "拆转",
  dispatch: "Truck-Amazon",
  pallet: "8889990-250623-88-6",
  inboundTime: "2025-07-11 15:29:34",
  appliedBoxes: 1,
  appliedVolume: 0.4,
  chargedPallets: "",
  status: "指令待处理"
}];
const instructionProcessingRows = instructionPendingRows.map((row) => ({ ...row, status: "指令处理中" }));
const outboundSeedRows = [
  { customer: "23", applicationNo: "20260722009", container: "8889990", system: "8889990-250623", inbound: "88", blocked: "是", applicationType: "FBA仓库", shipmentId: "111111", referenceId: "1111111111", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "8889990-250623-88-9", inboundTime: "2025-07-11 15:29:34", appliedBoxes: 1, appliedVolume: 0.4, chargedPallets: "" },
  { customer: "23", applicationNo: "20260722008", container: "8889990", system: "8889990-250623", inbound: "88", blocked: "是", applicationType: "FBA仓库", shipmentId: "11111", referenceId: "1111", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "8889990-250623-88-9", inboundTime: "2025-07-11 15:29:34", appliedBoxes: 1, appliedVolume: 0.4, chargedPallets: "" },
  { customer: "TTTX2", applicationNo: "20260715002", container: "WEMA1131231", system: "/", inbound: "2", blocked: "是", applicationType: "其他地址", shipmentId: "", referenceId: "", transfer: "拆转", dispatch: "USPS", pallet: "2-ABE2-1", inboundTime: "2024-04-23 15:22:43", appliedBoxes: 2, appliedVolume: 0.182, chargedPallets: "" },
  { customer: "23", applicationNo: "20260512001", container: "8889990", system: "8889990-250623", inbound: "88", blocked: "是", applicationType: "FBA仓库", shipmentId: "1", referenceId: "1", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "8889990-250623-88-6", inboundTime: "2025-07-11 15:29:34", appliedBoxes: 1, appliedVolume: 0.4, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260508008", container: "AAAA1234588", system: "AAAA1234588-2409...", inbound: "", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA19C9LZ2R8", referenceId: "FBA19C9LZ2R8", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "AAAA1234588-240929-USPS-1", inboundTime: "2024-11-11 15:35:24", appliedBoxes: 3, appliedVolume: 3, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260508007", container: "AAAA1234588", system: "AAAA1234588-2409...", inbound: "", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA19C8QWJY8", referenceId: "FBA19C8QWJY8", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "AAAA1234588-240929-USPS-1", inboundTime: "2024-11-11 15:35:24", appliedBoxes: 5, appliedVolume: 5, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260508006", container: "AAAA1234588", system: "AAAA1234588-2409...", inbound: "", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA19BWNJY55", referenceId: "FBA19BWNJY55", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "AAAA1234588-240929-USPS-1", inboundTime: "2024-11-11 15:35:24", appliedBoxes: 3, appliedVolume: 3, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260415003", container: "AAAA0000000", system: "AAAA0000000-2411...", inbound: "", blocked: "是", applicationType: "其他地址", shipmentId: "", referenceId: "", transfer: "拆转", dispatch: "USPS", pallet: "AAAA0000000-241109-FEDEX-1", inboundTime: "2024-11-05 15:18:21", appliedBoxes: 1, appliedVolume: 0.075, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260415002", container: "AAAA0000000", system: "AAAA0000000-2411...", inbound: "", blocked: "是", applicationType: "其他地址", shipmentId: "", referenceId: "", transfer: "拆转", dispatch: "USPS", pallet: "AAAA0000000-241109-FEDEX-1", inboundTime: "2024-11-05 15:18:21", appliedBoxes: 1, appliedVolume: 0.075, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260411001", container: "AAAA0000000", system: "AAAA0000000-2411...", inbound: "", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA199X7633H", referenceId: "FBA199X7633H", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "AAAA0000000-241109-ABE8-5", inboundTime: "2024-11-05 15:18:21", appliedBoxes: 1, appliedVolume: 1.109, chargedPallets: "" },
  { customer: "23", applicationNo: "20260409003", container: "8889990", system: "8889990-250623", inbound: "", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA323N235Y8", referenceId: "FBA323N235Y8", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "8889990-250623-BWI9-10", inboundTime: "2025-07-11 15:29:34", appliedBoxes: 5, appliedVolume: 3.8, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20260407001", container: "ABCD1234567", system: "ABCD1234567-2410...", inbound: "1", blocked: "是", applicationType: "FBA仓库", shipmentId: "FBA12345678990", referenceId: "FBA12345678990", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "ABCD1234567-241018-ABE3-1", inboundTime: "2024-10-16 14:22:38", appliedBoxes: 1, appliedVolume: 0.1, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20250925086", container: "BPAI9461644", system: "BPAI9461644-240330", inbound: "BBA9461", blocked: "", applicationType: "FBA仓库", shipmentId: "41414", referenceId: "1414141", transfer: "拆转", dispatch: "Truck-Amazon", pallet: "BPAI9461644-240330-BBA9461-24", inboundTime: "", appliedBoxes: 2, appliedVolume: 0.87, chargedPallets: "" },
  { customer: "TTTX", applicationNo: "20250925085", container: "BPAI9461644", system: "BPAI9461644-240330", inbound: "BBA9461", blocked: "", applicationType: "FBA仓库", shipmentId: "41414", referenceId: "1414141", transfer: "拆转", dispatch: "Truck-Walmart", pallet: "BPAI9461644-240330-BBA9461-24", inboundTime: "", appliedBoxes: 1, appliedVolume: 0.44, chargedPallets: "" }
];
const outboundRows = Array.from({ length: 95 }, (_, index) => {
  const seed = outboundSeedRows[index % outboundSeedRows.length];
  return {
    ...seed,
    id: index + 1,
    applicationNo: index < outboundSeedRows.length ? seed.applicationNo : `2025${String(9200000 - index).padStart(8, "0")}`,
    status: "待出库"
  };
});
const shippedRows = outboundRows.slice(0, 30).map((row) => ({ ...row, status: "已出库" }));
const rejectedRows = outboundRows.slice(0, 36).map((row) => ({ ...row, status: "审批拒绝" }));
const instructionCatalog = [
  { code: "FY202509260001", name: "仓储渠道-免仓30天", type: "仓储费", unit: "票", price: "3", currency: "人民币", description: "提柜入仓当天起算" },
  { code: "FY202509260002", name: "仓储渠道-31-90天", type: "仓储费", unit: "票", price: "4", currency: "人民币", description: "按1级单价收取" },
  { code: "FY202509260003", name: "仓储渠道-90天以上", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按2级单价收取" },
  { code: "FY202509260004", name: "拦截-免仓7天", type: "仓储费", unit: "票", price: "4", currency: "人民币", description: "提柜入仓当天起算" },
  { code: "FY202509260005", name: "拦截-免仓8-90天", type: "仓储费", unit: "票", price: "3", currency: "人民币", description: "按1级单价收取" },
  { code: "FY202509260006", name: "拦截-免仓90天以上", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按2级单价收取" },
  { code: "FY202509260007", name: "扣货-无免仓期", type: "仓储费", unit: "票", price: "2", currency: "人民币", description: "按1级单价收取" }
];
const instructionRowsByInventory = new Map();
let instructionDraftCodes = new Set(instructionCatalog.slice(0, 3).map((row) => row.code));
let editingInstructionCode = "";
let deletingInstructionCode = "";
const selected = new Set();
let activeStatus = "待审批";
let visibleRows = [...approvalRows];

const $ = (selector) => document.querySelector(selector);
const body = $("#inventoryBody");
const head = $("#inventoryHead");
const footer = $("#tableFooter");
let selectAll = null;
const filters = {
  keyword: $("#keywordFilter"), customer: $("#customerFilter"), request: $("#requestFilter"), inbound: $("#inboundFilter"),
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
addOptions(filters.customer, [...inventoryRows, ...approvalRows, ...instructionPendingRows, ...outboundRows].map((row) => row.customer));
addOptions(filters.fba, inventoryRows.map((row) => row.destination));
addOptions(filters.dispatch, inventoryRows.map((row) => row.dispatch));
addOptions(filters.location, ["A01-01", "A02-03", "B01-07"]);

function isApprovalView() {
  return activeStatus === "待审批";
}

function isInstructionView() {
  return activeStatus === "指令待处理" || activeStatus === "指令处理中";
}

function isOutboundView() {
  return activeStatus === "待出库" || activeStatus === "已出库";
}

function isShippedView() {
  return activeStatus === "已出库";
}

function isRejectedView() {
  return activeStatus === "审批拒绝";
}

function getOutboundViewRows() {
  return isShippedView() ? shippedRows : outboundRows;
}

function isRequestTableView() {
  return isApprovalView() || isInstructionView() || isOutboundView() || isRejectedView();
}

function getInstructionViewRows() {
  return activeStatus === "指令待处理" ? instructionPendingRows : instructionProcessingRows;
}

function getActiveStatusRows() {
  if (isApprovalView()) return approvalRows;
  if (isInstructionView()) return getInstructionViewRows();
  if (isOutboundView()) return getOutboundViewRows();
  if (isRejectedView()) return rejectedRows;
  return inventoryRows;
}

function renderTableChrome() {
  const requestTable = isRequestTableView();
  document.body.classList.toggle("request-view", requestTable);
  document.body.classList.toggle("approval-view", isApprovalView());
  document.body.classList.toggle("instruction-view", isInstructionView());
  document.body.classList.toggle("outbound-view", isOutboundView());
  document.body.classList.toggle("rejection-view", isRejectedView());
  document.querySelector(".inventory-table").classList.toggle("approval-table", requestTable);
  $("#contextAction").textContent = isApprovalView() ? "批量初审" : isInstructionView() ? "开始处理" : isOutboundView() ? "放货托盘标签导出" : "更换库位";
  $("#contextAction").hidden = isRejectedView();
  $("#countdownAction").hidden = !isInstructionView();
  $("#approvalDensityButton").hidden = isRejectedView();

  head.innerHTML = requestTable ? `<tr>
    <th class="index-col">#</th><th class="check-col"><input id="selectAll" type="checkbox" /></th>
    <th class="sortable">客户名称</th><th>申请单号</th><th>柜号</th><th>系统柜号</th><th>入仓号</th><th>是否拦截</th>
    <th>申请类型</th><th>Shipment ID</th><th>Reference ID</th><th>转运方式</th><th>派送方式</th><th>托盘标签</th>
    <th class="sortable">入库时间</th><th class="sortable">申请箱数</th><th>申请箱数总体积</th><th>收费托数</th><th class="operation-col">操作</th>
  </tr>` : `<tr>
    <th class="index-col">#</th><th class="check-col"><input id="selectAll" type="checkbox" /></th>
    <th class="sortable">客户名称</th><th>柜号</th><th>系统柜号</th><th>入仓号</th><th>是否拦截</th>
    <th>转运方式</th><th>目的地</th><th>派送方式</th><th>托盘标签</th><th class="sortable">入库时间</th>
    <th class="sortable">重量</th><th class="sortable">体积</th><th class="sortable">总箱数</th>
    <th class="sortable">待审核箱数</th><th class="sortable">未发货箱数</th><th class="sortable">已发货箱数</th><th class="operation-col">操作</th>
  </tr>`;

  const requestTotal = getActiveStatusRows().filter((row) => row.status === activeStatus).length;
  footer.innerHTML = requestTable
    ? `<span>共 ${requestTotal} 条</span><button>‹</button><button class="active">1</button><button>›</button><select><option>100 条/页</option></select>`
    : '<span>共 273 条</span><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>›</button><select><option>50 条/页</option></select>';

  selectAll = $("#selectAll");
  selectAll.addEventListener("change", () => {
    visibleRows.forEach((row) => selectAll.checked ? selected.add(row.id) : selected.delete(row.id));
    renderRows();
  });
}

function renderRows() {
  renderTableChrome();
  if (!visibleRows.length) {
    body.innerHTML = '<tr><td class="empty-row" colspan="19">暂无匹配库存记录</td></tr>';
    selectAll.checked = false;
    updateSummary();
    return;
  }
  body.innerHTML = isRequestTableView() ? visibleRows.map((row) => `
    <tr class="${isOutboundView() && row.id === 2 ? "row-highlighted" : ""}">
      <td class="index-col">${row.id}</td>
      <td class="check-col"><input class="row-check" type="checkbox" data-id="${row.id}" ${selected.has(row.id) ? "checked" : ""}></td>
      <td title="${row.customer}">${row.customer}</td>
      <td title="${row.applicationNo}">${row.applicationNo}</td>
      <td title="${row.container}">${row.container}</td>
      <td>${row.system}</td><td>${row.inbound}</td><td class="${row.blocked === "是" ? "blocked" : ""}">${row.blocked === "是" ? "拦截" : row.blocked}</td>
      <td>${row.applicationType}</td><td>${row.shipmentId}</td><td>${row.referenceId}</td>
      <td>${row.transfer}</td><td>${row.dispatch}</td><td title="${row.pallet}">${row.pallet}</td>
      <td>${row.inboundTime}</td><td>${row.appliedBoxes}</td><td>${row.appliedVolume}</td><td>${row.chargedPallets}</td>
      <td class="operation-col approval-actions">${isRejectedView()
        ? `<button class="action-link detail-button" data-id="${row.id}">详情</button>`
        : isOutboundView()
          ? `<button class="action-link receivable-button">应收费用</button><button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link log-button">日志</button>`
          : isInstructionView()
            ? `<button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link log-button">日志</button>`
            : `<button class="action-link review-button">审核申请</button><button class="action-link detail-button" data-id="${row.id}">详情</button>`}</td>
    </tr>`).join("") : visibleRows.map((row) => `
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
      <td class="operation-col"><button class="action-link release-button" data-id="${row.id}">放货</button><button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link">日志</button></td>
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
  if (isRequestTableView()) return;
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
  const sourceRows = getActiveStatusRows();
  visibleRows = sourceRows.filter((row) => {
    const haystack = [row.customer, row.container, row.system, row.inbound, row.pallet].join(" ").toLowerCase();
    return row.status === activeStatus
      && (!keyword || haystack.includes(keyword))
      && (!filters.customer.value || row.customer === filters.customer.value)
      && (!filters.request.value || (row.applicationNo || "").toLowerCase().includes(filters.request.value.trim().toLowerCase()))
      && (!inboundTerms.length || inboundTerms.includes(row.inbound))
      && (!filters.transfer.value || row.transfer === filters.transfer.value)
      && (!filters.fba.value || row.destination === filters.fba.value)
      && (!filters.dispatch.value || row.dispatch === filters.dispatch.value)
      && (!filters.container.value || row.container.toLowerCase().includes(filters.container.value.trim().toLowerCase()))
      && (!filters.pallet.value || row.pallet.toLowerCase().includes(filters.pallet.value.trim().toLowerCase()))
      && (!filters.blocked.value || row.blocked === filters.blocked.value);
  });
  renderRows();
}
$("#searchButton").addEventListener("click", applyFilters);
$("#resetButton").addEventListener("click", () => {
  Object.values(filters).forEach((control) => { control.value = ""; });
  $("#dateFrom").value = ""; $("#dateTo").value = "";
  visibleRows = getActiveStatusRows().filter((row) => row.status === activeStatus);
  renderRows();
});
Object.values(filters).forEach((control) => {
  control.addEventListener("keydown", (event) => { if (event.key === "Enter") applyFilters(); });
});
document.querySelectorAll(".status-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".status-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeStatus = tab.dataset.status;
    selected.clear();
    $("#filterCard").classList.toggle("approval-filter", isRequestTableView());
    $("#filterCard").classList.remove("approval-expanded", "collapsed");
    $("#collapseButton").innerHTML = isRequestTableView() ? "<span>⌄</span> 展开" : "<span>⌃</span> 收起";
    applyFilters();
  });
});
$("#collapseButton").addEventListener("click", () => {
  const card = $("#filterCard");
  if (isRequestTableView()) {
    const expanded = card.classList.toggle("approval-expanded");
    $("#collapseButton").innerHTML = expanded ? "<span>⌃</span> 收起" : "<span>⌄</span> 展开";
    return;
  }
  const collapsed = card.classList.toggle("collapsed");
  $("#collapseButton").innerHTML = collapsed ? "<span>⌄</span> 展开" : "<span>⌃</span> 收起";
});
$("#densityButton").addEventListener("click", () => {
  document.querySelector(".inventory-card").classList.toggle("compact");
});
$("#approvalDensityButton").addEventListener("click", () => {
  document.querySelector(".inventory-card").classList.toggle("compact");
});
document.querySelectorAll(".approval-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".approval-tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    const stage = tab.textContent.startsWith("待初审") ? "待初审" : tab.textContent.startsWith("待仓库审批") ? "待仓库审批" : "全部";
    visibleRows = stage === "全部" ? [...approvalRows] : approvalRows.filter((row) => row.approvalStage === stage);
    selected.clear();
    renderRows();
  });
});
$(".menu-toggle").addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});
$("#exportButton").addEventListener("click", () => {
  const header = isRequestTableView()
    ? ["客户名称","申请单号","柜号","系统柜号","入仓号","是否拦截","申请类型","Shipment ID","Reference ID","转运方式","派送方式","托盘标签","入库时间","申请箱数","申请箱数总体积","收费托数"]
    : ["客户名称","柜号","系统柜号","入仓号","是否拦截","转运方式","目的地","派送方式","托盘标签","入库时间","重量","体积","总箱数","待审核箱数","未发货箱数","已发货箱数"];
  const lines = [header, ...visibleRows.map((r) => isRequestTableView()
    ? [r.customer,r.applicationNo,r.container,r.system,r.inbound,r.blocked,r.applicationType,r.shipmentId,r.referenceId,r.transfer,r.dispatch,r.pallet,r.inboundTime,r.appliedBoxes,r.appliedVolume,r.chargedPallets]
    : [r.customer,r.container,r.system,r.inbound,r.blocked,r.transfer,r.destination,r.dispatch,r.pallet,r.time,r.weight,r.volume,r.boxes,r.pending,r.unsent,r.sent])];
  const csv = "\ufeff" + lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = isApprovalView() ? "待审批.csv" : isInstructionView() ? "指令处理.csv" : isShippedView() ? "已出库.csv" : isOutboundView() ? "待出库.csv" : isRejectedView() ? "审批拒绝.csv" : "暂存库存.csv";
  link.click();
  URL.revokeObjectURL(url);
});

const approvalReviewOverlay = $("#approvalReviewOverlay");
const approvalReviewBody = $("#approvalReviewBody");
let activeApprovalReviewRow = null;
let approvalReviewStatus = "pending";
let approvalReviewDecision = "";

function updateApprovalReviewTabCounts() {
  const counts = {
    pending: approvalReviewDecision ? 0 : 1,
    passed: approvalReviewDecision === "passed" ? 1 : 0,
    rejected: approvalReviewDecision === "rejected" ? 1 : 0,
    first: 0
  };
  const labels = { pending: "待审核", passed: "已通过", rejected: "已拒绝", first: "初审" };
  document.querySelectorAll("#approvalReviewTabs button").forEach((tab) => {
    tab.textContent = `${labels[tab.dataset.reviewStatus]}(${counts[tab.dataset.reviewStatus]})`;
  });
}

function renderApprovalReviewRows() {
  const shouldShow = approvalReviewStatus === "pending"
    ? !approvalReviewDecision
    : approvalReviewStatus === approvalReviewDecision;
  if (!shouldShow || approvalReviewStatus === "first") {
    approvalReviewBody.innerHTML = '<tr class="approval-review-empty"><td colspan="12">暂无数据</td></tr>';
    return;
  }
  approvalReviewBody.innerHTML = `<tr>
    <td class="review-check"><input class="approval-review-check" type="checkbox" /></td><td class="review-index">1</td>
    <td>Truck-Amazon</td><td>ABE3</td><td>1</td><td>2024-04-11 10:53:20</td><td>2024-04-04 10:32:05</td>
    <td></td><td></td><td>1</td><td class="review-marker"></td>
    <td class="review-operation">${approvalReviewStatus === "pending"
      ? '<button class="review-pass" type="button">通过</button><button class="review-reject" type="button">拒绝</button><button class="review-log" type="button">日志</button>'
      : '<button class="review-log" type="button">日志</button>'}</td>
  </tr>`;
  $("#approvalReviewSelectAll").checked = false;
}

function setApprovalReviewStatus(status) {
  approvalReviewStatus = status;
  document.querySelectorAll("#approvalReviewTabs button").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.reviewStatus === status);
  });
  renderApprovalReviewRows();
}

function openApprovalReview(row) {
  activeApprovalReviewRow = row;
  approvalReviewStatus = "pending";
  approvalReviewDecision = "";
  $("#approvalInfoContainer").textContent = row.container || "-";
  $("#approvalInfoPallet").textContent = row.pallet || "-";
  $("#approvalInfoDispatch").textContent = row.dispatch || "-";
  $("#approvalInfoCustomer").textContent = row.customer || "-";
  $("#approvalInfoLocation").textContent = "-";
  updateApprovalReviewTabCounts();
  setApprovalReviewStatus("pending");
  approvalReviewOverlay.hidden = false;
  document.body.classList.add("approval-review-open");
}

function closeApprovalReview() {
  approvalReviewOverlay.hidden = true;
  document.body.classList.remove("approval-review-open");
  activeApprovalReviewRow = null;
}

body.addEventListener("click", (event) => {
  const button = event.target.closest(".review-button");
  if (!button) return;
  const row = approvalRows[0];
  if (row) openApprovalReview(row);
});
$("#approvalReviewTabs").addEventListener("click", (event) => {
  const tab = event.target.closest("button[data-review-status]");
  if (tab) setApprovalReviewStatus(tab.dataset.reviewStatus);
});
approvalReviewBody.addEventListener("click", (event) => {
  if (event.target.closest(".review-pass")) {
    approvalReviewDecision = "passed";
    updateApprovalReviewTabCounts();
    setApprovalReviewStatus("passed");
  } else if (event.target.closest(".review-reject")) {
    approvalReviewDecision = "rejected";
    updateApprovalReviewTabCounts();
    setApprovalReviewStatus("rejected");
  }
});
$("#approvalReviewSelectAll").addEventListener("change", (event) => {
  document.querySelectorAll(".approval-review-check").forEach((checkbox) => {
    checkbox.checked = event.target.checked;
  });
});
$("#approvalReviewClose").addEventListener("click", closeApprovalReview);
$("#approvalToolbarCancel").addEventListener("click", closeApprovalReview);
$("#approvalReviewCancel").addEventListener("click", closeApprovalReview);
$("#approvalReviewConfirm").addEventListener("click", closeApprovalReview);
approvalReviewOverlay.addEventListener("click", (event) => {
  if (event.target === approvalReviewOverlay) closeApprovalReview();
});

function getCargoBoxRows(row) {
  if (row.id === 1 && row.status === "暂存") {
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

function getActiveInstructionRows() {
  if (!activeReleaseRow) return [];
  return instructionRowsByInventory.get(activeReleaseRow.id) || [];
}

function renderInstructionList() {
  const target = $("#instructionBody");
  const rows = getActiveInstructionRows();
  const instructionEditable = instructionEditableStatuses.has(activeReleaseStatus);
  if (!rows.length) {
    target.innerHTML = '<tr class="instruction-empty"><td colspan="11"><i>▤</i>暂无数据</td></tr>';
    return;
  }
  target.innerHTML = rows.map((row) => {
    const total = Number(row.price || 0) * Number(row.quantity || 1);
    return `<tr>
      <td>${row.name}</td><td>${row.type}</td><td>${row.unit}</td><td>${row.price}</td><td>${row.quantity || "1"}</td>
      <td>${row.currency}</td><td>${Number(total.toFixed(2))}</td><td>${row.addedAt}</td><td>${row.addedBy}</td>
      <td>${row.description}</td><td>${instructionEditable ? `<button class="instruction-edit" data-code="${row.code}" type="button">编辑</button><button class="instruction-delete" data-code="${row.code}" type="button">删除</button>` : "-"}</td>
    </tr>`;
  }).join("");
}

function getFilteredInstructionCatalog() {
  const keyword = $("#instructionSearchName").value.trim().toLowerCase();
  const type = $("#instructionSearchType").value;
  return instructionCatalog.filter((row) =>
    (!keyword || `${row.code} ${row.name}`.toLowerCase().includes(keyword))
    && (!type || row.type === type)
  );
}

function renderInstructionPicker() {
  const rows = getFilteredInstructionCatalog();
  const displayRows = [...rows, ...Array(Math.max(0, 18 - rows.length)).fill(null)].slice(0, 18);
  $("#instructionPickerBody").innerHTML = displayRows.map((row) => `<tr>
    <td><input class="instruction-pick" type="checkbox" ${row ? `data-code="${row.code}"` : "disabled"} ${row && instructionDraftCodes.has(row.code) ? "checked" : ""} /></td>
    <td>${row?.code || ""}</td><td>${row?.name || ""}</td><td>${row?.type || ""}</td><td>${row?.unit || ""}</td>
    <td>${row?.price || ""}</td><td>${row?.currency || ""}</td><td>${row?.description || ""}</td>
  </tr>`).join("");
  $("#instructionSelectAll").checked = instructionDraftCodes.size === instructionCatalog.length;
  $("#instructionSelectedCount").textContent = `已选中${instructionDraftCodes.size}条`;
}

function openInstructionPicker() {
  const existing = getActiveInstructionRows();
  instructionDraftCodes = new Set(existing.length ? existing.map((row) => row.code) : instructionCatalog.slice(0, 3).map((row) => row.code));
  $("#instructionSearchName").value = "";
  $("#instructionSearchType").value = "";
  $("#instructionOverlay").hidden = false;
  renderInstructionPicker();
}

function closeInstructionPicker() {
  $("#instructionOverlay").hidden = true;
}

const releaseOverlay = $("#releaseOverlay");
const releaseForm = $("#releaseForm");
let activeReleaseRow = null;
let activeReleaseReadOnly = false;
let activeReleaseStatus = "暂存";
const instructionEditableStatuses = new Set(["暂存", "待审批", "指令待处理", "指令处理中"]);

function normalizeReleaseRow(row) {
  const pallet = row.pallet || "-";
  const palletDestination = ["ABE2", "ABE3", "ABE8", "BWI9", "FEDEX"].find((code) => pallet.includes(code));
  const boxes = Number(row.unsent ?? row.appliedBoxes ?? row.boxes ?? 0);
  return {
    ...row,
    customer: row.customer || "-",
    container: row.container || "-",
    system: row.system || "/",
    inbound: row.inbound || "-",
    blocked: row.blocked || "否",
    transfer: row.transfer || "拆转",
    destination: row.destination || palletDestination || (row.applicationType === "其他地址" ? "FEDEX" : "ABE2"),
    dispatch: row.dispatch || "Truck-Amazon",
    pallet,
    time: row.time || row.inboundTime || "",
    weight: Number(row.weight || 0),
    volume: Number(row.volume ?? row.appliedVolume ?? 0),
    boxes,
    pending: Number(row.pending || 0),
    unsent: boxes,
    sent: Number(row.sent || 0),
    shipmentId: row.shipmentId || "",
    referenceId: row.referenceId || ""
  };
}

function setReleaseDrawerMode(readOnly, status) {
  activeReleaseReadOnly = readOnly;
  activeReleaseStatus = status;
  document.querySelectorAll("#releaseForm > .release-fields input, #releaseForm > .release-fields select, #releaseForm > .release-fields button").forEach((control) => {
    control.disabled = readOnly;
  });
  $("#releaseConfirm").hidden = readOnly;
  $("#releaseCancel").textContent = readOnly ? "关闭" : "取消";
  const instructionEditable = instructionEditableStatuses.has(status);
  $("#instructionAdd").hidden = !instructionEditable;
  releaseForm.classList.toggle("release-readonly", readOnly);
}

function openReleaseDrawer(sourceRow, options = {}) {
  const row = normalizeReleaseRow(sourceRow);
  const readOnly = Boolean(options.readOnly);
  const sourceStatus = options.status || activeStatus;
  activeReleaseRow = row;
  releaseForm.reset();
  $("#releaseContainer").textContent = row.container;
  $("#releaseDispatch").textContent = row.dispatch;
  $("#releasePallet").textContent = row.pallet;
  $("#releaseTransfer").textContent = row.transfer;
  $("#releaseUnsent").textContent = row.unsent;
  $("#releaseBoxes").max = Math.max(1, row.unsent);
  $("#releaseBoxes").placeholder = "请输入";
  $("#releaseBoxes").setCustomValidity("");
  $("#releaseMethod").value = [...$("#releaseMethod").options].some((option) => option.value === row.dispatch) ? row.dispatch : "Truck-Amazon";
  const destination = $("#releaseDestination");
  destination.value = [...destination.options].some((option) => option.value === row.destination) ? row.destination : "";
  $("#releaseShipment").value = row.shipmentId;
  $("#releaseReference").value = row.referenceId;
  $("#releaseBoxes").value = readOnly ? String(Math.max(0, row.unsent)) : "";
  $("#releaseDate").value = (row.scheduledShippingTime || row.time || "").slice(0, 10);
  $("#releaseRemark").value = row.customerRemark || "";
  $("#uploadName").textContent = "";
  setReleaseDrawerMode(readOnly, sourceStatus);
  releaseOverlay.hidden = false;
  document.body.classList.add("release-open");
  renderCargoBoxRows(row);
  renderInstructionList();
  if (!readOnly) requestAnimationFrame(() => destination.focus());
}

function closeReleaseDrawer() {
  releaseOverlay.hidden = true;
  $("#instructionOverlay").hidden = true;
  $("#instructionEditOverlay").hidden = true;
  $("#instructionDeleteOverlay").hidden = true;
  document.body.classList.remove("release-open");
  activeReleaseRow = null;
  activeReleaseReadOnly = false;
  activeReleaseStatus = "暂存";
  releaseForm.reset();
  $("#uploadName").textContent = "";
}

body.addEventListener("click", (event) => {
  const detailButton = event.target.closest(".detail-button");
  if (!detailButton) return;
  const row = visibleRows.find((item) => item.id === Number(detailButton.dataset.id));
  if (row) openReleaseDrawer(row, { readOnly: true, status: activeStatus });
});
body.addEventListener("click", (event) => {
  const button = event.target.closest(".release-button");
  if (!button) return;
  const row = inventoryRows.find((item) => item.id === Number(button.dataset.id));
  if (row) openReleaseDrawer(row, { readOnly: false, status: "暂存" });
});
$("#releaseClose").addEventListener("click", closeReleaseDrawer);
$("#releaseCancel").addEventListener("click", closeReleaseDrawer);
releaseOverlay.addEventListener("click", (event) => {
  if (event.target === releaseOverlay) closeReleaseDrawer();
});
$("#instructionAdd").addEventListener("click", openInstructionPicker);
$("#instructionClose").addEventListener("click", closeInstructionPicker);
$("#instructionCancel").addEventListener("click", closeInstructionPicker);
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
  instructionDraftCodes = event.target.checked ? new Set(instructionCatalog.map((row) => row.code)) : new Set();
  renderInstructionPicker();
});
$("#instructionConfirm").addEventListener("click", () => {
  if (!activeReleaseRow) return;
  const rows = instructionCatalog
    .filter((row) => instructionDraftCodes.has(row.code))
    .map((row) => ({ ...row, quantity: "1", addedAt: "2026-07-08 18:30:00", addedBy: "天朗（付豪）" }));
  instructionRowsByInventory.set(activeReleaseRow.id, rows);
  closeInstructionPicker();
  renderInstructionList();
});

$("#instructionBody").addEventListener("click", (event) => {
  const editButton = event.target.closest(".instruction-edit");
  const deleteButton = event.target.closest(".instruction-delete");
  if (editButton) {
    const row = getActiveInstructionRows().find((item) => item.code === editButton.dataset.code);
    if (!row) return;
    editingInstructionCode = row.code;
    $("#editInstructionCode").value = row.code;
    $("#editInstructionName").value = row.name;
    $("#editInstructionType").value = row.type;
    $("#editInstructionUnit").value = row.unit;
    $("#editInstructionPrice").value = row.price;
    $("#editInstructionQuantity").value = row.quantity || "1";
    $("#editInstructionCurrency").value = row.currency;
    $("#instructionEditOverlay").hidden = false;
  }
  if (deleteButton) {
    const row = getActiveInstructionRows().find((item) => item.code === deleteButton.dataset.code);
    if (!row) return;
    deletingInstructionCode = row.code;
    $("#deleteInstructionName").textContent = row.name;
    $("#instructionDeleteOverlay").hidden = false;
  }
});

$("#instructionEditCancel").addEventListener("click", () => {
  $("#instructionEditOverlay").hidden = true;
  editingInstructionCode = "";
});
$("#instructionEditForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeReleaseRow || !editingInstructionCode || !event.currentTarget.reportValidity()) return;
  const rows = getActiveInstructionRows().map((row) => row.code === editingInstructionCode ? {
    ...row,
    type: $("#editInstructionType").value,
    unit: $("#editInstructionUnit").value,
    price: $("#editInstructionPrice").value,
    quantity: $("#editInstructionQuantity").value,
    currency: $("#editInstructionCurrency").value
  } : row);
  instructionRowsByInventory.set(activeReleaseRow.id, rows);
  $("#instructionEditOverlay").hidden = true;
  editingInstructionCode = "";
  renderInstructionList();
});
$("#instructionDeleteCancel").addEventListener("click", () => {
  $("#instructionDeleteOverlay").hidden = true;
  deletingInstructionCode = "";
});
$("#instructionDeleteConfirm").addEventListener("click", () => {
  if (!activeReleaseRow || !deletingInstructionCode) return;
  instructionRowsByInventory.set(activeReleaseRow.id, getActiveInstructionRows().filter((row) => row.code !== deletingInstructionCode));
  $("#instructionDeleteOverlay").hidden = true;
  deletingInstructionCode = "";
  renderInstructionList();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!approvalReviewOverlay.hidden) {
    closeApprovalReview();
  } else if (!$("#instructionEditOverlay").hidden) {
    $("#instructionEditOverlay").hidden = true;
    editingInstructionCode = "";
  } else if (!$("#instructionDeleteOverlay").hidden) {
    $("#instructionDeleteOverlay").hidden = true;
    deletingInstructionCode = "";
  } else if (!$("#instructionOverlay").hidden) {
    closeInstructionPicker();
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
  if (activeReleaseReadOnly) {
    closeReleaseDrawer();
    return;
  }
  if (!releaseForm.reportValidity() || !activeReleaseRow) return;
  const boxes = Number($("#releaseBoxes").value);
  if (boxes > activeReleaseRow.unsent) {
    $("#releaseBoxes").setCustomValidity(`箱数不能超过未发货箱数 ${activeReleaseRow.unsent}`);
    $("#releaseBoxes").reportValidity();
    return;
  }
  $("#releaseBoxes").setCustomValidity("");
  closeReleaseDrawer();
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
      mark.textContent = "admin2026-07-23";
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
renderRows();
buildWatermarks();
