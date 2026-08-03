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
const approvalBase = {
  blocked: "是",
  applicationType: "FBA仓库",
  transfer: "拆转",
  dispatch: "Truck-Amazon",
  chargedPallets: ""
};
const approvalRows = [
  {
    customer: "TTTX", applicationNo: "20260723001", container: "CCCA1414141", system: "CCCA1414141-240411", inbound: "111",
    shipmentId: "FBA19APPR001", referenceId: "REF20260723001", pallet: "CCCA1414141-240411-111-1", inboundTime: "2026-07-22 09:18:32",
    appliedBoxes: 2, appliedVolume: 0.48, approvalStage: "待仓库审批",
    instructions: [
      { text: "20 CNY 换标服务费 (0.5/件)", completed: false },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false }
    ]
  },
  {
    customer: "23", applicationNo: "20260723002", container: "8889990", system: "8889990-250623", inbound: "88",
    shipmentId: "FBA19APPR002", referenceId: "REF20260723002", pallet: "8889990-250623-88-6", inboundTime: "2026-07-22 10:26:15",
    appliedBoxes: 3, appliedVolume: 1.2, approvalStage: "待初审",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: false },
      { text: "45 CNY 重新打包费 (15/箱)", completed: false },
      { text: "120 CNY 托盘操作费 (30/托)", completed: false }
    ]
  },
  {
    customer: "TTTX2", applicationNo: "20260723003", container: "WEMA1131231", system: "/", inbound: "2",
    applicationType: "其他地址", shipmentId: "", referenceId: "", dispatch: "USPS", pallet: "2-ABE2-1", inboundTime: "2026-07-22 11:04:09",
    appliedBoxes: 2, appliedVolume: 0.182, approvalStage: "待仓库审批",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: false },
      { text: "60 CNY 加固服务费 (30/箱)", completed: false }
    ]
  },
  {
    customer: "ABC-US", applicationNo: "20260723004", container: "MSCU7654321", system: "MSCU7654321-260701", inbound: "US0601",
    shipmentId: "FBA19APPR004", referenceId: "REF20260723004", pallet: "MSCU7654321-US0601-1", inboundTime: "2026-07-22 13:45:27",
    appliedBoxes: 4, appliedVolume: 1.68, approvalStage: "待初审",
    instructions: [
      { text: "30 CNY 清点服务费 (15/箱)", completed: false },
      { text: "60 CNY 加固服务费 (30/箱)", completed: false },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260723005", container: "BPAI9461644", system: "BPAI9461644-240330", inbound: "BBA9461",
    shipmentId: "FBA19APPR005", referenceId: "REF20260723005", pallet: "BPAI9461644-240330-BBA9461-24", inboundTime: "2026-07-22 15:12:43",
    appliedBoxes: 3, appliedVolume: 0.87, approvalStage: "待仓库审批",
    instructions: [
      { text: "3 CNY 仓储渠道-免仓30天 (3/票)", completed: false },
      { text: "4 CNY 仓储渠道-31-90天 (4/票)", completed: false },
      { text: "2 CNY 仓储渠道-90天以上 (2/票)", completed: false }
    ]
  },
  {
    customer: "23", applicationNo: "20260723006", container: "TLLU2026072", system: "TLLU2026072-260715", inbound: "72",
    shipmentId: "FBA19APPR006", referenceId: "REF20260723006", pallet: "TLLU2026072-72-3", inboundTime: "2026-07-23 08:36:18",
    appliedBoxes: 2, appliedVolume: 0.94, approvalStage: "待仓库审批",
    instructions: [
      { text: "3.5 CNY 更换标签费 (0.5/件)", completed: false },
      { text: "10 CNY 重新打包费 (10/票)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260723007", container: "AAAA0000000", system: "AAAA0000000-241109", inbound: "2",
    shipmentId: "FBA19APPR007", referenceId: "REF20260723007", pallet: "AAAA0000000-241109-ABE8-2", inboundTime: "2026-07-23 09:52:06",
    appliedBoxes: 3, appliedVolume: 1.109, approvalStage: "待初审",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: false },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "80 CNY 销毁处理费 (20/箱)", completed: false }
    ]
  },
  {
    customer: "MARY-US", applicationNo: "20260723008", container: "CCLU8765432", system: "CCLU8765432-260720", inbound: "US0720",
    shipmentId: "FBA19APPR008", referenceId: "REF20260723008", pallet: "CCLU8765432-US0720-2", inboundTime: "2026-07-23 11:28:34",
    appliedBoxes: 4, appliedVolume: 2.16, approvalStage: "待仓库审批",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: false },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: false },
      { text: "45 CNY 重新打包费 (15/箱)", completed: false },
      { text: "120 CNY 托盘操作费 (30/托)", completed: false }
    ]
  }
].map((row, index) => ({
  id: index + 1,
  ...approvalBase,
  ...row,
  financialAudit: ["已审核", "部分审核", "未审核"][index % 3],
  status: "待审批"
}));
const instructionPendingBase = {
  blocked: "是",
  applicationType: "FBA仓库",
  transfer: "拆转",
  dispatch: "Truck-Amazon",
  chargedPallets: ""
};
const instructionPendingRows = [
  {
    customer: "23", applicationNo: "20260722001", container: "8889990", system: "8889990-250623", inbound: "88",
    shipmentId: "1237454", referenceId: "134354", pallet: "8889990-250623-88-6", inboundTime: "2025-07-11 15:29:34",
    appliedBoxes: 4, appliedVolume: 1.6, financialAudit: "部分审核",
    instructions: [
      { text: "3 CNY 仓储渠道-免仓30天 (3/票)", completed: true },
      { text: "4 CNY 仓储渠道-31-90天 (4/票)", completed: false },
      { text: "3.5 CNY 更换标签费 (0.5/件)", completed: true },
      { text: "10 CNY 重新打包费 (10/票)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722002", container: "AAAA0000000", system: "AAAA0000000-241109", inbound: "2",
    shipmentId: "FBA19C9LZ2R8", referenceId: "FBA19C9LZ2R8", pallet: "AAAA0000000-241109-ABE8-2", inboundTime: "2024-11-05 15:18:21",
    appliedBoxes: 3, appliedVolume: 1.109, financialAudit: "未审核",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: false },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: false },
      { text: "45 CNY 重新打包费 (15/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX2", applicationNo: "20260722003", container: "WEMA1131231", system: "/", inbound: "2",
    applicationType: "其他地址", shipmentId: "", referenceId: "", dispatch: "USPS", pallet: "2-ABE2-1", inboundTime: "2024-04-23 15:22:43",
    appliedBoxes: 2, appliedVolume: 0.182, financialAudit: "已审核",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: true },
      { text: "120 CNY 托盘操作费 (30/托)", completed: true }
    ]
  },
  {
    customer: "23", applicationNo: "20260722004", container: "8889990", system: "8889990-250623", inbound: "88",
    shipmentId: "FBA323N235Y8", referenceId: "FBA323N235Y8", pallet: "8889990-250623-BWI9-10", inboundTime: "2025-07-11 15:29:34",
    appliedBoxes: 5, appliedVolume: 3.8, financialAudit: "部分审核",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "4 CNY 拦截-免仓7天 (4/票)", completed: false },
      { text: "3 CNY 拦截-免仓8-90天 (3/票)", completed: false },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "80 CNY 销毁处理费 (20/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722005", container: "BPAI9461644", system: "BPAI9461644-240330", inbound: "BBA9461",
    shipmentId: "FBA19BWNJY55", referenceId: "FBA19BWNJY55", pallet: "BPAI9461644-240330-BBA9461-24", inboundTime: "2025-09-25 10:18:40",
    appliedBoxes: 4, appliedVolume: 0.87, financialAudit: "已审核",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: true },
      { text: "45 CNY 重新打包费 (15/箱)", completed: true },
      { text: "120 CNY 托盘操作费 (30/托)", completed: false }
    ]
  },
  {
    customer: "ABC-US", applicationNo: "20260722006", container: "MSCU7654321", system: "MSCU7654321-260701", inbound: "US0601",
    shipmentId: "FBA19TEST001", referenceId: "REF20260722006", pallet: "MSCU7654321-US0601-1", inboundTime: "2026-07-20 09:12:36",
    appliedBoxes: 2, appliedVolume: 0.56, financialAudit: "未审核",
    instructions: [
      { text: "30 CNY 清点服务费 (15/箱)", completed: false },
      { text: "60 CNY 加固服务费 (30/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722007", container: "CCCA1414141", system: "CCCA1414141-240411", inbound: "111",
    shipmentId: "FBA19DONE001", referenceId: "FBA19DONE001", pallet: "CCCA1414141-240411-111-1", inboundTime: "2026-07-19 14:36:20",
    appliedBoxes: 4, appliedVolume: 1.2, financialAudit: "已审核",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: true },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: true },
      { text: "45 CNY 重新打包费 (15/箱)", completed: true }
    ]
  },
  {
    customer: "23", applicationNo: "20260722008", container: "TLLU2026072", system: "TLLU2026072-260715", inbound: "72",
    shipmentId: "FBA19MIXED08", referenceId: "REF20260722008", pallet: "TLLU2026072-72-3", inboundTime: "2026-07-21 16:08:55",
    appliedBoxes: 5, appliedVolume: 2.35, financialAudit: "部分审核",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "3.5 CNY 更换标签费 (0.5/件)", completed: false },
      { text: "10 CNY 重新打包费 (10/票)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "80 CNY 销毁处理费 (20/箱)", completed: false }
    ]
  }
].map((row, index) => ({
  id: index + 1,
  ...instructionPendingBase,
  ...row,
  instructions: row.instructions.map((instruction) => ({ ...instruction, completed: false })),
  status: "指令待处理"
}));
const instructionProcessingRows = [
  {
    customer: "23", applicationNo: "20260722001", container: "8889990", system: "8889990-250623", inbound: "88",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "1237454", referenceId: "134354", pallet: "8889990-250623-88-6", inboundTime: "2025-07-11 15:29:34",
    appliedBoxes: 4, appliedVolume: 1.6, financialAudit: "已审核", instructionAudit: "审核中",
    instructions: [
      { text: "3 CNY 仓储渠道-免仓30天 (3/票)", completed: true },
      { text: "4 CNY 仓储渠道-31-90天 (4/票)", completed: true },
      { text: "3.5 CNY 更换标签费 (0.5/件)", completed: true },
      { text: "10 CNY 重新打包费 (10/票)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722002", container: "AAAA0000000", system: "AAAA0000000-241109", inbound: "2",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA19C9LZ2R8", referenceId: "FBA19C9LZ2R8", pallet: "AAAA0000000-241109-ABE8-2", inboundTime: "2024-11-05 15:18:21",
    appliedBoxes: 3, appliedVolume: 1.109, financialAudit: "已审核", instructionAudit: "审核中",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: true },
      { text: "45 CNY 重新打包费 (15/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX2", applicationNo: "20260722003", container: "WEMA1131231", system: "/", inbound: "2",
    blocked: "是", applicationType: "其他地址", transfer: "拆转", dispatch: "USPS", chargedPallets: "",
    shipmentId: "", referenceId: "", pallet: "2-ABE2-1", inboundTime: "2024-04-23 15:22:43",
    appliedBoxes: 2, appliedVolume: 0.182, financialAudit: "已审核", instructionAudit: "审核中",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: true },
      { text: "120 CNY 托盘操作费 (30/托)", completed: false }
    ]
  },
  {
    customer: "23", applicationNo: "20260722004", container: "8889990", system: "8889990-250623", inbound: "88",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA323N235Y8", referenceId: "FBA323N235Y8", pallet: "8889990-250623-BWI9-10", inboundTime: "2025-07-11 15:29:34",
    appliedBoxes: 5, appliedVolume: 3.8, financialAudit: "部分审核", instructionAudit: "审核中",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "4 CNY 拦截-免仓7天 (4/票)", completed: false },
      { text: "3 CNY 拦截-免仓8-90天 (3/票)", completed: false },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "80 CNY 销毁处理费 (20/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722005", container: "BPAI9461644", system: "BPAI9461644-240330", inbound: "BBA9461",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA19BWNJY55", referenceId: "FBA19BWNJY55", pallet: "BPAI9461644-240330-BBA9461-24", inboundTime: "2025-09-25 10:18:40",
    appliedBoxes: 4, appliedVolume: 0.87, financialAudit: "已审核", instructionAudit: "审核中",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: true },
      { text: "45 CNY 重新打包费 (15/箱)", completed: true },
      { text: "120 CNY 托盘操作费 (30/托)", completed: false }
    ]
  },
  {
    customer: "ABC-US", applicationNo: "20260722006", container: "MSCU7654321", system: "MSCU7654321-260701", inbound: "US0601",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA19TEST001", referenceId: "REF20260722006", pallet: "MSCU7654321-US0601-1", inboundTime: "2026-07-20 09:12:36",
    appliedBoxes: 2, appliedVolume: 0.56, financialAudit: "未审核", instructionAudit: "审核中",
    instructions: [
      { text: "30 CNY 清点服务费 (15/箱)", completed: true },
      { text: "60 CNY 加固服务费 (30/箱)", completed: false }
    ]
  },
  {
    customer: "TTTX", applicationNo: "20260722007", container: "CCCA1414141", system: "CCCA1414141-240411", inbound: "111",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA19DONE001", referenceId: "FBA19DONE001", pallet: "CCCA1414141-240411-111-1", inboundTime: "2026-07-19 14:36:20",
    appliedBoxes: 4, appliedVolume: 1.2, financialAudit: "已审核", instructionAudit: "审核中",
    instructions: [
      { text: "979.4 CNY 基础运费 (5.9/KG)", completed: true },
      { text: "20 CNY 换标服务费 (0.5/件)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: true },
      { text: "45 CNY 重新打包费 (15/箱)", completed: false }
    ]
  },
  {
    customer: "23", applicationNo: "20260722008", container: "TLLU2026072", system: "TLLU2026072-260715", inbound: "72",
    blocked: "是", applicationType: "FBA仓库", transfer: "拆转", dispatch: "Truck-Amazon", chargedPallets: "",
    shipmentId: "FBA19MIXED08", referenceId: "REF20260722008", pallet: "TLLU2026072-72-3", inboundTime: "2026-07-21 16:08:55",
    appliedBoxes: 5, appliedVolume: 2.35, financialAudit: "部分审核", instructionAudit: "审核中",
    instructions: [
      { text: "900 CNY 国外拦截费 (900/票)", completed: true },
      { text: "3.5 CNY 更换标签费 (0.5/件)", completed: true },
      { text: "10 CNY 重新打包费 (10/票)", completed: true },
      { text: "50 CNY 拍照服务费 (10/箱)", completed: false },
      { text: "80 CNY 销毁处理费 (20/箱)", completed: false }
    ]
  }
].map((row, index) => ({ id: index + 1, ...row, status: "指令处理中" }));
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
const completedInstructionTextSets = [
  ["979.4 CNY 基础运费 (5.9/KG)", "20 CNY 换标服务费 (0.5/件)"],
  ["900 CNY 国外拦截费 (900/票)", "45 CNY 重新打包费 (15/箱)", "50 CNY 拍照服务费 (10/箱)"],
  ["3 CNY 仓储渠道-免仓30天 (3/票)", "4 CNY 仓储渠道-31-90天 (4/票)", "2 CNY 仓储渠道-90天以上 (2/票)"],
  ["30 CNY 清点服务费 (15/箱)", "60 CNY 加固服务费 (30/箱)", "120 CNY 托盘操作费 (30/托)"]
];
const outboundRows = Array.from({ length: 95 }, (_, index) => {
  const seed = outboundSeedRows[index % outboundSeedRows.length];
  return {
    ...seed,
    id: index + 1,
    applicationNo: index < outboundSeedRows.length ? seed.applicationNo : `2025${String(9200000 - index).padStart(8, "0")}`,
    financialAudit: ["已审核", "已审核", "部分审核", "未审核", "已审核", "部分审核", "已审核"][index % 7],
    instructionAudit: "已审核",
    instructions: completedInstructionTextSets[index % completedInstructionTextSets.length].map((text) => ({ text, completed: true })),
    status: "待出库"
  };
});
const shippedRows = outboundRows.slice(0, 30).map((row) => ({ ...row, status: "已出库" }));
const destroyedRows = outboundRows.slice(0, 36).map((row, index) => ({
  ...row,
  // 销毁记录沿用放货申请数据，并补齐销毁列表需要展示的申请及处理信息。
  destination: row.destination || (row.dispatch === "Truck-Amazon" ? "GEU3" : row.dispatch === "USPS" ? "US" : "1420 Tamarind Ave, Rialto"),
  appointmentDeliveryTime: `2026-07-${String(18 + (index % 7)).padStart(2, "0")} ${index % 2 ? "10:27:28" : "15:17:37"}`,
  shippingApplicationAttachment: index % 3 === 2 ? "-" : `发货申请附件-${String(index + 1).padStart(2, "0")}.pdf`,
  applicationTime: `2026-07-${String(16 + (index % 7)).padStart(2, "0")} ${index % 2 ? "10:27:52" : "17:54:28"}`,
  processingStartedAt: `2026-07-${String(17 + (index % 7)).padStart(2, "0")} ${index % 2 ? "09:18:40" : "14:12:06"}`,
  processingFinishedAt: `2026-07-${String(18 + (index % 7)).padStart(2, "0")} ${index % 2 ? "11:36:15" : "16:25:48"}`,
  timeoutCount: index % 5,
  applicationRemark: ["客户申请销毁，已确认无退运需求", "外箱破损，按客户指示销毁", "库存清理，已完成费用确认"][index % 3],
  instructions: row.instructions.map((instruction) => ({ ...instruction, completed: true })),
  status: "销毁"
}));
const rejectedRows = outboundRows.slice(0, 36).map((row) => ({
  ...row,
  instructions: row.instructions.map((instruction) => ({ ...instruction, completed: false })),
  status: "审批拒绝"
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
const attachmentRowsByInventory = new Map();
let instructionDraftCodes = new Set(instructionCatalog.slice(0, 3).map((row) => row.code));
let instructionExistingCatalogCodes = new Set();
const instructionDraftValues = new Map();
let editingInstructionCode = "";
let editingRemarkInstructionCode = "";
let deletingInstructionCode = "";
const selected = new Set();
const instructionStatusDrafts = new Map();
let activeStatus = "待审批";
let visibleRows = [...approvalRows];

const instructionWorkflowRows = [
  approvalRows,
  instructionPendingRows,
  instructionProcessingRows,
  outboundRows,
  shippedRows,
  destroyedRows,
  rejectedRows
];

instructionWorkflowRows.forEach((rows) => {
  rows.forEach((row, index) => {
    if (!["放货", "不放货", "销毁"].includes(row.releaseType)) {
      row.releaseType = row.shippingEnabled === false || index % 3 === 2 ? "不放货" : index % 5 === 4 ? "销毁" : "放货";
    }
  });
});

function getInstructionDetailKey(row) {
  return row.applicationNo || `${row.container || ""}::${row.pallet || row.id || ""}`;
}

function getInstructionName(text, fallback) {
  const normalized = String(text || "").replace(/^\s*[\d.]+\s+[A-Z]{3}\s+/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
  return normalized || fallback;
}

function parseInstructionText(text, fallback) {
  const match = String(text || "").match(/^\s*([\d.]+)\s+([A-Z]{3})\s+(.+?)\s*\(([\d.]+)\/([^)]+)\)\s*$/);
  if (!match) {
    return {
      name: getInstructionName(text, fallback.name),
      price: fallback.price,
      unit: fallback.unit,
      quantity: "1",
      currency: fallback.currency,
      description: text || fallback.description
    };
  }
  const total = Number(match[1]);
  const unitPrice = Number(match[4]);
  const quantity = unitPrice > 0 ? Number((total / unitPrice).toFixed(2)) : 1;
  return {
    name: match[3].trim(),
    price: String(unitPrice),
    unit: match[5].trim(),
    quantity: String(quantity),
    currency: match[2] === "CNY" ? "人民币" : match[2],
    description: text
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function ensureInstructionDetailRows(row) {
  const key = getInstructionDetailKey(row);
  if (!instructionRowsByInventory.has(key)) {
    const sourceInstructions = row.instructions || [];
    const detailRows = sourceInstructions.map((instruction, index) => {
      const template = instructionCatalog[index % instructionCatalog.length] || {};
      const parsed = parseInstructionText(instruction.text, template);
      return {
        ...template,
        ...parsed,
        catalogCode: template.code,
        code: `${key}-ZL-${String(index + 1).padStart(2, "0")}`,
        rawText: instruction.text,
        addedAt: row.inboundTime || "2026-07-08 18:30:00",
        addedBy: "天朗（付豪）",
        remark: "",
        images: [],
        status: instruction.completed ? "已处理" : "待处理"
      };
    });
    instructionRowsByInventory.set(key, detailRows);
  }
  const detailRows = instructionRowsByInventory.get(key);
  detailRows.forEach((instruction) => {
    if (typeof instruction.remark !== "string") instruction.remark = "";
    if (!Array.isArray(instruction.images)) instruction.images = [];
  });
  if (["指令待处理", "指令处理中", "待出库"].includes(row.status) && detailRows.length === (row.instructions?.length || 0)) {
    detailRows.forEach((instruction, index) => {
      instruction.status = row.instructions[index].completed ? "已处理" : "待处理";
    });
  }
  return detailRows;
}

function syncInstructionStatus(detailKey, instructionIndex, status) {
  instructionWorkflowRows.forEach((rows) => {
    rows.forEach((row) => {
      if (getInstructionDetailKey(row) !== detailKey || !row.instructions?.[instructionIndex]) return;
      row.instructions[instructionIndex].completed = status === "已处理";
    });
  });
}

function buildInstructionText(row) {
  const total = Number(row.price || 0) * Number(row.quantity || 1);
  const currency = row.currency === "人民币" ? "CNY" : row.currency || "CNY";
  return `${Number(total.toFixed(2))} ${currency} ${row.name} (${row.price || 0}/${row.unit || "票"})`;
}

function syncInstructionDetails(detailKey, detailRows) {
  instructionWorkflowRows.forEach((rows) => {
    rows.forEach((row) => {
      if (getInstructionDetailKey(row) !== detailKey) return;
      row.instructions = detailRows.map((instruction) => ({
        text: buildInstructionText(instruction),
        completed: instruction.status === "已处理"
      }));
    });
  });
}

const $ = (selector) => document.querySelector(selector);
const body = $("#inventoryBody");
const head = $("#inventoryHead");
const footer = $("#tableFooter");
let selectAll = null;
const filters = {
  keyword: $("#keywordFilter"), customer: $("#customerFilter"), request: $("#requestFilter"), inbound: $("#inboundFilter"),
  releaseType: $("#releaseTypeFilter"),
  transfer: $("#transferFilter"), fba: $("#fbaFilter"), dispatch: $("#dispatchFilter"),
  location: $("#locationFilter"), container: $("#containerFilter"), pallet: $("#palletFilter"),
  blocked: $("#blockedFilter"), financialAudit: $("#financialAuditFilter")
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

function isInstructionPendingView() {
  return activeStatus === "指令待处理";
}

function isInstructionProcessingView() {
  return activeStatus === "指令处理中";
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

function isDestroyedView() {
  return activeStatus === "销毁";
}

function isTerminalRequestView() {
  return isRejectedView() || isDestroyedView();
}

function getOutboundViewRows() {
  return isShippedView() ? shippedRows : outboundRows;
}

function isRequestTableView() {
  return isApprovalView() || isInstructionView() || isOutboundView() || isTerminalRequestView();
}

function getInstructionViewRows() {
  return activeStatus === "指令待处理" ? instructionPendingRows : instructionProcessingRows;
}

function getActiveStatusRows() {
  if (isApprovalView()) return approvalRows;
  if (isInstructionView()) return getInstructionViewRows();
  if (isOutboundView()) return getOutboundViewRows();
  if (isDestroyedView()) return destroyedRows;
  if (isRejectedView()) return rejectedRows;
  return inventoryRows;
}

const financialAuditTone = {
  已审核: "status-success",
  部分审核: "status-partial",
  未审核: "status-pending"
};

function renderFinancialAudit(status) {
  return `<span class="workflow-status ${financialAuditTone[status] || "status-neutral"}">${status || "-"}</span>`;
}

function getReleaseType(row) {
  if (row.status === "销毁") return "销毁";
  if (["放货", "不放货", "销毁"].includes(row.releaseType)) return row.releaseType;
  if (row.releaseType === "下单") return "放货";
  if (row.releaseType === "不下单") return "不放货";
  return row.shippingEnabled === false ? "不放货" : "放货";
}

function renderReleaseType(row) {
  const releaseType = getReleaseType(row);
  return `<span class="release-type-tag ${releaseType === "放货" ? "is-release" : "is-no-release"}">${releaseType}</span>`;
}

const instructionAuditTone = {
  已审核: "status-success",
  审核中: "status-partial",
  未审核: "status-pending"
};

function renderInstructionAudit(status) {
  return `<span class="workflow-status ${instructionAuditTone[status] || "status-neutral"}">${status || "-"}</span>`;
}

function getInstructionProgress(row) {
  const total = row.instructions?.length || 0;
  const completed = row.instructions?.filter((instruction) => instruction.completed).length || 0;
  return { total, completed };
}

function getInstructionCount(row) {
  const progress = getInstructionProgress(row);
  return `${progress.completed}/${progress.total}`;
}

function renderInstructionCount(row) {
  const progress = getInstructionProgress(row);
  const completeClass = progress.total > 0 && progress.completed === progress.total ? " is-complete" : "";
  return `<span class="instruction-count${completeClass}" title="${progress.completed} 条已处理，${progress.total - progress.completed} 条待处理">${progress.completed}/${progress.total}</span>`;
}

function renderInstructionLines(row) {
  if (!row.instructions?.length) return '<span class="instruction-empty">-</span>';
  return `<div class="instruction-lines">${row.instructions.map((instruction) => {
    const status = instruction.completed ? "已处理" : "待处理";
    return `<div class="instruction-line ${instruction.completed ? "status-success" : "status-pending"}" title="${status}：${instruction.text}"><span class="instruction-state-label">${status}</span><span class="instruction-line-text">${instruction.text}</span></div>`;
  }).join("")}</div>`;
}

function getListInstructionRows(row) {
  return ensureInstructionDetailRows(row);
}

function renderInstructionRemarkSummary(row) {
  const remarks = getListInstructionRows(row).map((instruction) => instruction.remark).filter(Boolean);
  return remarks.length ? `<span class="list-instruction-remark" title="${escapeHtml(remarks.join("；"))}">${escapeHtml(remarks.join("；"))}</span>` : '<span class="list-instruction-empty">备注</span>';
}

function renderInstructionImageSummary(row) {
  const count = getListInstructionRows(row).reduce((total, instruction) => total + (instruction.images?.length || 0), 0);
  return `<span class="list-instruction-images">${count ? `${count} 张` : "暂无图片"}</span>`;
}

function renderInstructionStatusSummary(row) {
  const instructions = getListInstructionRows(row);
  const completed = instructions.filter((instruction) => instruction.status === "已处理").length;
  const pending = Math.max(0, instructions.length - completed);
  return `<span class="list-instruction-status ${pending === 0 && instructions.length ? "is-complete" : "is-pending"}">${completed}/${instructions.length} 已处理</span>`;
}

function getInstructionText(row) {
  return row.instructions?.map((instruction) => `[${instruction.completed ? "已处理" : "待处理"}] ${instruction.text}`).join("；") || "";
}

function getInstructionDraftChangeCount() {
  let count = 0;
  instructionStatusDrafts.forEach(({ row, completed }) => {
    row.instructions.forEach((instruction, index) => {
      if (instruction.completed !== completed[index]) count += 1;
    });
  });
  return count;
}

function updateInstructionDraftBar() {
  const count = getInstructionDraftChangeCount();
  $("#instructionDraftCount").textContent = String(count);
  $("#instructionDraftBar").hidden = count === 0;
}

function captureInstructionStatusDraft(row) {
  if (instructionStatusDrafts.has(row.id)) return;
  instructionStatusDrafts.set(row.id, {
    row,
    completed: row.instructions.map((instruction) => instruction.completed)
  });
}

function syncInstructionStatusDraft(row) {
  const draft = instructionStatusDrafts.get(row.id);
  if (!draft) return;
  const unchanged = row.instructions.every((instruction, index) => instruction.completed === draft.completed[index]);
  if (unchanged) instructionStatusDrafts.delete(row.id);
  updateInstructionDraftBar();
}

function discardInstructionStatusDrafts() {
  instructionStatusDrafts.forEach(({ row, completed }) => {
    row.instructions.forEach((instruction, index) => {
      instruction.completed = completed[index];
    });
  });
  instructionStatusDrafts.clear();
  updateInstructionDraftBar();
  renderRows();
}

function confirmDiscardInstructionStatusDrafts() {
  if (!instructionStatusDrafts.size) return true;
  if (!window.confirm("当前有未保存的指令修改，确认放弃吗？")) return false;
  discardInstructionStatusDrafts();
  return true;
}

function renderTableChrome() {
  const requestTable = isRequestTableView();
  document.body.classList.toggle("request-view", requestTable);
  document.body.classList.toggle("approval-view", isApprovalView());
  document.body.classList.toggle("instruction-view", isInstructionView());
  document.body.classList.toggle("instruction-pending-view", isInstructionPendingView());
  document.body.classList.toggle("outbound-view", isOutboundView());
  document.body.classList.toggle("rejection-view", isTerminalRequestView());
  document.body.classList.toggle("destroyed-view", isDestroyedView());
  document.body.classList.toggle("staging-view", activeStatus === "暂存");
  document.querySelector(".inventory-table").classList.toggle("approval-table", requestTable);
  $("#contextAction").textContent = isApprovalView() ? "批量初审" : isInstructionPendingView() ? "开始处理" : isInstructionProcessingView() ? "处理完成" : isOutboundView() ? "下单托盘标签导出" : "更换库位";
  $("#contextAction").hidden = isTerminalRequestView();
  $("#countdownAction").hidden = !isInstructionPendingView();
  $("#approvalDensityButton").hidden = isTerminalRequestView();
  $("#financialAuditField").hidden = !isRequestTableView();
  $("#releaseTypeField").hidden = activeStatus === "暂存";

  head.innerHTML = requestTable ? `<tr>
    <th class="index-col">#</th><th class="check-col"><input id="selectAll" type="checkbox" /></th>
    <th class="sortable">客户名称</th><th>申请单号</th><th>柜号</th><th>系统柜号</th><th>入仓号</th><th>是否拦截</th>
    <th>运单类型</th><th class="release-type-col">下单类型</th><th>Shipment ID</th><th>Reference ID</th><th>${isDestroyedView() ? "运输方式" : "转运方式"}</th><th>派送方式</th><th>托盘标签</th>
    ${(isApprovalView() || isTerminalRequestView())
      ? `<th class="instruction-count-col">指令数量</th><th class="instruction-list-col">指令</th>`
      : (isInstructionView() || isOutboundView())
        ? '<th class="financial-audit-col">财务审核</th><th class="instruction-count-col">指令数量</th><th class="instruction-list-col">指令</th>'
        : ""}
    <th class="sortable">入库时间</th><th class="sortable">申请箱数</th><th>申请箱数总体积</th><th>收费托数</th>
    ${isDestroyedView() ? `<th class="destination-col">目的地</th><th class="appointment-delivery-col">预约发货时间</th><th class="shipping-attachment-col">发货申请附件</th><th class="application-time-col">申请时间</th><th class="processing-time-col">开始处理时间</th><th class="processing-time-col">结束处理时间</th><th class="timeout-count-col">超时次数</th><th class="application-remark-col">申请备注</th>` : ""}
    <th class="operation-col">操作</th>
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
    const emptyColumns = isDestroyedView() ? 30 : isInstructionView() || isOutboundView() ? 23 : isApprovalView() ? 22 : isTerminalRequestView() ? 22 : 19;
    body.innerHTML = `<tr><td class="empty-row" colspan="${emptyColumns}">暂无匹配库存记录</td></tr>`;
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
      <td>${row.applicationType}</td><td class="release-type-col">${renderReleaseType(row)}</td><td>${row.shipmentId}</td><td>${row.referenceId}</td>
      <td>${isDestroyedView() ? row.dispatch : row.transfer}</td><td>${row.dispatch}</td><td title="${row.pallet}">${row.pallet}</td>
      ${(isApprovalView() || isTerminalRequestView())
        ? `<td class="instruction-count-col">${renderInstructionCount(row)}</td>
           <td class="instruction-list-col instruction-list-cell">${renderInstructionLines(row)}</td>`
        : (isInstructionView() || isOutboundView())
          ? `<td class="financial-audit-col">${renderFinancialAudit(row.financialAudit)}</td>
             <td class="instruction-count-col">${renderInstructionCount(row)}</td>
             <td class="instruction-list-col instruction-list-cell">${renderInstructionLines(row)}</td>`
          : ""}
      <td>${row.inboundTime}</td><td>${row.appliedBoxes}</td><td>${row.appliedVolume}</td><td>${row.chargedPallets}</td>
      ${isDestroyedView() ? `<td class="destination-col" title="${row.destination}">${row.destination}</td><td class="appointment-delivery-col">${row.appointmentDeliveryTime}</td><td class="shipping-attachment-col">${row.shippingApplicationAttachment === "-" ? "-" : `<span class="attachment-link" title="${row.shippingApplicationAttachment}">${row.shippingApplicationAttachment}</span>`}</td><td class="application-time-col">${row.applicationTime}</td><td class="processing-time-col">${row.processingStartedAt}</td><td class="processing-time-col">${row.processingFinishedAt}</td><td class="timeout-count-col">${row.timeoutCount}</td><td class="application-remark-col" title="${row.applicationRemark}">${row.applicationRemark}</td>` : ""}
      <td class="operation-col approval-actions">${isTerminalRequestView()
        ? `<button class="action-link detail-button" data-id="${row.id}">详情</button>`
        : isOutboundView()
          ? `<button class="action-link receivable-button">应收费用</button><button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link log-button">日志</button>`
          : isInstructionView()
            ? `<button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link log-button">日志</button>`
            : `<button class="action-link review-button" data-id="${row.id}">审核申请</button><button class="action-link detail-button" data-id="${row.id}">详情</button>`}</td>
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
      <td class="operation-col"><button class="action-link release-button" data-id="${row.id}">下单</button><button class="action-link detail-button" data-id="${row.id}">详情</button><button class="action-link">日志</button></td>
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
  selected.clear();
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
      && (activeStatus === "暂存" || !filters.releaseType.value || getReleaseType(row) === filters.releaseType.value)
      && (!filters.transfer.value || row.transfer === filters.transfer.value)
      && (!filters.fba.value || row.destination === filters.fba.value)
      && (!filters.dispatch.value || row.dispatch === filters.dispatch.value)
      && (!filters.container.value || row.container.toLowerCase().includes(filters.container.value.trim().toLowerCase()))
      && (!filters.pallet.value || row.pallet.toLowerCase().includes(filters.pallet.value.trim().toLowerCase()))
      && (!isRequestTableView() || !filters.financialAudit.value || row.financialAudit === filters.financialAudit.value)
      && (!filters.blocked.value || row.blocked === filters.blocked.value);
  });
  renderRows();
}
$("#searchButton").addEventListener("click", applyFilters);
$("#resetButton").addEventListener("click", () => {
  selected.clear();
  Object.values(filters).forEach((control) => { control.value = ""; });
  $("#dateFrom").value = ""; $("#dateTo").value = "";
  visibleRows = getActiveStatusRows().filter((row) => row.status === activeStatus);
  renderRows();
});
Object.values(filters).forEach((control) => {
  control.addEventListener("keydown", (event) => { if (event.key === "Enter") applyFilters(); });
});

function updateStatusTabCount(status, count) {
  const tab = document.querySelector(`.status-tab[data-status="${status}"]`);
  if (!tab) return;
  tab.textContent = `${tab.textContent.replace(/\(\d+\)$/, "")}(${count})`;
}

$("#contextAction").addEventListener("click", () => {
  if (isInstructionPendingView()) {
    const startingRows = instructionPendingRows.filter((row) => selected.has(row.id));
    if (!startingRows.length) {
      window.alert("请先选择需要开始处理的记录");
      return;
    }
    const nextProcessingId = instructionProcessingRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    instructionProcessingRows.unshift(...startingRows.map((row, index) => ({
      ...row,
      id: nextProcessingId + index,
      instructionAudit: "审核中",
      instructions: row.instructions.map((instruction) => ({ ...instruction, completed: false })),
      status: "指令处理中"
    })));
    for (let index = instructionPendingRows.length - 1; index >= 0; index -= 1) {
      if (selected.has(instructionPendingRows[index].id)) instructionPendingRows.splice(index, 1);
    }
    selected.clear();
    updateStatusTabCount("指令待处理", instructionPendingRows.length);
    updateStatusTabCount("指令处理中", instructionProcessingRows.length);
    applyFilters();
    return;
  }

  if (!isInstructionProcessingView()) return;
  if (instructionStatusDrafts.size) {
    window.alert("请先保存指令修改，再执行处理完成");
    return;
  }
  const completedRows = instructionProcessingRows.filter((row) => selected.has(row.id));
  if (!completedRows.length) {
    window.alert("请先选择需要处理完成的记录");
    return;
  }
  const incompleteRows = completedRows.filter((row) => {
    const progress = getInstructionProgress(row);
    return progress.total === 0 || progress.completed !== progress.total;
  });
  if (incompleteRows.length) {
    const details = incompleteRows.slice(0, 4).map((row) => `${row.applicationNo}（${getInstructionCount(row)}）`).join("\n");
    const suffix = incompleteRows.length > 4 ? `\n等 ${incompleteRows.length} 条记录` : "";
    window.alert(`以下记录仍有未处理指令，不能处理完成：\n${details}${suffix}`);
    return;
  }
  if (!window.confirm(`确认将选中的 ${completedRows.length} 条记录流转至“指令处理完成，待出库”吗？`)) return;

  const nextOutboundId = outboundRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  outboundRows.unshift(...completedRows.map((row, index) => ({
    ...row,
    id: nextOutboundId + index,
    instructionAudit: "已审核",
    instructions: row.instructions.map((instruction) => ({ ...instruction })),
    status: "待出库"
  })));

  for (let index = instructionProcessingRows.length - 1; index >= 0; index -= 1) {
    if (selected.has(instructionProcessingRows[index].id)) instructionProcessingRows.splice(index, 1);
  }

  selected.clear();
  updateStatusTabCount("指令处理中", instructionProcessingRows.length);
  updateStatusTabCount("待出库", outboundRows.length);
  applyFilters();
});

$("#instructionDraftDiscard").addEventListener("click", discardInstructionStatusDrafts);
$("#instructionDraftSave").addEventListener("click", () => {
  instructionStatusDrafts.clear();
  updateInstructionDraftBar();
  renderRows();
});
window.addEventListener("beforeunload", (event) => {
  if (!instructionStatusDrafts.size) return;
  event.preventDefault();
  event.returnValue = "";
});

document.querySelectorAll(".status-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.status !== activeStatus && !confirmDiscardInstructionStatusDrafts()) return;
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
  if (instructionStatusDrafts.size) {
    window.alert("请先保存或放弃指令修改，再执行导出");
    return;
  }
  const requestHeader = ["客户名称","申请单号","柜号","系统柜号","入仓号","是否拦截","运单类型","下单类型","Shipment ID","Reference ID","转运方式","派送方式","托盘标签"];
  if (isApprovalView() || isTerminalRequestView()) requestHeader.push("指令数量", "指令");
  else if (isInstructionView() || isOutboundView()) requestHeader.push("财务审核", "指令数量", "指令");
  requestHeader.push("入库时间", "申请箱数", "申请箱数总体积", "收费托数");
  const header = isRequestTableView()
    ? requestHeader
    : ["客户名称","柜号","系统柜号","入仓号","是否拦截","转运方式","目的地","派送方式","托盘标签","入库时间","重量","体积","总箱数","待审核箱数","未发货箱数","已发货箱数"];
  const lines = [header, ...visibleRows.map((r) => {
    if (!isRequestTableView()) {
      return [r.customer,r.container,r.system,r.inbound,r.blocked,r.transfer,r.destination,r.dispatch,r.pallet,r.time,r.weight,r.volume,r.boxes,r.pending,r.unsent,r.sent];
    }
    const requestRow = [r.customer,r.applicationNo,r.container,r.system,r.inbound,r.blocked,r.applicationType,getReleaseType(r),r.shipmentId,r.referenceId,r.transfer,r.dispatch,r.pallet];
    if (isApprovalView() || isTerminalRequestView()) requestRow.push(getInstructionCount(r), getInstructionText(r));
    else if (isInstructionView() || isOutboundView()) requestRow.push(r.financialAudit, getInstructionCount(r), getInstructionText(r));
    requestRow.push(r.inboundTime, r.appliedBoxes, r.appliedVolume, r.chargedPallets);
    return requestRow;
  })];
  const csv = "\ufeff" + lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = isApprovalView() ? "待审批.csv" : isInstructionView() ? "指令处理.csv" : isShippedView() ? "已出库.csv" : isOutboundView() ? "待出库.csv" : isDestroyedView() ? "已完成.csv" : isRejectedView() ? "审批拒绝.csv" : "暂存库存.csv";
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
  const row = approvalRows.find((item) => item.id === Number(button.dataset.id));
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
  const count = Math.max(1, Math.min(Number(row.unsent || row.boxes || 1), 10));
  const unitPrice = row.id % 2 ? 10 : 12;
  const quantity = row.id % 3 ? 16 : 12;
  const material = row.cargoMaterial || "Oxford\u725b\u6d25\u5e03";
  const customsCode = `42021290${String(row.id).padStart(2, "0")}`;
  const boxPrefix = row.shipmentId || `FBA${String(18 + row.id).padStart(2, "0")}DNZH02MU0003${String(row.id).padStart(2, "0")}`;
  return Array.from({ length: count }, (_, index) => ({
    boxNo: `${boxPrefix}${String(index + 1).padStart(3, "0")}`,
    poNumber: row.referenceId || "-",
    englishName: "lunch bag",
    chineseName: "\u5348\u9910\u5305",
    unitPrice,
    quantity,
    totalPrice: unitPrice * quantity,
    material,
    customsCode
  }));
}

function renderCargoBoxRows(row) {
  const rows = getCargoBoxRows(row);
  const total = rows.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  $("#cargoBoxMaterial").textContent = rows[0]?.material || "Oxford\u725b\u6d25\u5e03";
  $("#cargoDeclareTotal").textContent = String(total);
  const allChecked = rows.length > 0 && rows.every((_, i) => selectedCargoBoxIndices.has(i));
  const anyChecked = rows.some((_, i) => selectedCargoBoxIndices.has(i));
  const canSelect = !activeReleaseReadOnly;
  $("#cargoBoxSection thead").innerHTML = `<tr>
    <th class="cargo-index">#</th>
    <th class="cargo-check"><input type="checkbox" id="cargoBoxSelectAll" aria-label="\u5168\u9009\u8d27\u7bb1" ${!canSelect ? "disabled" : ""} /></th>
    <th>FBA/IBR\u7bb1\u53f7</th><th>PO Number</th><th>\u4ea7\u54c1\u82f1\u6587\u540d</th><th>\u4ea7\u54c1\u4e2d\u6587\u540d</th>
    <th>\u4ea7\u54c1\u7533\u62a5\u5355\u4ef7</th><th>\u4ea7\u54c1\u7533\u62a5\u6570\u91cf</th><th>\u4ea7\u54c1\u7533\u62a5\u603b\u4ef7</th><th>\u4ea7\u54c1\u6750\u8d28</th><th>\u4ea7\u54c1\u6d77\u5173\u7f16\u7801</th>
  </tr>`;
  $("#cargoBoxBody").innerHTML = rows.map((box, index) => `<tr>
    <td class="cargo-index">${index + 1}</td>
    <td class="cargo-check"><input type="checkbox" class="cargo-box-check" data-index="${index}" aria-label="\u8d27\u7bb1 ${escapeHtml(box.boxNo)}" ${selectedCargoBoxIndices.has(index) ? "checked" : ""} ${!canSelect ? "disabled" : ""} /></td>
    <td>${escapeHtml(box.boxNo)}</td>
    <td>${escapeHtml(box.poNumber)}</td>
    <td>${escapeHtml(box.englishName)}</td>
    <td>${escapeHtml(box.chineseName)}</td>
    <td>${box.unitPrice}</td>
    <td>${box.quantity}</td>
    <td>${box.totalPrice}</td>
    <td>${escapeHtml(box.material)}</td>
    <td>${escapeHtml(box.customsCode)}</td>
  </tr>`).join("");
  // Sync select-all checkbox after render
  setTimeout(() => {
    const selectAll = $("#cargoBoxSelectAll");
    if (!selectAll) return;
    selectAll.checked = allChecked;
    selectAll.indeterminate = anyChecked && !allChecked;
  }, 0);
}

function getActiveInstructionRows() {
  if (!activeReleaseRow) return [];
  return ensureInstructionDetailRows(activeReleaseRow);
}

function getReleaseAttachments() {
  if (!activeReleaseRow) return [];
  const attachmentKey = getInstructionDetailKey(activeReleaseRow);
  if (!attachmentRowsByInventory.has(attachmentKey)) {
    attachmentRowsByInventory.set(attachmentKey, [...(activeReleaseRow.attachments || [])]);
  }
  return attachmentRowsByInventory.get(attachmentKey);
}

function renderReleaseAttachments() {
  const target = $("#releaseAttachmentList");
  const attachments = getReleaseAttachments();
  const uploadText = attachments.length ? `已上传 ${attachments.length} 个附件` : "";
  $("#uploadName").textContent = uploadText;
  $("#drawerAttachmentName").textContent = uploadText;
  target.innerHTML = attachments.length
    ? attachments.map((attachment) => `<div class="release-attachment-item"><span class="release-attachment-name">${attachment.kind === "image" ? "PDA图片：" : "附件："}${escapeHtml(attachment.name)}</span><a class="release-attachment-download" href="${escapeHtml(attachment.url)}" download="${escapeHtml(attachment.name)}">下载</a></div>`).join("")
    : "";
}

function addReleaseAttachments(files) {
  if (!files.length || !activeReleaseRow) return;
  const attachments = getReleaseAttachments();
  files.forEach((file) => attachments.push({
    name: file.name,
    url: URL.createObjectURL(file),
    kind: file.type.startsWith("image/") ? "image" : "file"
  }));
  renderReleaseAttachments();
}

function renderInstructionList() {
  const target = $("#instructionBody");
  const rows = getActiveInstructionRows();
  const statusAdjustable = ["指令待处理", "指令处理中", "待出库"].includes(activeReleaseStatus);
  const rowCodes = new Set(rows.map((row) => row.code));
  selectedDetailInstructionCodes.forEach((code) => {
    if (!rowCodes.has(code)) selectedDetailInstructionCodes.delete(code);
  });
  const selectedRows = rows.filter((row) => selectedDetailInstructionCodes.has(row.code));
  const selectedPendingRows = statusAdjustable ? selectedRows.filter((row) => (row.status || "待处理") === "待处理") : [];
  const selectAllControl = $("#instructionDetailSelectAll");
  selectAllControl.disabled = rows.length === 0;
  selectAllControl.checked = rows.length > 0 && rows.every((row) => selectedDetailInstructionCodes.has(row.code));
  selectAllControl.indeterminate = !selectAllControl.checked && selectedRows.length > 0;
  $("#instructionBatchComplete").hidden = !statusAdjustable;
  $("#instructionBatchComplete").disabled = selectedPendingRows.length === 0;
  if (!rows.length) {
    target.innerHTML = '<tr class="instruction-empty"><td colspan="13"><i>▤</i>暂无数据</td></tr>';
    return;
  }
  target.innerHTML = rows.map((row, index) => {
    const total = Number(row.price || 0) * Number(row.quantity || 1);
    const status = row.status || "待处理";
    const statusDisplay = statusAdjustable
      ? `<select class="instruction-detail-status ${status === "已处理" ? "is-complete" : "is-pending"}" data-instruction-index="${index}" aria-label="调整${row.name}的指令状态"><option value="待处理" ${status === "待处理" ? "selected" : ""}>待处理</option><option value="已处理" ${status === "已处理" ? "selected" : ""}>已处理</option></select>`
      : `<span class="instruction-detail-status-tag ${status === "已处理" ? "is-complete" : "is-pending"}">${status}</span>`;
    const operationControl = `<button class="instruction-edit" data-code="${row.code}" type="button">编辑</button><button class="instruction-delete" data-code="${row.code}" type="button">删除</button>`;
    const instructionCheck = `<input class="instruction-row-status-check" type="checkbox" data-code="${row.code}" aria-label="选择${row.name}" ${selectedDetailInstructionCodes.has(row.code) ? "checked" : ""} />`;
    return `<tr>
      <td class="instruction-check-col">${instructionCheck}</td><td>${row.name}</td><td>${row.type}</td><td>${row.unit}</td><td>${row.price}</td><td>${row.quantity || "1"}</td>
      <td>${row.currency}</td><td>${Number(total.toFixed(2))}</td><td>${row.addedAt}</td><td>${row.addedBy}</td>
      <td>${row.description}</td><td>${statusDisplay}</td><td>${operationControl}</td>
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
  $("#instructionPickerBody").innerHTML = displayRows.map((row) => {
    const alreadyAdded = row && instructionExistingCatalogCodes.has(row.code);
    const draft = row ? (instructionDraftValues.get(row.code) || { unit: row.unit, price: row.price, quantity: "1" }) : null;
    const disabled = alreadyAdded ? "disabled" : "";
    return `<tr>
    <td><input class="instruction-pick" type="checkbox" ${row ? `data-code="${row.code}"` : "disabled"} ${row && (instructionDraftCodes.has(row.code) || alreadyAdded) ? "checked" : ""} ${alreadyAdded ? 'disabled title="已添加"' : ""} /></td>
    <td>${row?.code || ""}</td><td>${row?.name || ""}</td><td>${row?.type || ""}</td>
    <td>${row ? `<select class="instruction-draft-unit" data-code="${row.code}" aria-label="${escapeHtml(row.name)}计费单位" ${disabled}><option value="票" ${draft.unit === "票" ? "selected" : ""}>票</option><option value="箱" ${draft.unit === "箱" ? "selected" : ""}>箱</option><option value="KG" ${draft.unit === "KG" ? "selected" : ""}>KG</option></select>` : ""}</td>
    <td>${row ? `<input class="instruction-draft-price" data-code="${row.code}" type="number" min="0" step="any" value="${escapeHtml(draft.price)}" aria-label="${escapeHtml(row.name)}计费单价" ${disabled} />` : ""}</td>
    <td>${row ? `<input class="instruction-draft-quantity" data-code="${row.code}" type="number" min="0" step="any" value="${escapeHtml(draft.quantity)}" aria-label="${escapeHtml(row.name)}计费数量" ${disabled} />` : ""}</td>
    <td>${row?.currency || ""}</td><td>${row?.description || ""}</td>
  </tr>`;
  }).join("");
  const availableCodes = instructionCatalog.filter((row) => !instructionExistingCatalogCodes.has(row.code)).map((row) => row.code);
  $("#instructionSelectAll").checked = availableCodes.length > 0 && availableCodes.every((code) => instructionDraftCodes.has(code));
  $("#instructionSelectAll").disabled = availableCodes.length === 0;
  $("#instructionSelectedCount").textContent = `已选中${instructionDraftCodes.size}条`;
}

function openInstructionPicker() {
  const existing = getActiveInstructionRows();
  instructionExistingCatalogCodes = new Set(existing.map((row) => row.catalogCode).filter(Boolean));
  instructionDraftCodes = new Set();
  instructionDraftValues.clear();
  instructionCatalog.forEach((row) => {
    const existingRow = existing.find((item) => item.catalogCode === row.code);
    instructionDraftValues.set(row.code, {
      unit: existingRow?.unit || row.unit,
      price: existingRow?.price || row.price,
      quantity: existingRow?.quantity || "1"
    });
  });
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
let activeReleaseSourceRow = null;
let activeReleaseReadOnly = false;
let activeReleaseStatus = "暂存";
let activeReleaseOrderType = "放货";
const selectedDetailInstructionCodes = new Set();
let selectedCargoBoxIndices = new Set();

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

const marketplaceReleaseTypes = new Set(["Walmart", "Tiktok"]);

function isMarketplaceRelease() {
  return marketplaceReleaseTypes.has($("#releaseApplication").value);
}

function isPrivateAddressRelease() {
  return $("#releaseApplication").value === "私人地址";
}

function updateReleaseTextCount(inputSelector, countSelector) {
  $(countSelector).textContent = String($(inputSelector).value.length);
}

function updateReleaseApplicationFields() {
  const marketplace = isMarketplaceRelease();
  const privateAddress = isPrivateAddressRelease();
  $("#marketplaceAddressTitle").hidden = !marketplace;
  document.querySelectorAll(".fba-release-field").forEach((field) => { field.hidden = marketplace || privateAddress; });
  document.querySelectorAll(".marketplace-release-field").forEach((field) => { field.hidden = !marketplace; });
  document.querySelectorAll(".private-release-field").forEach((field) => { field.hidden = !privateAddress; });
  $("#releaseApplication").disabled = activeReleaseReadOnly;
  document.querySelectorAll(".fba-release-field input, .fba-release-field select, .fba-release-field button").forEach((control) => {
    control.disabled = activeReleaseReadOnly || marketplace || privateAddress;
  });
  document.querySelectorAll(".marketplace-release-field input, .marketplace-release-field select, .marketplace-release-field button").forEach((control) => {
    control.disabled = activeReleaseReadOnly || !marketplace;
  });
  document.querySelectorAll(".private-release-field input, .private-release-field select, .private-release-field button, .private-release-field textarea").forEach((control) => {
    control.disabled = activeReleaseReadOnly || !privateAddress;
  });
  releaseOverlay.classList.toggle("private-address-mode", privateAddress);
  $("#instructionSection").hidden = false;
  updateReleaseShippingState();
}

function updateReleaseShippingState() {
  const shippingToggle = $("#releaseShippingToggle");
  const releaseFields = $("#releaseFields");
  const compactOrderMode = activeReleaseOrderType !== "放货" || activeReleaseStatus === "审批拒绝";
  const destroyOrderMode = activeReleaseOrderType === "销毁";
  shippingToggle.hidden = activeReleaseReadOnly;
  releaseFields.classList.toggle("shipping-disabled", compactOrderMode);
  shippingToggle.querySelectorAll("input").forEach((control) => {
    control.disabled = activeReleaseReadOnly;
  });
  document.querySelectorAll(".ship-out-conditional").forEach((field) => { field.hidden = !compactOrderMode; });
  $("#releaseDestroyBoxNoField").hidden = !compactOrderMode || !destroyOrderMode;
  if (!compactOrderMode) {
    $("#releaseShipOutBoxes").value = "";
    $("#releaseDestroyBoxNo").value = "";
    $("#releaseShipOutRemark").value = "";
    $("#shipOutUploadName").textContent = "";
  }
  releaseFields.querySelectorAll("input, select, button, textarea").forEach((control) => {
    if (control.closest(".release-shipping-toggle")) return;
    if (control.closest(".ship-out-conditional")) {
      control.disabled = activeReleaseReadOnly || !compactOrderMode;
      return;
    }
    if (compactOrderMode) control.disabled = true;
  });
  $("#releaseDestroyBoxNo").disabled = activeReleaseReadOnly || !compactOrderMode || !destroyOrderMode;
  $("#releaseShipOutBoxes").required = compactOrderMode && !activeReleaseReadOnly;
  $("#releaseDestroyBoxNo").required = destroyOrderMode && compactOrderMode && !activeReleaseReadOnly;
}

function setReleaseDrawerMode(readOnly, status) {
  activeReleaseReadOnly = readOnly;
  activeReleaseStatus = status;
  updateReleaseApplicationFields();
  $("#releaseConfirm").hidden = readOnly;
  $("#releaseCancel").textContent = readOnly ? "关闭" : "取消";
  $("#instructionAdd").hidden = false;
  $("#instructionBatchComplete").hidden = !["指令待处理", "指令处理中", "待出库"].includes(status);
  $("#cargoBoxSection").hidden = false;
  releaseForm.classList.toggle("release-readonly", readOnly);
}

function openReleaseDrawer(sourceRow, options = {}) {
  const row = normalizeReleaseRow(sourceRow);
  const readOnly = Boolean(options.readOnly);
  const sourceStatus = options.status || activeStatus;
  activeReleaseRow = row;
  activeReleaseSourceRow = sourceRow;
  activeReleaseOrderType = sourceStatus === "审批拒绝" ? "不放货" : getReleaseType(row);
  selectedDetailInstructionCodes.clear();
  ensureInstructionDetailRows(sourceRow);
  releaseForm.reset();
  const sourceApplication = row.releaseApplication || row.applicationType;
  const mappedApplication = sourceApplication === "其他地址" ? "私人地址" : sourceApplication;
  $("#releaseApplication").value = marketplaceReleaseTypes.has(mappedApplication) || mappedApplication === "私人地址" ? mappedApplication : "FBA";
  document.querySelector(`input[name="releaseOrderType"][value="${activeReleaseOrderType}"]`).checked = true;
  $("#releaseShipOutBoxes").value = row.shipOutBoxes || "";
  $("#releaseDestroyBoxNo").value = row.destroyBoxNo || "";
  $("#releaseShipOutRemark").value = row.shipOutRemark || "";
  $("#shipOutUploadName").textContent = "";
  $("#releaseShipOutFile").value = "";
  $("#releaseContainer").textContent = row.container;
  $("#releaseDispatch").textContent = row.dispatch;
  $("#releasePallet").textContent = row.pallet;
  $("#releaseTransfer").textContent = row.transfer;
  $("#releaseUnsent").textContent = row.unsent;
  $("#releaseBoxes").max = Math.max(1, row.unsent);
  $("#releaseMarketplaceBoxes").max = Math.max(1, row.unsent);
  $("#releasePrivateBoxes").max = Math.max(1, row.unsent);
  $("#releaseShipOutBoxes").max = Math.max(1, row.unsent);
  $("#releaseBoxes").placeholder = "请输入";
  $("#releaseBoxes").setCustomValidity("");
  $("#releaseMarketplaceBoxes").setCustomValidity("");
  $("#releasePrivateBoxes").setCustomValidity("");
  $("#releaseShipOutBoxes").setCustomValidity("");
  $("#releaseMethod").value = [...$("#releaseMethod").options].some((option) => option.value === row.dispatch) ? row.dispatch : "Truck-Amazon";
  const destination = $("#releaseDestination");
  destination.value = [...destination.options].some((option) => option.value === row.destination) ? row.destination : "";
  $("#releaseShipment").value = row.shipmentId;
  $("#releaseReference").value = row.referenceId;
  $("#releaseBoxes").value = readOnly ? String(Math.max(0, row.unsent)) : "";
  $("#releaseMarketplaceBoxes").value = readOnly ? String(Math.max(0, row.unsent)) : "";
  $("#releaseDate").value = (row.scheduledShippingTime || row.time || "").slice(0, 10);
  $("#releasePrivateDate").value = (row.scheduledShippingTime || "").slice(0, 10);
  $("#releaseRemark").value = row.customerRemark || "";
  $("#releaseWarehouseRemark").value = row.warehouseRemark || "";
  $("#privateUploadName").textContent = "";
  updateReleaseTextCount("#releaseAddressDetail", "#releaseAddressCount");
  updateReleaseTextCount("#releaseOverseasRemark", "#releaseRemarkCount");
  setReleaseDrawerMode(readOnly, sourceStatus);
  $("#releaseTitle").textContent = readOnly ? "运单详情" : "下单";
  releaseOverlay.hidden = false;
  document.body.classList.add("release-open");
  $("#releaseForm").insertBefore($("#cargoBoxSection"), $("#drawerAttachmentSection"));
  renderCargoBoxRows(row);
  renderReleaseAttachments();
  renderInstructionList();
  if (!readOnly) requestAnimationFrame(() => (isMarketplaceRelease() ? $("#releaseWarehouseCode") : isPrivateAddressRelease() ? $("#releasePrivateDispatch") : destination).focus());
}

function closeReleaseDrawer() {
  releaseOverlay.hidden = true;
  $("#instructionOverlay").hidden = true;
  $("#instructionEditOverlay").hidden = true;
  $("#instructionDeleteOverlay").hidden = true;
  document.body.classList.remove("release-open");
  activeReleaseRow = null;
  activeReleaseSourceRow = null;
  selectedDetailInstructionCodes.clear();
  selectedCargoBoxIndices.clear();
  activeReleaseReadOnly = false;
  activeReleaseStatus = "暂存";
  activeReleaseOrderType = "放货";
  releaseForm.reset();
  $("#releaseAttachmentList").replaceChildren();
  $("#shipOutUploadName").textContent = "";
  $("#releaseShipOutFile").value = "";
  $("#releaseDestroyBoxNo").value = "";
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
// Cargo box checkbox delegation
$("#cargoBoxBody").addEventListener("change", (event) => {
  const checkbox = event.target.closest(".cargo-box-check");
  if (!checkbox) return;
  const index = Number(checkbox.dataset.index);
  if (checkbox.checked) {
    selectedCargoBoxIndices.add(index);
  } else {
    selectedCargoBoxIndices.delete(index);
  }
  // Re-render to keep select-all in sync
  if (activeReleaseRow) renderCargoBoxRows(activeReleaseRow);
});
$("#cargoBoxSection").addEventListener("change", (event) => {
  if (!event.target.matches("#cargoBoxSelectAll")) return;
  const rows = activeReleaseRow ? getCargoBoxRows(activeReleaseRow) : [];
  if (event.target.checked) {
    rows.forEach((_, i) => selectedCargoBoxIndices.add(i));
  } else {
    selectedCargoBoxIndices.clear();
  }
  if (activeReleaseRow) renderCargoBoxRows(activeReleaseRow);
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
  const draftUnit = event.target.closest(".instruction-draft-unit");
  const draftPrice = event.target.closest(".instruction-draft-price");
  const draftQuantity = event.target.closest(".instruction-draft-quantity");
  const draftControl = draftUnit || draftPrice || draftQuantity;
  if (draftControl?.dataset.code) {
    const row = instructionCatalog.find((item) => item.code === draftControl.dataset.code);
    if (!row) return;
    const draft = instructionDraftValues.get(row.code) || { unit: row.unit, price: row.price, quantity: "1" };
    if (draftUnit) draft.unit = draftUnit.value;
    if (draftPrice) draft.price = draftPrice.value;
    if (draftQuantity) draft.quantity = draftQuantity.value;
    instructionDraftValues.set(row.code, draft);
    return;
  }
  const checkbox = event.target.closest(".instruction-pick");
  if (!checkbox || !checkbox.dataset.code) return;
  checkbox.checked ? instructionDraftCodes.add(checkbox.dataset.code) : instructionDraftCodes.delete(checkbox.dataset.code);
  renderInstructionPicker();
});
$("#instructionPickerBody").addEventListener("input", (event) => {
  const control = event.target.closest(".instruction-draft-price, .instruction-draft-quantity");
  if (!control?.dataset.code) return;
  const row = instructionCatalog.find((item) => item.code === control.dataset.code);
  if (!row) return;
  const draft = instructionDraftValues.get(row.code) || { unit: row.unit, price: row.price, quantity: "1" };
  if (control.classList.contains("instruction-draft-price")) draft.price = control.value;
  if (control.classList.contains("instruction-draft-quantity")) draft.quantity = control.value;
  instructionDraftValues.set(row.code, draft);
});
$("#instructionPickerBody").addEventListener("focusout", (event) => {
  const control = event.target.closest(".instruction-draft-price, .instruction-draft-quantity");
  if (!control?.dataset.code || control.value.trim()) return;
  const row = instructionCatalog.find((item) => item.code === control.dataset.code);
  if (!row) return;
  const draft = instructionDraftValues.get(row.code) || { unit: row.unit, price: row.price, quantity: "1" };
  if (control.classList.contains("instruction-draft-price")) draft.price = row.price;
  if (control.classList.contains("instruction-draft-quantity")) draft.quantity = "1";
  control.value = control.classList.contains("instruction-draft-price") ? draft.price : draft.quantity;
  instructionDraftValues.set(row.code, draft);
});
$("#instructionSelectAll").addEventListener("change", (event) => {
  instructionDraftCodes = event.target.checked
    ? new Set(instructionCatalog.filter((row) => !instructionExistingCatalogCodes.has(row.code)).map((row) => row.code))
    : new Set();
  renderInstructionPicker();
});
$("#instructionConfirm").addEventListener("click", () => {
  if (!activeReleaseRow) return;
  if (!instructionDraftCodes.size) {
    window.alert("请先选择需要新增的指令");
    return;
  }
  const existingRows = getActiveInstructionRows();
  const detailKey = getInstructionDetailKey(activeReleaseRow);
  const createdAt = Date.now();
  const addedRows = instructionCatalog
    .filter((row) => instructionDraftCodes.has(row.code))
    .map((row, index) => {
      const draft = instructionDraftValues.get(row.code) || { unit: row.unit, price: row.price, quantity: "1" };
      return {
        ...row,
        catalogCode: row.code,
        code: `${detailKey}-NEW-${createdAt}-${index + 1}`,
        unit: draft.unit || row.unit,
        price: String(draft.price).trim() || row.price,
        quantity: String(draft.quantity).trim() || "1",
        addedAt: "2026-07-25 14:00:00",
        addedBy: "天朗（付豪）",
        remark: "",
        images: [],
        status: "待处理"
      };
    });
  const rows = [...existingRows, ...addedRows];
  instructionRowsByInventory.set(detailKey, rows);
  syncInstructionDetails(detailKey, rows);
  closeInstructionPicker();
  renderInstructionList();
  renderRows();
});

$("#instructionBody").addEventListener("click", (event) => {
  const uploadButton = event.target.closest(".instruction-image-upload");
  const removeImageButton = event.target.closest(".instruction-image-remove");
  const remarkButton = event.target.closest(".instruction-remark-edit");
  const editButton = event.target.closest(".instruction-edit");
  const deleteButton = event.target.closest(".instruction-delete");
  if (uploadButton) {
    const input = event.target.closest("td")?.querySelector(`.instruction-image-input[data-code="${CSS.escape(uploadButton.dataset.code)}"]`);
    input?.click();
    return;
  }
  if (removeImageButton) {
    const row = getActiveInstructionRows().find((item) => item.code === removeImageButton.dataset.code);
    const imageIndex = Number(removeImageButton.dataset.imageIndex);
    const image = row?.images?.[imageIndex];
    if (!row || !image) return;
    if (String(image.url).startsWith("blob:")) URL.revokeObjectURL(image.url);
    row.images.splice(imageIndex, 1);
    renderInstructionList();
    return;
  }
  if (remarkButton) {
    const row = getActiveInstructionRows().find((item) => item.code === remarkButton.dataset.code);
    if (!row) return;
    editingRemarkInstructionCode = row.code;
    $("#instructionRemarkTitle").textContent = row.remark ? "修改备注" : "备注";
    $("#instructionRemarkText").value = row.remark || "";
    $("#instructionRemarkOverlay").hidden = false;
    requestAnimationFrame(() => $("#instructionRemarkText").focus());
    return;
  }
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

$("#instructionBody").addEventListener("change", (event) => {
  const imageInput = event.target.closest(".instruction-image-input");
  if (imageInput) {
    const row = getActiveInstructionRows().find((item) => item.code === imageInput.dataset.code);
    if (!row) return;
    const files = [...(imageInput.files || [])];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) window.alert("只能上传图片文件");
    const remaining = Math.max(0, 9 - row.images.length);
    if (imageFiles.length > remaining) window.alert(`每条指令最多上传9张图片，本次仅添加前${remaining}张`);
    imageFiles.slice(0, remaining).forEach((file) => {
      row.images.push({ name: file.name, url: URL.createObjectURL(file) });
    });
    imageInput.value = "";
    renderInstructionList();
    return;
  }
  const checkbox = event.target.closest(".instruction-row-status-check");
  if (checkbox) {
    checkbox.checked ? selectedDetailInstructionCodes.add(checkbox.dataset.code) : selectedDetailInstructionCodes.delete(checkbox.dataset.code);
    renderInstructionList();
    return;
  }
  const control = event.target.closest(".instruction-detail-status");
  if (!control || !activeReleaseRow || !["指令待处理", "指令处理中", "待出库"].includes(activeReleaseStatus)) return;
  const instructionIndex = Number(control.dataset.instructionIndex);
  const rows = getActiveInstructionRows();
  const instruction = rows[instructionIndex];
  if (!instruction) return;
  instruction.status = control.value;
  if (control.value === "已处理") selectedDetailInstructionCodes.delete(instruction.code);
  syncInstructionStatus(getInstructionDetailKey(activeReleaseRow), instructionIndex, control.value);
  renderInstructionList();
  renderRows();
});

$("#instructionDetailSelectAll").addEventListener("change", (event) => {
  getActiveInstructionRows().forEach((row) => {
    event.target.checked ? selectedDetailInstructionCodes.add(row.code) : selectedDetailInstructionCodes.delete(row.code);
  });
  renderInstructionList();
});

$("#instructionBatchRemark")?.addEventListener("click", () => {
  if (!selectedDetailInstructionCodes.size) return;
  $("#instructionBatchRemarkCount").textContent = String(selectedDetailInstructionCodes.size);
  $("#instructionBatchRemarkText").value = "";
  document.querySelector('input[name="instructionBatchRemarkMode"][value="append"]').checked = true;
  $("#instructionBatchRemarkOverlay").hidden = false;
  requestAnimationFrame(() => $("#instructionBatchRemarkText").focus());
});

$("#instructionBatchRemarkCancel").addEventListener("click", () => {
  $("#instructionBatchRemarkOverlay").hidden = true;
});

$("#instructionBatchRemarkConfirm").addEventListener("click", () => {
  const remark = $("#instructionBatchRemarkText").value.trim();
  const mode = document.querySelector('input[name="instructionBatchRemarkMode"]:checked')?.value || "append";
  if (mode === "append" && !remark) {
    window.alert("请输入需要追加的备注内容");
    return;
  }
  getActiveInstructionRows().forEach((row) => {
    if (!selectedDetailInstructionCodes.has(row.code)) return;
    row.remark = mode === "append" && row.remark ? `${row.remark}\n${remark}` : remark;
  });
  $("#instructionBatchRemarkOverlay").hidden = true;
  renderInstructionList();
});

$("#instructionRemarkCancel").addEventListener("click", () => {
  $("#instructionRemarkOverlay").hidden = true;
  editingRemarkInstructionCode = "";
});

$("#instructionRemarkConfirm").addEventListener("click", () => {
  const row = getActiveInstructionRows().find((item) => item.code === editingRemarkInstructionCode);
  if (!row) return;
  row.remark = $("#instructionRemarkText").value.trim();
  $("#instructionRemarkOverlay").hidden = true;
  editingRemarkInstructionCode = "";
  renderInstructionList();
});

$("#instructionDownloadImages")?.addEventListener("click", () => {
  const images = getActiveInstructionRows().flatMap((row) => selectedDetailInstructionCodes.has(row.code)
    ? (row.images || []).map((image, index) => ({ ...image, code: row.code, index }))
    : []);
  if (!images.length) {
    window.alert("所选指令暂无可下载图片");
    return;
  }
  images.forEach((image) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${image.code}-${image.index + 1}-${image.name}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
});

$("#instructionBatchComplete").addEventListener("click", () => {
  if (!activeReleaseRow || !["指令待处理", "指令处理中", "待出库"].includes(activeReleaseStatus) || !selectedDetailInstructionCodes.size) return;
  const rows = getActiveInstructionRows();
  const detailKey = getInstructionDetailKey(activeReleaseRow);
  rows.forEach((instruction, index) => {
    if (!selectedDetailInstructionCodes.has(instruction.code) || instruction.status === "已处理") return;
    instruction.status = "已处理";
    syncInstructionStatus(detailKey, index, "已处理");
  });
  selectedDetailInstructionCodes.clear();
  renderInstructionList();
  renderRows();
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
  const detailKey = getInstructionDetailKey(activeReleaseRow);
  instructionRowsByInventory.set(detailKey, rows);
  syncInstructionDetails(detailKey, rows);
  $("#instructionEditOverlay").hidden = true;
  editingInstructionCode = "";
  renderInstructionList();
  renderRows();
});
$("#instructionDeleteCancel").addEventListener("click", () => {
  $("#instructionDeleteOverlay").hidden = true;
  deletingInstructionCode = "";
});
$("#instructionDeleteConfirm").addEventListener("click", () => {
  if (!activeReleaseRow || !deletingInstructionCode) return;
  const deletingRow = getActiveInstructionRows().find((row) => row.code === deletingInstructionCode);
  deletingRow?.images?.forEach((image) => {
    if (String(image.url).startsWith("blob:")) URL.revokeObjectURL(image.url);
  });
  const detailKey = getInstructionDetailKey(activeReleaseRow);
  const remainingRows = getActiveInstructionRows().filter((row) => row.code !== deletingInstructionCode);
  instructionRowsByInventory.set(detailKey, remainingRows);
  syncInstructionDetails(detailKey, remainingRows);
  $("#instructionDeleteOverlay").hidden = true;
  deletingInstructionCode = "";
  renderInstructionList();
  renderRows();
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
  } else if (!$("#instructionBatchRemarkOverlay").hidden) {
    $("#instructionBatchRemarkOverlay").hidden = true;
  } else if (!$("#instructionRemarkOverlay").hidden) {
    $("#instructionRemarkOverlay").hidden = true;
    editingRemarkInstructionCode = "";
  } else if (!$("#instructionOverlay").hidden) {
    closeInstructionPicker();
  } else if (!releaseOverlay.hidden) {
    closeReleaseDrawer();
  }
});
$("#uploadButton").addEventListener("click", () => $("#releaseFile").click());
$("#releaseFile").addEventListener("change", (event) => {
  addReleaseAttachments([...(event.target.files || [])]);
  event.target.value = "";
});
$("#drawerAttachmentButton").addEventListener("click", () => $("#drawerAttachmentFile").click());
$("#drawerAttachmentFile").addEventListener("change", (event) => {
  addReleaseAttachments([...(event.target.files || [])]);
  event.target.value = "";
});
$("#releaseApplication").addEventListener("change", () => {
  updateReleaseApplicationFields();
  requestAnimationFrame(() => (isMarketplaceRelease() ? $("#releaseWarehouseCode") : isPrivateAddressRelease() ? $("#releasePrivateDispatch") : $("#releaseDestination")).focus());
});
document.querySelectorAll('input[name="releaseOrderType"]').forEach((control) => {
  control.addEventListener("change", (event) => {
    activeReleaseOrderType = event.target.value;
    updateReleaseApplicationFields();
    if (activeReleaseOrderType === "放货") {
      requestAnimationFrame(() => (isMarketplaceRelease() ? $("#releaseWarehouseCode") : isPrivateAddressRelease() ? $("#releasePrivateDispatch") : $("#releaseDestination")).focus());
    }
  });
});
$("#releaseAddressDetail").addEventListener("input", () => updateReleaseTextCount("#releaseAddressDetail", "#releaseAddressCount"));
$("#releaseOverseasRemark").addEventListener("input", () => updateReleaseTextCount("#releaseOverseasRemark", "#releaseRemarkCount"));
$("#privateUploadButton").addEventListener("click", () => $("#releasePrivateFile").click());
$("#releasePrivateFile").addEventListener("change", (event) => {
  addReleaseAttachments([...(event.target.files || [])]);
  $("#privateUploadName").textContent = event.target.files[0]?.name || "";
  event.target.value = "";
});
$("#shipOutUploadButton").addEventListener("click", () => $("#releaseShipOutFile").click());
$("#releaseShipOutFile").addEventListener("change", (event) => {
  const files = [...(event.target.files || [])];
  addReleaseAttachments(files);
  $("#shipOutUploadName").textContent = files.map((f) => f.name).join("、") || "";
  event.target.value = "";
});
releaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (activeReleaseReadOnly) {
    closeReleaseDrawer();
    return;
  }
  if (!releaseForm.reportValidity() || !activeReleaseRow) return;
  activeReleaseRow.releaseType = activeReleaseOrderType;
  activeReleaseRow.shippingEnabled = activeReleaseOrderType === "放货";
  if (activeReleaseSourceRow) {
    activeReleaseSourceRow.releaseType = activeReleaseOrderType;
    activeReleaseSourceRow.shippingEnabled = activeReleaseOrderType === "放货";
  }
  if (activeReleaseOrderType !== "放货") {
    const boxesControl = $("#releaseShipOutBoxes");
    const boxes = Number(boxesControl.value);
    if (boxes > activeReleaseRow.unsent) {
      boxesControl.setCustomValidity(`箱数不能超过未发货箱数 ${activeReleaseRow.unsent}`);
      boxesControl.reportValidity();
      return;
    }
    boxesControl.setCustomValidity("");
    activeReleaseRow.shipOutBoxes = boxesControl.value;
    activeReleaseRow.destroyBoxNo = $("#releaseDestroyBoxNo").value.trim();
    activeReleaseRow.shipOutRemark = $("#releaseShipOutRemark").value;
    if (activeReleaseSourceRow) {
      activeReleaseSourceRow.shipOutBoxes = boxesControl.value;
      activeReleaseSourceRow.destroyBoxNo = $("#releaseDestroyBoxNo").value.trim();
      activeReleaseSourceRow.shipOutRemark = $("#releaseShipOutRemark").value;
    }
    closeReleaseDrawer();
    return;
  }
  const boxesControl = isPrivateAddressRelease()
    ? $("#releasePrivateBoxes")
    : isMarketplaceRelease()
      ? $("#releaseMarketplaceBoxes")
      : $("#releaseBoxes");
  const boxes = Number(boxesControl.value);
  if (boxes > activeReleaseRow.unsent) {
    boxesControl.setCustomValidity(`箱数不能超过未发货箱数 ${activeReleaseRow.unsent}`);
    boxesControl.reportValidity();
    return;
  }
  boxesControl.setCustomValidity("");
  activeReleaseRow.customerRemark = $("#releaseRemark").value.trim();
  activeReleaseRow.warehouseRemark = $("#releaseWarehouseRemark").value.trim();
  closeReleaseDrawer();
});
$("#releaseBoxes").addEventListener("input", () => $("#releaseBoxes").setCustomValidity(""));
$("#releaseMarketplaceBoxes").addEventListener("input", () => $("#releaseMarketplaceBoxes").setCustomValidity(""));
$("#releasePrivateBoxes").addEventListener("input", () => $("#releasePrivateBoxes").setCustomValidity(""));
$("#releaseShipOutBoxes").addEventListener("input", () => $("#releaseShipOutBoxes").setCustomValidity(""));
$("#releaseDestroyBoxNo").addEventListener("input", () => $("#releaseDestroyBoxNo").setCustomValidity(""));

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
