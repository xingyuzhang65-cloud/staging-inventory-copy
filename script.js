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

document.querySelectorAll(".status-tab[data-status]").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.status !== activeStatus && !confirmDiscardInstructionStatusDrafts()) return;
    document.querySelectorAll(".status-tab[data-status]").forEach((item) => item.classList.remove("active"));
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
  return Array.from({ length: count }, (_, index) => {
    const boxIndex = index + 1;
    const key = `${getInstructionDetailKey(row)}::${boxIndex}`;
    const systemBoxNo = row.system && row.system !== "/" ? `${row.system}-${String(boxIndex).padStart(4, "0")}` : `${row.container}-${String(boxIndex).padStart(4, "0")}`;
    const lengthCm = 22 + (row.id % 3);
    const widthCm = 23 + (boxIndex % 4);
    const heightCm = 5 + (row.id % 4);
    const customerWeight = Number((1.7 + (row.id % 4) * 0.2 + (boxIndex % 2) * 0.1).toFixed(1));
    const materialWeight = Number(((lengthCm * widthCm * heightCm) / 6000).toFixed(1));
    const actualWeight = Number(Math.max(0.1, customerWeight - 0.1).toFixed(1));
    return {
      key,
      systemBoxNo,
      customerData: `${customerWeight} KG / ${lengthCm}*${widthCm}*${heightCm} CM`,
      pickingData: `材重 ${materialWeight} KG / 实重 ${actualWeight} KG`,
      boxStatus: getCargoBoxStatus(row, index)
    };
  });
}

function getCargoBoxStatus(row, index) {
  if (row.status === "已出库") return "已出库";
  if (["指令处理中", "待出库"].includes(row.status)) return "处理中";
  return ["待处理", "处理中", "已出库"][index % 3];
}

function getCargoBoxStatusClass(status) {
  return {
    "待处理": "is-pending",
    "处理中": "is-processing",
    "已出库": "is-shipped"
  }[status] || "is-pending";
}

function isCargoBoxSelectable(box) {
  return box.boxStatus === "待处理";
}

function getSelectedCargoBoxes(row) {
  if (!row.selectedCargoBoxes) row.selectedCargoBoxes = [];
  return new Set(row.selectedCargoBoxes);
}

function setSelectedCargoBoxes(row, selectedBoxes) {
  row.selectedCargoBoxes = [...selectedBoxes];
}

