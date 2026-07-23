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
let activeStatus = "暂存";
let visibleRows = [...inventoryRows];

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
      <td class="operation-col"><button class="action-link release-button" data-id="${row.id}">放货</button><button class="action-link">日志</button></td>
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
}
$("#searchButton").addEventListener("click", applyFilters);
$("#resetButton").addEventListener("click", () => {
  Object.values(filters).forEach((control) => { control.value = ""; });
  $("#dateFrom").value = ""; $("#dateTo").value = "";
  visibleRows = inventoryRows.filter((row) => row.status === activeStatus);
  renderRows();
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

function getActiveInstructionRows() {
  if (!activeReleaseRow) return [];
  return instructionRowsByInventory.get(activeReleaseRow.id) || [];
}

function renderInstructionList() {
  const target = $("#instructionBody");
  const rows = getActiveInstructionRows();
  if (!rows.length) {
    target.innerHTML = '<tr class="instruction-empty"><td colspan="11"><i>▤</i>暂无数据</td></tr>';
    return;
  }
  target.innerHTML = rows.map((row) => {
    const total = Number(row.price || 0) * Number(row.quantity || 1);
    return `<tr>
      <td>${row.name}</td><td>${row.type}</td><td>${row.unit}</td><td>${row.price}</td><td>${row.quantity || "1"}</td>
      <td>${row.currency}</td><td>${Number(total.toFixed(2))}</td><td>${row.addedAt}</td><td>${row.addedBy}</td>
      <td>${row.description}</td><td><button class="instruction-edit" data-code="${row.code}" type="button">编辑</button><button class="instruction-delete" data-code="${row.code}" type="button">删除</button></td>
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

function openReleaseDrawer(row) {
  activeReleaseRow = row;
  releaseForm.reset();
  $("#releaseContainer").textContent = row.container;
  $("#releaseDispatch").textContent = row.dispatch;
  $("#releasePallet").textContent = row.pallet;
  $("#releaseTransfer").textContent = row.transfer;
  $("#releaseUnsent").textContent = row.unsent;
  $("#releaseBoxes").max = Math.max(1, row.unsent);
  $("#releaseBoxes").placeholder = "请输入";
  $("#releaseMethod").value = "Truck-Amazon";
  const destination = $("#releaseDestination");
  destination.value = "";
  $("#uploadName").textContent = "";
  releaseOverlay.hidden = false;
  document.body.classList.add("release-open");
  renderCargoBoxRows(row);
  renderInstructionList();
  requestAnimationFrame(() => destination.focus());
}

function closeReleaseDrawer() {
  releaseOverlay.hidden = true;
  $("#instructionOverlay").hidden = true;
  $("#instructionEditOverlay").hidden = true;
  $("#instructionDeleteOverlay").hidden = true;
  document.body.classList.remove("release-open");
  activeReleaseRow = null;
  releaseForm.reset();
  $("#uploadName").textContent = "";
}

body.addEventListener("click", (event) => {
  const button = event.target.closest(".release-button");
  if (!button) return;
  const row = inventoryRows.find((item) => item.id === Number(button.dataset.id));
  if (row) openReleaseDrawer(row);
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
  if (!$("#instructionEditOverlay").hidden) {
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
renderRows();
buildWatermarks();