function renderCargoBoxRows(row) {
  if (!row) return;
  const selectedBoxes = getSelectedCargoBoxes(row);
  const statusOrder = { "待处理": 0, "处理中": 1, "已出库": 2 };
  const rows = getCargoBoxRows(row).sort((a, b) => (statusOrder[a.boxStatus] ?? 9) - (statusOrder[b.boxStatus] ?? 9));
  rows.forEach((box) => {
    if (!isCargoBoxSelectable(box)) selectedBoxes.delete(box.key);
  });
  setSelectedCargoBoxes(row, selectedBoxes);
  $("#cargoBoxBody").innerHTML = rows.length ? rows.map((box) => `<tr data-cargo-key="${escapeHtml(box.key)}">
    <td class="cargo-box-check-col"><input class="cargo-box-check" type="checkbox" data-cargo-key="${escapeHtml(box.key)}" ${selectedBoxes.has(box.key) ? "checked" : ""} ${isCargoBoxSelectable(box) ? "" : "disabled"} aria-label="选择货箱 ${escapeHtml(box.systemBoxNo)}" /></td>
    <td class="cargo-box-code">${escapeHtml(box.systemBoxNo)}</td>
    <td>${escapeHtml(box.customerData)}</td>
    <td>${escapeHtml(box.pickingData)}</td>
  </tr>`).join("") : `<tr class="cargo-box-empty"><td colspan="4">暂无货箱数据</td></tr>`;
  const selectAll = $("#cargoBoxSelectAll");
  if (selectAll) {
    const selectableRows = rows.filter(isCargoBoxSelectable);
    selectAll.checked = selectableRows.length > 0 && selectableRows.every((box) => selectedBoxes.has(box.key));
    selectAll.indeterminate = selectableRows.some((box) => selectedBoxes.has(box.key)) && !selectAll.checked;
    selectAll.disabled = selectableRows.length === 0;
  }
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
  if (!rows.length) {
    target.innerHTML = '<tr class="instruction-empty"><td colspan="11"><i>▤</i>暂无数据</td></tr>';
    return;
  }
  target.innerHTML = rows.map((row) => {
    const total = Number(row.price || 0) * Number(row.quantity || 1);
    const operationControl = `<button class="instruction-edit" data-code="${row.code}" type="button">编辑</button><button class="instruction-delete" data-code="${row.code}" type="button">删除</button>`;
    return `<tr>
      <td>${row.name}</td><td>${row.type}</td><td>${row.unit}</td><td>${row.price}</td><td>${row.quantity || "1"}</td>
      <td>${row.currency}</td><td>${Number(total.toFixed(2))}</td><td>${row.addedAt}</td><td>${row.addedBy}</td>
      <td>${row.description}</td><td>${operationControl}</td>
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

function getExistingInstructionForCatalog(existingRows, catalogCode) {
  return existingRows.find((row) => row.catalogCode === catalogCode || row.code === catalogCode);
}

function getInstructionDraftValue(row) {
  return instructionDraftValues.get(row.code) || {
    unit: row.unit,
    price: row.price,
    quantity: "1",
    currency: row.currency
  };
}

function formatLocalDateTime() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function renderInstructionDropdown() {
  const dropdown = $("#instructionDropdown");
  const rows = getFilteredInstructionCatalog().filter((row) => !instructionDraftCodes.has(row.code));
  dropdown.innerHTML = `<option value="">请选择要添加的指令</option>${rows.map((row) =>
    `<option value="${escapeHtml(row.code)}">${escapeHtml(row.name)}（${escapeHtml(row.code)}）</option>`
  ).join("")}`;
  dropdown.disabled = rows.length === 0;
  $("#instructionAddSelected").disabled = true;
}

function renderInstructionPicker() {
  renderInstructionDropdown();
  const selectedCodes = [...instructionDraftCodes];
  if (!selectedCodes.length) {
    $("#instructionPickerBody").innerHTML = '<tr class="instruction-picker-empty"><td colspan="8">暂未选择指令，请从上方下拉框中选择并添加</td></tr>';
  } else {
    $("#instructionPickerBody").innerHTML = selectedCodes.map((code) => {
      const row = instructionCatalog.find((item) => item.code === code);
      if (!row) return "";
      const draft = getInstructionDraftValue(row);
      return `<tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.type)}</td>
        <td><select class="instruction-draft-field" data-draft-field="unit" data-code="${escapeHtml(row.code)}">
          <option value="票" ${draft.unit === "票" ? "selected" : ""}>票</option>
          <option value="箱" ${draft.unit === "箱" ? "selected" : ""}>箱</option>
          <option value="KG" ${draft.unit === "KG" ? "selected" : ""}>KG</option>
        </select></td>
        <td><input class="instruction-draft-field" data-draft-field="price" data-code="${escapeHtml(row.code)}" type="number" min="0" step="any" value="${escapeHtml(draft.price)}" /></td>
        <td><input class="instruction-draft-field" data-draft-field="quantity" data-code="${escapeHtml(row.code)}" type="number" min="0" step="any" value="${escapeHtml(draft.quantity)}" /></td>
        <td><select class="instruction-draft-field" data-draft-field="currency" data-code="${escapeHtml(row.code)}">
          <option value="人民币" ${draft.currency === "人民币" ? "selected" : ""}>人民币</option>
          <option value="USD" ${draft.currency === "USD" ? "selected" : ""}>USD</option>
        </select></td>
        <td>${escapeHtml(row.description)}</td>
        <td><button class="instruction-picker-remove" data-code="${escapeHtml(row.code)}" type="button">移除</button></td>
      </tr>`;
    }).join("");
  }
  $("#instructionSelectedCount").innerHTML = `已选中 <strong>${instructionDraftCodes.size}</strong> 条指令`;
  $("#instructionCatalogCount").textContent = `共 ${instructionCatalog.length} 条可选`;
}

function openInstructionPicker() {
  const existing = getActiveInstructionRows();
  instructionExistingCatalogCodes = new Set(existing.map((row) => row.catalogCode || row.code).filter(Boolean));
  instructionDraftCodes = new Set([...instructionExistingCatalogCodes].filter((code) => instructionCatalog.some((row) => row.code === code)));
  instructionDraftValues.clear();
  instructionCatalog.forEach((row) => {
    const existingRow = getExistingInstructionForCatalog(existing, row.code);
    instructionDraftValues.set(row.code, {
      unit: existingRow?.unit || row.unit,
      price: existingRow?.price || row.price,
      quantity: existingRow?.quantity || "1",
      currency: existingRow?.currency || row.currency
    });
  });
  $("#instructionSearchName").value = "";
  $("#instructionSearchType").value = "";
  $("#instructionDropdown").value = "";
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
$("#cargoBoxBody").addEventListener("change", (event) => {
  const checkbox = event.target.closest(".cargo-box-check");
  if (!checkbox || !activeReleaseRow) return;
  const selectedBoxes = getSelectedCargoBoxes(activeReleaseRow);
  checkbox.checked ? selectedBoxes.add(checkbox.dataset.cargoKey) : selectedBoxes.delete(checkbox.dataset.cargoKey);
  setSelectedCargoBoxes(activeReleaseRow, selectedBoxes);
  renderCargoBoxRows(activeReleaseRow);
});
$("#cargoBoxSelectAll").addEventListener("change", (event) => {
  if (!activeReleaseRow) return;
  const selectedBoxes = event.target.checked
    ? new Set(getCargoBoxRows(activeReleaseRow).filter(isCargoBoxSelectable).map((box) => box.key))
    : new Set();
  setSelectedCargoBoxes(activeReleaseRow, selectedBoxes);
  renderCargoBoxRows(activeReleaseRow);
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
$("#instructionDropdown").addEventListener("change", (event) => {
  $("#instructionAddSelected").disabled = !event.target.value;
});
$("#instructionAddSelected").addEventListener("click", () => {
  const code = $("#instructionDropdown").value;
  if (!code) return;
  instructionDraftCodes.add(code);
  $("#instructionDropdown").value = "";
  renderInstructionPicker();
});
$("#instructionPickerBody").addEventListener("click", (event) => {
  const removeButton = event.target.closest(".instruction-picker-remove");
  if (!removeButton) return;
  instructionDraftCodes.delete(removeButton.dataset.code);
  renderInstructionPicker();
});
$("#instructionPickerBody").addEventListener("input", (event) => {
  const control = event.target.closest(".instruction-draft-field");
  if (!control?.dataset.code) return;
  const row = instructionCatalog.find((item) => item.code === control.dataset.code);
  if (!row) return;
  const draft = getInstructionDraftValue(row);
  draft[control.dataset.draftField] = control.value;
  instructionDraftValues.set(row.code, draft);
});
$("#instructionPickerBody").addEventListener("change", (event) => {
  const control = event.target.closest(".instruction-draft-field");
  if (!control?.dataset.code) return;
  const row = instructionCatalog.find((item) => item.code === control.dataset.code);
  if (!row) return;
  const draft = getInstructionDraftValue(row);
  draft[control.dataset.draftField] = control.value;
  if (control.dataset.draftField === "price" && !control.value.trim()) {
    control.value = row.price;
    draft.price = row.price;
  }
  if (control.dataset.draftField === "quantity" && !control.value.trim()) {
    control.value = "1";
    draft.quantity = "1";
  }
  instructionDraftValues.set(row.code, draft);
});
$("#instructionConfirm").addEventListener("click", () => {
  if (!activeReleaseRow) return;
  const existingRows = getActiveInstructionRows();
  const detailKey = getInstructionDetailKey(activeReleaseRow);
  const createdAt = Date.now();
  const addedAt = formatLocalDateTime();
  const rows = instructionCatalog.filter((row) => instructionDraftCodes.has(row.code)).map((row, index) => {
      const draft = getInstructionDraftValue(row);
      const existingRow = getExistingInstructionForCatalog(existingRows, row.code);
      return {
        ...row,
        catalogCode: row.code,
        code: existingRow?.code || `${detailKey}-NEW-${createdAt}-${index + 1}`,
        unit: draft.unit || row.unit,
        price: String(draft.price).trim() || row.price,
        quantity: String(draft.quantity).trim() || "1",
        currency: String(draft.currency || row.currency).trim() || row.currency,
        addedAt,
        addedBy: "天朗（付豪）",
        remark: existingRow?.remark || "",
        images: existingRow?.images || [],
        status: existingRow?.status || "待处理"
      };
    });
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

$("#instructionDetailSelectAll")?.addEventListener("change", (event) => {
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

$("#instructionBatchComplete")?.addEventListener("click", () => {
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

const interceptStatusOrder = ["待处理", "拦截中", "拦截成功", "拦截失败", "已取消"];
const interceptStatusLabel = {
  待处理: "待处理",
  拦截中: "拦截中",
  拦截成功: "拦截成功",
  拦截失败: "拦截失败",
  已取消: "已取消"
};
const interceptStatusClass = {
  待处理: "is-pending",
  拦截中: "is-processing",
  拦截成功: "is-success",
  拦截失败: "is-failed",
  已取消: "is-canceled"
};
const interceptTasks = [
  {
    id: 1, no: "202608040001", waybill: "2", container: "WEMA1131231", system: "/", customer: "TTTX", warehouse: "美仓1号仓",
    cargoStatus: "未拆柜", inventoryStatus: "待拆柜", outboundStatus: "未出库", boxes: 11,
    status: "待处理", reason: "客户调整运输计划，申请暂缓出库", attachment: "拦截申请-20260804-01.pdf", remark: "等待客户确认新运输计划",
    applicant: "客服-张敏", appliedAt: "2026-08-04 09:18:22", handler: "", handleAt: "", failReason: "", actualBoxes: "", storageNo: "", resultRemark: "",
    logs: [{ time: "2026-08-04 09:18:22", user: "客服-张敏", action: "提交申请", change: "- → 待处理", note: "客户申请拦截" }]
  },
  {
    id: 2, no: "202608040002", waybill: "US0601", container: "MSCU7654321", system: "MSCU7654321-260701", customer: "ABC-US", warehouse: "美仓1号仓",
    cargoStatus: "已拆柜", inventoryStatus: "已入库", outboundStatus: "未出库", boxes: 4,
    status: "待处理", reason: "订单信息异常，客户要求暂缓处理", attachment: "-", remark: "请仓库优先确认货物位置",
    applicant: "客服-刘洋", appliedAt: "2026-08-04 10:06:15", handler: "", handleAt: "", failReason: "", actualBoxes: "", storageNo: "", resultRemark: "",
    logs: [{ time: "2026-08-04 10:06:15", user: "客服-刘洋", action: "提交申请", change: "- → 待处理", note: "订单信息待客户复核" }]
  },
  {
    id: 3, no: "202608030015", waybill: "88", container: "8889990", system: "8889990-250623", customer: "23", warehouse: "美仓1号仓",
    cargoStatus: "已拆柜", inventoryStatus: "已入库", outboundStatus: "未出库", boxes: 5,
    status: "拦截中", reason: "客户申请暂停出库", attachment: "客户邮件截图.png", remark: "仓库正在核对货物位置",
    applicant: "客服-张敏", appliedAt: "2026-08-03 15:20:31", handler: "仓库-李明", handleAt: "2026-08-03 15:34:06", failReason: "", actualBoxes: "", storageNo: "", resultRemark: "",
    logs: [
      { time: "2026-08-03 15:20:31", user: "客服-张敏", action: "提交申请", change: "- → 待处理", note: "客户调整出库计划" },
      { time: "2026-08-03 15:34:06", user: "仓库-李明", action: "确认拦截", change: "待处理 → 拦截中", note: "货物已入库，创建仓库拦截任务" }
    ]
  },
  {
    id: 4, no: "202608020009", waybill: "111", container: "CCCA1414141", system: "CCCA1414141-240411", customer: "TTTX", warehouse: "美仓1号仓",
    cargoStatus: "暂存中", inventoryStatus: "暂存", outboundStatus: "未出库", boxes: 2,
    status: "拦截成功", reason: "客户要求货物转入暂存", attachment: "拦截申请单.pdf", remark: "后续等待客户重新下单",
    applicant: "客服-周悦", appliedAt: "2026-08-02 11:03:44", handler: "仓库-王强", handleAt: "2026-08-02 13:46:20", failReason: "", actualBoxes: "2", storageNo: "STG202608020001", resultRemark: "货物已转入 A02-03 暂存库位",
    logs: [
      { time: "2026-08-02 11:03:44", user: "客服-周悦", action: "提交申请", change: "- → 待处理", note: "客户申请进入暂存" },
      { time: "2026-08-02 11:14:18", user: "仓库-王强", action: "确认拦截", change: "待处理 → 拦截中", note: "货物已入库" },
      { time: "2026-08-02 13:46:20", user: "仓库-王强", action: "拦截成功", change: "拦截中 → 拦截成功", note: "实际拦截 2 箱，已生成暂存单 STG202608020001" }
    ]
  },
  {
    id: 5, no: "202608010004", waybill: "72", container: "TLLU2026072", system: "TLLU2026072-260715", customer: "23", warehouse: "美仓1号仓",
    cargoStatus: "已出库", inventoryStatus: "无库存", outboundStatus: "已出库", boxes: 3,
    status: "拦截失败", reason: "客户临时要求取消发货", attachment: "-", remark: "", applicant: "客服-刘洋", appliedAt: "2026-08-01 16:32:09", handler: "系统", handleAt: "2026-08-01 16:32:10", failReason: "货物已完成出库", actualBoxes: "", storageNo: "", resultRemark: "",
    logs: [
      { time: "2026-08-01 16:32:09", user: "客服-刘洋", action: "提交申请", change: "- → 待处理", note: "客户要求取消发货" },
      { time: "2026-08-01 16:32:10", user: "系统", action: "状态校验", change: "待处理 → 拦截失败", note: "货物已完成出库，无法执行拦截" }
    ]
  },
  {
    id: 6, no: "202607310018", waybill: "2", container: "AAAA0000000", system: "AAAA0000000-241109", customer: "TTTX", warehouse: "美仓1号仓",
    cargoStatus: "已拆柜", inventoryStatus: "已入库", outboundStatus: "未出库", boxes: 4,
    status: "已取消", reason: "客户申请暂停发货", attachment: "-", remark: "客户已自行调整订单", applicant: "客服-周悦", appliedAt: "2026-07-31 09:11:48", handler: "客服-周悦", handleAt: "2026-07-31 09:32:24", failReason: "", actualBoxes: "", storageNo: "", resultRemark: "客户主动取消申请",
    logs: [
      { time: "2026-07-31 09:11:48", user: "客服-周悦", action: "提交申请", change: "- → 待处理", note: "客户申请暂停发货" },
      { time: "2026-07-31 09:32:24", user: "客服-周悦", action: "取消申请", change: "待处理 → 已取消", note: "客户主动取消" }
    ]
  }
];

let interceptActiveTab = "全部";
let interceptVisibleRows = [];
let selectedInterceptIds = new Set();
let activeInterceptId = null;
let interceptDetailMode = "view";
let interceptFeedbackMode = "";
let interceptCancelContext = { mode: "single", taskId: null };
let interceptRemarkContext = null;

const interceptPage = $("#interceptPage");
const inventoryPage = $("#inventoryPage");
const interceptTableBody = $("#interceptTableBody");
const interceptFilters = {
  no: $("#interceptNoFilter"),
  waybill: $("#interceptWaybillFilter"),
  container: $("#interceptContainerFilter"),
  system: $("#interceptSystemFilter"),
  customer: $("#interceptCustomerFilter"),
  warehouse: $("#interceptWarehouseFilter"),
  cargoStatus: $("#interceptCargoStatusFilter"),
  status: $("#interceptStatusFilter"),
  dateFrom: $("#interceptDateFrom"),
  dateTo: $("#interceptDateTo")
};

function getInterceptTask(id = activeInterceptId) {
  return interceptTasks.find((task) => task.id === Number(id));
}

function getInterceptStatusTag(status) {
  return `<span class="intercept-status ${interceptStatusClass[status] || "is-pending"}">${escapeHtml(interceptStatusLabel[status] || status)}</span>`;
}

function getInterceptCargoTag(status) {
  const extraClass = status === "已出库" ? " is-outbound" : status === "暂存中" ? " is-storage" : "";
  return `<span class="intercept-cargo-status${extraClass}">${escapeHtml(status)}</span>`;
}

const interceptAttachmentDownloadCache = new Map();

function getInterceptAttachmentItems(task) {
  if (!task) return [];
  if (Array.isArray(task.attachments) && task.attachments.length) {
    return task.attachments.map((item, index) => {
      if (!item) return null;
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name, url: getInterceptAttachmentUrl(task, name) } : null;
      }
      const name = String(item.name || item.filename || `附件${index + 1}`).trim();
      if (!name) return null;
      const url = String(item.url || "").trim() || getInterceptAttachmentUrl(task, name);
      return { name, url };
    }).filter(Boolean);
  }
  const raw = String(task.attachment || "").trim();
  if (!raw || raw === "-") return [];
  return [{ name: raw, url: getInterceptAttachmentUrl(task, raw) }];
}

function getInterceptAttachmentUrl(task, name) {
  const key = `${task.id || task.no}::${name}`;
  if (!interceptAttachmentDownloadCache.has(key)) {
    const blob = new Blob([
      `拦截单号: ${task.no}\n`,
      `拦截原因: ${task.reason || "-"}\n`,
      `附件名称: ${name}\n`
    ], { type: "text/plain;charset=utf-8" });
    interceptAttachmentDownloadCache.set(key, URL.createObjectURL(blob));
  }
  return interceptAttachmentDownloadCache.get(key);
}

function renderInterceptAttachments(task) {
  const items = getInterceptAttachmentItems(task);
  if (!items.length) return "-";
  return `<div class="intercept-attachment-links">${items.map((item) => `<a class="intercept-attachment-link" href="${escapeHtml(item.url)}" download="${escapeHtml(item.name)}" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</a>`).join("")}</div>`;
}

function getInterceptCargoBoxSource(task) {
  const boxes = Math.max(1, Number(task.actualBoxes || task.boxes || 1));
  return {
    ...task,
    boxes,
    unsent: boxes,
    status: task.cargoStatus === "已出库" || task.status === "拦截失败" ? "已出库" : "待出库"
  };
}

function renderInterceptCargoBoxes(task) {
  const source = getInterceptCargoBoxSource(task);
  const rows = getCargoBoxRows(source).sort((a, b) => (a.systemBoxNo || "").localeCompare(b.systemBoxNo || ""));
  $("#interceptCargoBoxBody").innerHTML = rows.map((box) => `<tr>
    <td class="cargo-box-code">${escapeHtml(box.systemBoxNo)}</td>
    <td>${escapeHtml(box.customerData)}</td>
    <td>${escapeHtml(box.pickingData)}</td>
  </tr>`).join("");
}

function renderInterceptLog(task) {
  $("#interceptLogTitle").textContent = "查看日志";
  $("#interceptLogBody").innerHTML = task.logs.map((log) => {
    const [before = "-", after = "-"] = String(log.change || "- → -").split("→").map((item) => item.trim());
    return `<tr>
      <td title="${escapeHtml(log.note || log.action)}">${escapeHtml(log.action)}</td>
      <td title="${escapeHtml(before)}">${escapeHtml(before)}</td>
      <td title="${escapeHtml(after)}">${escapeHtml(after)}</td>
      <td>${escapeHtml(log.user)}</td>
      <td>${escapeHtml(log.time)}</td>
    </tr>`;
  }).join("");
}

function formatInterceptDate(value) {
  return String(value || "").slice(0, 10);
}

function renderInterceptStatusTabs() {
  document.querySelectorAll("[data-intercept-status]").forEach((tab) => {
    const status = tab.dataset.interceptStatus;
    const count = status === "全部" ? interceptTasks.length : interceptTasks.filter((task) => task.status === status).length;
    const label = status === "拦截成功" ? "成功" : status === "拦截失败" ? "失败" : status === "已取消" ? "取消" : status;
    tab.textContent = `${label}(${count})`;
    tab.classList.toggle("active", status === interceptActiveTab);
  });
}

function getFilteredInterceptTasks() {
  const no = interceptFilters.no.value.trim().toLowerCase();
  const waybill = interceptFilters.waybill.value.trim().toLowerCase();
  const container = interceptFilters.container.value.trim().toLowerCase();
  const system = interceptFilters.system.value.trim().toLowerCase();
  const from = interceptFilters.dateFrom.value;
  const to = interceptFilters.dateTo.value;
  return interceptTasks.filter((task) => (
    (interceptActiveTab === "全部" || task.status === interceptActiveTab)
    && (!no || task.no.toLowerCase().includes(no))
    && (!waybill || task.waybill.toLowerCase().includes(waybill))
    && (!container || (task.container || "").toLowerCase().includes(container))
    && (!system || (task.system || "").toLowerCase().includes(system))
    && (!interceptFilters.customer.value || task.customer === interceptFilters.customer.value)
    && (!interceptFilters.warehouse.value || task.warehouse === interceptFilters.warehouse.value)
    && (!interceptFilters.cargoStatus.value || task.cargoStatus === interceptFilters.cargoStatus.value)
    && (!interceptFilters.status.value || task.status === interceptFilters.status.value)
    && (!from || formatInterceptDate(task.appliedAt) >= from)
    && (!to || formatInterceptDate(task.appliedAt) <= to)
  ));
}

function getVisibleSelectableInterceptTasks() {
  return interceptVisibleRows;
}

function getVisiblePendingInterceptTasks() {
  return interceptVisibleRows.filter((task) => task.status === "待处理");
}

function getSelectedPendingInterceptTasks() {
  return [...selectedInterceptIds]
    .map((id) => getInterceptTask(id))
    .filter((task) => task?.status === "待处理");
}

function pruneInterceptSelection() {
  const visibleSelectableIds = new Set(getVisibleSelectableInterceptTasks().map((task) => task.id));
  selectedInterceptIds = new Set([...selectedInterceptIds].filter((id) => visibleSelectableIds.has(id)));
}

function updateInterceptBatchControls() {
  const isPendingView = interceptActiveTab === "待处理";
  const isInterceptingView = interceptActiveTab === "拦截中";
  const selectableRows = getVisibleSelectableInterceptTasks();
  const selectedCount = selectableRows.filter((task) => selectedInterceptIds.has(task.id)).length;
  const selectAll = $("#interceptSelectAll");
  const cancelButton = $("#interceptBatchCancelButton");
  const confirmButton = $("#interceptBatchConfirmButton");
  const successButton = $("#interceptBatchSuccessButton");
  const failureButton = $("#interceptBatchFailureButton");
  const noteButton = $("#interceptBatchNoteButton");
  const exportButton = $("#interceptBatchExportButton");

  cancelButton.hidden = !isPendingView;
  confirmButton.hidden = !isPendingView;
  successButton.hidden = !isInterceptingView;
  failureButton.hidden = !isInterceptingView;
  noteButton.hidden = false;
  exportButton.hidden = false;

  cancelButton.disabled = selectedCount === 0;
  confirmButton.disabled = selectedCount === 0;
  successButton.disabled = selectedCount === 0;
  failureButton.disabled = selectedCount === 0;
  noteButton.disabled = selectedCount === 0;
  exportButton.disabled = selectedCount === 0;

  selectAll.disabled = selectableRows.length === 0;
  selectAll.checked = selectableRows.length > 0 && selectedCount === selectableRows.length;
  selectAll.indeterminate = selectedCount > 0 && selectedCount < selectableRows.length;
}

function renderInterceptRows() {
  renderInterceptStatusTabs();
  interceptVisibleRows = getFilteredInterceptTasks();
  pruneInterceptSelection();
  $("#interceptListSummary").textContent = `共 ${interceptVisibleRows.length} 条拦截任务`;
  if (!interceptVisibleRows.length) {
    interceptTableBody.innerHTML = '<tr class="intercept-empty"><td colspan="17">暂无匹配的拦截任务</td></tr>';
  } else {
    interceptTableBody.innerHTML = interceptVisibleRows.map((task) => {
      const primaryAction = (task.status === "待处理" || task.status === "拦截中") ? '<button class="intercept-action" data-intercept-action="handle" type="button">处理</button>' : "";
      const remarkAction = task.status !== "已取消" ? '<button class="intercept-action" data-intercept-action="remark" type="button">备注</button>' : "";
      const checked = selectedInterceptIds.has(task.id) ? " checked" : "";
      const disabled = "";
      const boxCount = escapeHtml(task.actualBoxes || task.boxes || "-");
      return `<tr data-intercept-id="${task.id}">
        <td class="intercept-check"><input class="intercept-row-check" type="checkbox" data-intercept-id="${task.id}" aria-label="选择${escapeHtml(task.no)}"${checked}${disabled} /></td>
        <td title="${escapeHtml(task.no)}">${escapeHtml(task.no)}</td><td title="${escapeHtml(task.waybill)}">${escapeHtml(task.waybill)}</td><td title="${escapeHtml(task.container || "-")}">${escapeHtml(task.container || "-")}</td><td title="${escapeHtml(task.system || "-")}">${escapeHtml(task.system || "-")}</td><td>${escapeHtml(task.customer)}</td><td>${escapeHtml(task.warehouse)}</td>
        <td>${getInterceptCargoTag(task.cargoStatus)}</td><td>${getInterceptStatusTag(task.status)}</td><td title="${escapeHtml(task.reason)}">${escapeHtml(task.reason)}</td><td>${renderInterceptAttachments(task)}</td><td>${boxCount}</td>
        <td>${escapeHtml(task.applicant)}</td><td>${escapeHtml(task.appliedAt)}</td><td>${escapeHtml(task.handler || "-")}</td><td>${escapeHtml(task.handleAt || "-")}</td>
        <td><button class="intercept-action" data-intercept-action="detail" type="button">详情</button>${primaryAction}${remarkAction}<button class="intercept-action" data-intercept-action="log" type="button">日志</button></td>
      </tr>`;
    }).join("");
  }
  updateInterceptBatchControls();
  $("#interceptTableFooter").innerHTML = `<span>共 ${interceptVisibleRows.length} 条</span><button type="button">‹</button><button class="active" type="button">1</button><button type="button">›</button><select><option>50 条/页</option></select>`;
}

function addInterceptLog(task, action, previousStatus, note, user = "仓库-李明") {
  const now = formatLocalDateTime();
  task.logs.push({
    time: now,
    user,
    action,
    change: `${previousStatus || "-"} → ${task.status}`,
    note
  });
  task.handler = user;
  task.handleAt = now;
}

function renderInterceptDetail(task, mode = "view") {
  $("#interceptDetailTitle").textContent = `拦截详情 · ${task.no}`;
  $("#interceptDetailSubTitle").innerHTML = `${getInterceptStatusTag(task.status)} <span>${escapeHtml(task.waybill)}</span>`;

  const stepLabels = ["提交申请", "确认拦截", "仓库处理中", task.status === "拦截失败" ? "拦截失败" : task.status === "已取消" ? "已取消" : "完成"];
  const currentStep = task.status === "待处理" ? 0 : task.status === "拦截中" ? 2 : 3;
  $("#interceptFlow").innerHTML = stepLabels.map((label, index) => {
    const isComplete = index < currentStep || (currentStep === 3 && index === 3 && task.status === "拦截成功");
    const isActive = index === currentStep;
    return `<div class="intercept-flow-step${isComplete ? " is-complete" : ""}${isActive ? " is-active" : ""}"><i>${isComplete ? "✓" : index + 1}</i><span>${label}</span></div>`;
  }).join("");

  const field = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  $("#interceptBasicInfo").innerHTML = [
    field("拦截单号", escapeHtml(task.no)),
    field("入仓号", escapeHtml(task.waybill)),
    field("柜号", escapeHtml(task.container || "-")),
    field("系统柜号", escapeHtml(task.system || "-")),
    field("客户名称", escapeHtml(task.customer)),
    field("拦截原因", escapeHtml(task.reason)),
    field("附件", renderInterceptAttachments(task)),
    field("拦截箱数", `${escapeHtml(task.actualBoxes || task.boxes || "-")} 箱`),
    field("货物状态", getInterceptCargoTag(task.cargoStatus)),
    field("所在仓库", escapeHtml(task.warehouse)),
    field("出库状态", escapeHtml(task.outboundStatus)),
    field("申请人", escapeHtml(task.applicant)),
    field("申请时间", escapeHtml(task.appliedAt)),
    field("备注", `${escapeHtml(task.remark || "-")}<button class="intercept-action" data-detail-action="editRemark" type="button" title="编辑备注" style="margin-left:6px">✎</button>`)
  ].join("");
  renderInterceptCargoBoxes(task);

  const actions = mode === "process"
    ? task.status === "待处理"
      ? '<button class="btn" data-detail-action="cancel" type="button">取消申请</button><button class="btn primary" data-detail-action="confirm" type="button">确认拦截</button>'
      : task.status === "拦截中"
        ? '<button class="btn" data-detail-action="failure" type="button">拦截失败</button><button class="btn primary" data-detail-action="success" type="button">拦截成功</button>'
        : task.status === "拦截成功"
          ? '<button class="btn primary" data-detail-action="storage" type="button">查看暂存详情</button>'
          : ""
    : "";
  $("#interceptDetailActions").innerHTML = `<button class="btn" data-detail-action="close" type="button">关闭</button>${actions}`;
}

function openInterceptDetail(id, mode = "view") {
  const task = getInterceptTask(id);
  if (!task) return;
  activeInterceptId = task.id;
  interceptDetailMode = mode;
  renderInterceptDetail(task, mode);
  $("#interceptDetailOverlay").hidden = false;
}

function openInterceptLog(id) {
  const task = getInterceptTask(id);
  if (!task) return;
  activeInterceptId = task.id;
  renderInterceptLog(task);
  $("#interceptLogOverlay").hidden = false;
}

function closeInterceptLog() {
  $("#interceptLogOverlay").hidden = true;
  activeInterceptId = null;
}

function closeInterceptDetail() {
  $("#interceptDetailOverlay").hidden = true;
  activeInterceptId = null;
  interceptDetailMode = "view";
}

function refreshInterceptUI() {
  renderInterceptRows();
  const task = getInterceptTask();
  if (task && !$("#interceptDetailOverlay").hidden) renderInterceptDetail(task, interceptDetailMode);
}

function applyInterceptConfirm(task) {
  if (!task || task.status !== "待处理") return false;
  const previousStatus = task.status;
  if (task.cargoStatus === "已出库") {
    task.status = "拦截失败";
    task.failReason = "货物已完成出库";
    task.resultRemark = "系统校验货物已完成出库，无法执行拦截";
    addInterceptLog(task, "状态校验", previousStatus, task.resultRemark, "系统");
    return true;
  }
  task.status = "拦截中";
  addInterceptLog(task, "确认拦截", previousStatus, task.cargoStatus === "未拆柜" ? "货物未拆柜，已创建预报拦截任务" : "货物已入库，已创建仓库拦截任务");
  return true;
}

function applyInterceptCancel(task, reason = "") {
  if (!task || task.status !== "待处理") return false;
  const previousStatus = task.status;
  task.status = "已取消";
  task.resultRemark = reason || "取消拦截申请";
  task.remark = task.remark ? `${task.remark}；取消原因：${reason}` : `取消原因：${reason}`;
  addInterceptLog(task, "取消申请", previousStatus, reason || "取消拦截申请", "客服-张敏");
  return true;
}

function confirmInterceptTask() {
  const task = getInterceptTask();
  if (!task || task.status !== "待处理") return;
  if (task.cargoStatus === "已出库") {
    applyInterceptConfirm(task);
    window.alert("货物已出库，无法执行拦截");
    refreshInterceptUI();
    return;
  }
  const prompt = task.cargoStatus === "未拆柜" ? "当前货物未拆柜，确认执行拦截？" : "当前货物已入库，确认执行拦截？";
  if (!window.confirm(prompt)) return;
  applyInterceptConfirm(task);
  refreshInterceptUI();
}

function cancelInterceptTask() {
  const task = getInterceptTask();
  if (!task || task.status !== "待处理") return;
  interceptCancelContext = { mode: "single", taskId: task.id };
  $("#interceptCancelReasonTitle").textContent = "取消拦截";
  $("#interceptCancelReasonText").value = "";
  $("#interceptCancelReasonOverlay").hidden = false;
  $("#interceptCancelReasonText").focus();
}

function confirmSelectedInterceptTasks() {
  const tasks = getSelectedPendingInterceptTasks();
  if (!tasks.length) {
    window.alert("请先选择待处理拦截申请");
    return;
  }
  const outboundCount = tasks.filter((task) => task.cargoStatus === "已出库").length;
  const message = outboundCount
    ? `确认批量确认选中的 ${tasks.length} 条拦截申请吗？其中 ${outboundCount} 条货物已出库，将自动标记为拦截失败。`
    : `确认批量确认选中的 ${tasks.length} 条拦截申请吗？`;
  if (!window.confirm(message)) return;
  tasks.forEach(applyInterceptConfirm);
  selectedInterceptIds.clear();
  refreshInterceptUI();
}

function cancelSelectedInterceptTasks() {
  const tasks = getSelectedPendingInterceptTasks();
  if (!tasks.length) {
    window.alert("请先选择待处理拦截申请");
    return;
  }
  interceptCancelContext = { mode: "batch", taskIds: tasks.map((t) => t.id) };
  $("#interceptCancelReasonTitle").textContent = `批量取消拦截（${tasks.length} 条）`;
  $("#interceptCancelReasonText").value = "";
  $("#interceptCancelReasonOverlay").hidden = false;
  $("#interceptCancelReasonText").focus();
}

function exportInterceptTasks() {
  const tasks = getVisibleSelectableInterceptTasks().filter((task) => selectedInterceptIds.has(task.id));
  if (!tasks.length) {
    window.alert("请先选择要导出的记录");
    return;
  }
  const headers = ["拦截单号", "入仓号", "柜号", "系统柜号", "客户名称", "仓库", "货物状态", "拦截状态", "拦截原因", "拦截箱数", "申请人", "申请时间", "处理人", "处理时间", "备注"];
  const rows = tasks.map((task) => [
    task.no, task.waybill, task.container || "", task.system || "", task.customer, task.warehouse,
    task.cargoStatus, task.status, task.reason, task.actualBoxes || task.boxes || "",
    task.applicant, task.appliedAt, task.handler || "", task.handleAt || "", task.remark || ""
  ]);
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `拦截管理_${interceptActiveTab}_${formatLocalDateTime().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function batchRemarkInterceptTasks() {
  const tasks = getVisibleSelectableInterceptTasks().filter((task) => selectedInterceptIds.has(task.id));
  if (!tasks.length) {
    window.alert("请先选择要备注的记录");
    return;
  }
  $("#interceptBatchNoteOverlay").hidden = false;
  $("#interceptBatchNoteText").value = "";
  $("#interceptBatchNoteText").focus();
}

function submitInterceptBatchNote(event) {
  event.preventDefault();
  const note = $("#interceptBatchNoteText").value.trim();
  if (!note) {
    window.alert("请输入备注内容");
    return;
  }
  const tasks = getVisibleSelectableInterceptTasks().filter((task) => selectedInterceptIds.has(task.id));
  tasks.forEach((task) => {
    const previousRemark = task.remark || "";
    task.remark = previousRemark ? `${previousRemark}；${note}` : note;
    addInterceptLog(task, "批量备注", task.status, note);
  });
  $("#interceptBatchNoteOverlay").hidden = true;
  selectedInterceptIds.clear();
  refreshInterceptUI();
}

function closeInterceptBatchNote() {
  $("#interceptBatchNoteOverlay").hidden = true;
}

function submitInterceptCancelReason(event) {
  event.preventDefault();
  const reason = $("#interceptCancelReasonText").value.trim();
  if (!reason) {
    window.alert("请输入取消原因");
    return;
  }
  if (interceptCancelContext.mode === "single") {
    const task = getInterceptTask(interceptCancelContext.taskId);
    if (task) applyInterceptCancel(task, reason);
  } else {
    const tasks = (interceptCancelContext.taskIds || []).map((id) => getInterceptTask(id)).filter(Boolean);
    tasks.forEach((task) => applyInterceptCancel(task, reason));
    selectedInterceptIds.clear();
  }
  $("#interceptCancelReasonOverlay").hidden = true;
  interceptCancelContext = { mode: "single", taskId: null };
  refreshInterceptUI();
}

function closeInterceptCancelReason() {
  $("#interceptCancelReasonOverlay").hidden = true;
  interceptCancelContext = { mode: "single", taskId: null };
}

function openInterceptRemark(taskId) {
  const task = getInterceptTask(taskId);
  if (!task || task.status === "已取消") return;
  interceptRemarkContext = task.id;
  $("#interceptRemarkTitle").textContent = "编辑备注";
  $("#interceptRemarkContext").textContent = `拦截单号：${task.no}`;
  $("#interceptRemarkText").value = task.remark || "";
  $("#interceptRemarkOverlay").hidden = false;
  $("#interceptRemarkText").focus();
}

function submitInterceptRemark(event) {
  event.preventDefault();
  if (!interceptRemarkContext) return;
  const task = getInterceptTask(interceptRemarkContext);
  if (!task) return;
  const remark = $("#interceptRemarkText").value.trim();
  const previousRemark = task.remark || "";
  task.remark = remark;
  addInterceptLog(task, "修改备注", task.status, `"${previousRemark || "-"}" → "${remark || "-"}"`);
  $("#interceptRemarkOverlay").hidden = true;
  interceptRemarkContext = null;
  refreshInterceptUI();
}

function closeInterceptRemark() {
  $("#interceptRemarkOverlay").hidden = true;
  interceptRemarkContext = null;
}

function getSelectedInterceptingTasks() {
  return [...selectedInterceptIds]
    .map((id) => getInterceptTask(id))
    .filter((task) => task?.status === "拦截中");
}

function batchInterceptSuccess() {
  const tasks = getSelectedInterceptingTasks();
  if (!tasks.length) {
    window.alert("请先选择拦截中的记录");
    return;
  }
  $("#interceptBatchSuccessTitle").textContent = "批量拦截成功";
  $("#interceptBatchSuccessSummary").textContent = `已选择 ${tasks.length} 条拦截中的记录，确认后将自动生成暂存单。`;
  $("#interceptBatchSuccessNote").value = "";
  $("#interceptBatchSuccessOverlay").hidden = false;
  $("#interceptBatchSuccessNote").focus();
}

function batchInterceptFailure() {
  const tasks = getSelectedInterceptingTasks();
  if (!tasks.length) {
    window.alert("请先选择拦截中的记录");
    return;
  }
  $("#interceptBatchFailureTitle").textContent = "批量拦截失败";
  $("#interceptBatchFailureSummary").textContent = `已选择 ${tasks.length} 条拦截中的记录，请填写失败原因。`;
  $("#interceptBatchFailureReason").value = "";
  $("#interceptBatchFailureNote").value = "";
  $("#interceptBatchFailureOverlay").hidden = false;
  $("#interceptBatchFailureReason").focus();
}

function submitInterceptBatchSuccess(event) {
  event.preventDefault();
  const tasks = getSelectedInterceptingTasks();
  if (!tasks.length) return;
  const note = $("#interceptBatchSuccessNote").value.trim();
  const user = "仓库-李明";
  tasks.forEach((task) => {
    const previousStatus = task.status;
    const actualBoxes = Number(task.actualBoxes || task.boxes);
    task.status = "拦截成功";
    task.cargoStatus = "暂存中";
    task.inventoryStatus = "暂存";
    task.outboundStatus = "未出库";
    task.actualBoxes = String(actualBoxes);
    task.storageNo = `STG${formatLocalDateTime().slice(0, 10).replaceAll("-", "")}${String(task.id).padStart(4, "0")}`;
    task.resultRemark = note || "已完成货物拦截并转入暂存";
    task.handler = user;
    task.handleAt = formatLocalDateTime();
    task.logs.push({
      time: formatLocalDateTime(),
      user,
      action: "拦截成功",
      change: `${previousStatus} → 拦截成功`,
      note: `实际拦截 ${actualBoxes} 箱，已生成暂存单 ${task.storageNo}${note ? `；${note}` : ""}`
    });
    createStorageFromIntercept(task);
  });
  $("#interceptBatchSuccessOverlay").hidden = true;
  selectedInterceptIds.clear();
  refreshInterceptUI();
}

function submitInterceptBatchFailure(event) {
  event.preventDefault();
  const tasks = getSelectedInterceptingTasks();
  if (!tasks.length) return;
  const failReason = $("#interceptBatchFailureReason").value.trim();
  if (!failReason) {
    window.alert("请填写失败原因");
    return;
  }
  const note = $("#interceptBatchFailureNote").value.trim();
  const user = "仓库-李明";
  tasks.forEach((task) => {
    const previousStatus = task.status;
    task.status = "拦截失败";
    task.failReason = failReason;
    task.resultRemark = note;
    task.handler = user;
    task.handleAt = formatLocalDateTime();
    task.logs.push({
      time: formatLocalDateTime(),
      user,
      action: "拦截失败",
      change: `${previousStatus} → 拦截失败`,
      note: `${failReason}${note ? `；${note}` : ""}`
    });
  });
  $("#interceptBatchFailureOverlay").hidden = true;
  selectedInterceptIds.clear();
  refreshInterceptUI();
}

function closeInterceptBatchSuccess() {
  $("#interceptBatchSuccessOverlay").hidden = true;
}

function closeInterceptBatchFailure() {
  $("#interceptBatchFailureOverlay").hidden = true;
}

function openInterceptFeedback(mode) {
  const task = getInterceptTask();
  if (!task || task.status !== "拦截中") return;
  interceptFeedbackMode = mode;
  const isSuccess = mode === "success";
  $("#interceptFeedbackTitle").textContent = isSuccess ? "确认拦截成功" : "确认拦截失败";
  $("#interceptFeedbackFields").innerHTML = isSuccess
    ? `<p>请确认实际拦截的货物数量。提交后系统将自动生成暂存单。</p><label><span class="required">实际拦截箱数</span><input id="interceptActualBoxes" type="number" min="1" max="${task.boxes}" value="${task.boxes}" required /></label><label><span>备注</span><textarea id="interceptFeedbackNote" maxlength="200" placeholder="请输入处理备注"></textarea></label>`
    : '<p>请填写无法完成拦截的原因，系统将保留处理记录。</p><label><span class="required">失败原因</span><textarea id="interceptFailReason" maxlength="200" required placeholder="例如：已出库、找不到货物、客户取消"></textarea></label><label><span>备注</span><textarea id="interceptFeedbackNote" maxlength="200" placeholder="请输入补充说明"></textarea></label>';
  $("#interceptFeedbackOverlay").hidden = false;
}

function createStorageFromIntercept(task) {
  if (!task.storageNo || inventoryRows.some((row) => row.pallet === task.storageNo)) return;
  const nextId = inventoryRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  inventoryRows.unshift({
    id: nextId,
    customer: task.customer,
    container: task.container || task.waybill,
    system: task.system || task.container || task.waybill,
    inbound: task.waybill,
    blocked: "是",
    transfer: "-",
    destination: "暂存库",
    dispatch: "-",
    pallet: task.storageNo,
    time: task.handleAt || formatLocalDateTime(),
    weight: 0,
    volume: 0,
    boxes: Number(task.actualBoxes || task.boxes),
    pending: 0,
    unsent: Number(task.actualBoxes || task.boxes),
    sent: 0,
    status: "暂存"
  });
}

function submitInterceptFeedback(event) {
  event.preventDefault();
  const task = getInterceptTask();
  if (!task || task.status !== "拦截中") return;
  const note = $("#interceptFeedbackNote")?.value.trim() || "";
  const previousStatus = task.status;
  if (interceptFeedbackMode === "success") {
    const actualBoxes = Number($("#interceptActualBoxes").value);
    if (!actualBoxes || actualBoxes < 1 || actualBoxes > task.boxes) {
      window.alert(`实际拦截箱数需在 1 到 ${task.boxes} 之间`);
      return;
    }
    task.status = "拦截成功";
    task.cargoStatus = "暂存中";
    task.inventoryStatus = "暂存";
    task.outboundStatus = "未出库";
    task.actualBoxes = String(actualBoxes);
    task.storageNo = `STG${formatLocalDateTime().slice(0, 10).replaceAll("-", "")}${String(task.id).padStart(4, "0")}`;
    task.resultRemark = note || "已完成货物拦截并转入暂存";
    addInterceptLog(task, "拦截成功", previousStatus, `实际拦截 ${actualBoxes} 箱，已生成暂存单 ${task.storageNo}${note ? `；${note}` : ""}`);
    createStorageFromIntercept(task);
  } else {
    const failReason = $("#interceptFailReason").value.trim();
    if (!failReason) {
      window.alert("请填写失败原因");
      return;
    }
    task.status = "拦截失败";
    task.failReason = failReason;
    task.resultRemark = note;
    addInterceptLog(task, "拦截失败", previousStatus, `${failReason}${note ? `；${note}` : ""}`);
  }
  $("#interceptFeedbackOverlay").hidden = true;
  refreshInterceptUI();
}

function showStagingInventory(status = activeStatus) {
  interceptPage.hidden = true;
  inventoryPage.hidden = false;
  $("#navInterceptManagement").classList.remove("active");
  $("#navStagingInventory").classList.add("active");
  $("#currentPageName").textContent = "暂存库存";
  document.title = "暂存库存 - 美仓海外仓系统";
  activeStatus = status;
  document.querySelectorAll(".status-tab").forEach((tab) => {
    if (tab.dataset.status) tab.classList.toggle("active", tab.dataset.status === activeStatus);
  });
  selected.clear();
  $("#filterCard").classList.toggle("approval-filter", isRequestTableView());
  $("#filterCard").classList.remove("approval-expanded", "collapsed");
  $("#collapseButton").innerHTML = isRequestTableView() ? "<span>⌄</span> 展开" : "<span>⌃</span> 收起";
  applyFilters();
}

function showInterceptManagement() {
  if (!confirmDiscardInstructionStatusDrafts()) return;
  inventoryPage.hidden = true;
  interceptPage.hidden = false;
  $("#navStagingInventory").classList.remove("active");
  $("#navInterceptManagement").classList.add("active");
  $("#currentPageName").textContent = "拦截管理";
  document.title = "拦截管理 - 美仓海外仓系统";
  renderInterceptRows();
}

function refreshInterceptFilterOptions() {
  const customer = interceptFilters.customer.value;
  const warehouse = interceptFilters.warehouse.value;
  interceptFilters.customer.innerHTML = '<option value="">全部客户</option>';
  interceptFilters.warehouse.innerHTML = '<option value="">全部仓库</option>';
  addOptions(interceptFilters.customer, interceptTasks.map((task) => task.customer));
  addOptions(interceptFilters.warehouse, interceptTasks.map((task) => task.warehouse));
  interceptFilters.customer.value = customer;
  interceptFilters.warehouse.value = warehouse;
}

function initInterceptManagement() {
  interceptTasks.filter((task) => task.status === "拦截成功").forEach(createStorageFromIntercept);
  refreshInterceptFilterOptions();
  renderInterceptRows();
  $("#navInterceptManagement").addEventListener("click", showInterceptManagement);
  $("#navStagingInventory").addEventListener("click", () => showStagingInventory(activeStatus));
  $("#interceptSearchButton").addEventListener("click", renderInterceptRows);
  $("#interceptBatchCancelButton").addEventListener("click", cancelSelectedInterceptTasks);
  $("#interceptBatchConfirmButton").addEventListener("click", confirmSelectedInterceptTasks);
  $("#interceptBatchSuccessButton").addEventListener("click", batchInterceptSuccess);
  $("#interceptBatchFailureButton").addEventListener("click", batchInterceptFailure);
  $("#interceptBatchNoteButton").addEventListener("click", batchRemarkInterceptTasks);
  $("#interceptBatchExportButton").addEventListener("click", exportInterceptTasks);
  $("#interceptSelectAll").addEventListener("change", (event) => {
    getVisibleSelectableInterceptTasks().forEach((task) => {
      if (event.currentTarget.checked) selectedInterceptIds.add(task.id);
      else selectedInterceptIds.delete(task.id);
    });
    renderInterceptRows();
  });
  $("#interceptResetButton").addEventListener("click", () => {
    Object.values(interceptFilters).forEach((control) => { control.value = ""; });
    selectedInterceptIds.clear();
    interceptActiveTab = "全部";
    renderInterceptRows();
  });
  Object.values(interceptFilters).forEach((control) => control.addEventListener("keydown", (event) => {
    if (event.key === "Enter") renderInterceptRows();
  }));
  document.querySelectorAll("[data-intercept-status]").forEach((tab) => tab.addEventListener("click", () => {
    selectedInterceptIds.clear();
    interceptActiveTab = tab.dataset.interceptStatus;
    renderInterceptRows();
  }));
  interceptTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".intercept-row-check");
    if (!checkbox) return;
    const id = Number(checkbox.dataset.interceptId);
    if (checkbox.checked) selectedInterceptIds.add(id);
    else selectedInterceptIds.delete(id);
    updateInterceptBatchControls();
  });
  interceptTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-intercept-action]");
    if (!button) return;
    const row = button.closest("[data-intercept-id]");
    const task = getInterceptTask(row?.dataset.interceptId);
    if (!task) return;
    const action = button.dataset.interceptAction;
    if (action === "storage") {
      createStorageFromIntercept(task);
      showStagingInventory("暂存");
      return;
    }
    if (action === "remark") {
      openInterceptRemark(task.id);
      return;
    }
    if (action === "log") {
      openInterceptLog(task.id);
      return;
    }
    if (action === "handle") {
      openInterceptDetail(task.id, "process");
      return;
    }
    openInterceptDetail(task.id);
  });
  $("#interceptDetailClose").addEventListener("click", closeInterceptDetail);
  $("#interceptDetailOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptDetailOverlay")) closeInterceptDetail();
  });
  $("#interceptDetailActions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-action]");
    if (!button) return;
    const action = button.dataset.detailAction;
    if (action === "close") closeInterceptDetail();
    if (action === "handle") openInterceptDetail(task.id, "process");
    if (action === "confirm") confirmInterceptTask();
    if (action === "cancel") cancelInterceptTask();
    if (action === "success" || action === "failure") openInterceptFeedback(action);
    if (action === "storage") {
      const task = getInterceptTask();
      if (task) createStorageFromIntercept(task);
      closeInterceptDetail();
      showStagingInventory("暂存");
    }
    if (action === "editRemark") {
      const task = getInterceptTask();
      if (task) openInterceptRemark(task.id);
    }
  });
  $("#interceptDetailOverlay").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-action]");
    if (!button || button.dataset.detailAction !== "editRemark") return;
    const task = getInterceptTask();
    if (task) openInterceptRemark(task.id);
  });
  $("#interceptLogClose").addEventListener("click", closeInterceptLog);
  $("#interceptLogOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptLogOverlay")) closeInterceptLog();
  });
  $("#interceptFeedbackClose").addEventListener("click", () => { $("#interceptFeedbackOverlay").hidden = true; });
  $("#interceptFeedbackCancel").addEventListener("click", () => { $("#interceptFeedbackOverlay").hidden = true; });
  $("#interceptFeedbackOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptFeedbackOverlay")) $("#interceptFeedbackOverlay").hidden = true;
  });
  $("#interceptFeedbackForm").addEventListener("submit", submitInterceptFeedback);
  $("#interceptBatchNoteClose").addEventListener("click", closeInterceptBatchNote);
  $("#interceptBatchNoteCancel").addEventListener("click", closeInterceptBatchNote);
  $("#interceptBatchNoteOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptBatchNoteOverlay")) closeInterceptBatchNote();
  });
  $("#interceptBatchNoteForm").addEventListener("submit", submitInterceptBatchNote);
  $("#interceptCancelReasonClose").addEventListener("click", closeInterceptCancelReason);
  $("#interceptCancelReasonCancel").addEventListener("click", closeInterceptCancelReason);
  $("#interceptCancelReasonOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptCancelReasonOverlay")) closeInterceptCancelReason();
  });
  $("#interceptCancelReasonForm").addEventListener("submit", submitInterceptCancelReason);
  $("#interceptRemarkClose").addEventListener("click", closeInterceptRemark);
  $("#interceptRemarkCancelBtn").addEventListener("click", closeInterceptRemark);
  $("#interceptRemarkOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptRemarkOverlay")) closeInterceptRemark();
  });
  $("#interceptRemarkForm").addEventListener("submit", submitInterceptRemark);
  $("#interceptBatchSuccessClose").addEventListener("click", closeInterceptBatchSuccess);
  $("#interceptBatchSuccessCancel").addEventListener("click", closeInterceptBatchSuccess);
  $("#interceptBatchSuccessOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptBatchSuccessOverlay")) closeInterceptBatchSuccess();
  });
  $("#interceptBatchSuccessForm").addEventListener("submit", submitInterceptBatchSuccess);
  $("#interceptBatchFailureClose").addEventListener("click", closeInterceptBatchFailure);
  $("#interceptBatchFailureCancel").addEventListener("click", closeInterceptBatchFailure);
  $("#interceptBatchFailureOverlay").addEventListener("click", (event) => {
    if (event.target === $("#interceptBatchFailureOverlay")) closeInterceptBatchFailure();
  });
  $("#interceptBatchFailureForm").addEventListener("submit", submitInterceptBatchFailure);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!$("#interceptRemarkOverlay").hidden) closeInterceptRemark();
    else if (!$("#interceptCancelReasonOverlay").hidden) closeInterceptCancelReason();
    else if (!$("#interceptBatchSuccessOverlay").hidden) closeInterceptBatchSuccess();
    else if (!$("#interceptBatchFailureOverlay").hidden) closeInterceptBatchFailure();
    else if (!$("#interceptBatchNoteOverlay").hidden) closeInterceptBatchNote();
    else if (!$("#interceptFeedbackOverlay").hidden) $("#interceptFeedbackOverlay").hidden = true;
    else if (!$("#interceptLogOverlay").hidden) closeInterceptLog();
    else if (!$("#interceptDetailOverlay").hidden) closeInterceptDetail();
  });
}

initInterceptManagement();
renderRows();
buildWatermarks();
