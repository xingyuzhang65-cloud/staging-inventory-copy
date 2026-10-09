import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const fields=fs.readFileSync(new URL('./returns-fields.js',import.meta.url),'utf8'),fieldsUrl='data:text/javascript;base64,'+Buffer.from(fields).toString('base64');
const imported=fs.readFileSync(new URL('./returns-import.js',import.meta.url),'utf8').replaceAll("'./returns-fields.js'",JSON.stringify(fieldsUrl));
const I=await import('data:text/javascript;base64,'+Buffer.from(imported).toString('base64'));
const M=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(new URL('./returns-model.js',import.meta.url),'utf8')).toString('base64'));
const F=await import(fieldsUrl),headers=I.TEMPLATE_FIELDS.map(f=>f.label);
const base={customer:M.CLIENTS[0].name,customerCode:M.CLIENTS[0].code,warehouse:M.WAREHOUSES[0],source:'客户预报'};
const row=(overrides={})=>Object.assign([base.customer,'蓝牙耳机','SKU-001','https://example.com/ear.jpg',10,0.2,'18×12×6',2,'TRACK-1','2026-10-02','2026-10-08',8,2,'清点后更换标签','海外代理退件区'],overrides);
test('pictured row-four headers preserve all fifteen template values and customer carry',()=>{
  const result=I.validateRows([['公司'],['English'],['退换货预报单'],headers,row(),row({0:'',1:'充电线',2:'SKU-002',4:5,8:'TRACK-1'}),['注意：请务必填写']]);
  assert.equal(result.total,2);assert.equal(result.errorCount,0);assert.equal(result.rows[1].customer,base.customer);
  const p=result.rows[0].product;assert.deepEqual(p.dimensions,[18,12,6]);assert.equal(p.requirement,'清点后更换标签');assert.equal(p.location,'海外代理退件区');assert.equal(p.reportedReceivedAt,'2026-10-08 00:00:00');assert.equal(p.reportedReceived,8);
});
test('shared tracking builds one multi-SKU package and reference inbound values never create stock',()=>{
  const result=I.validateRows([headers,row(),row({1:'充电线',2:'SKU-002',4:5})]),draft=I.buildOrderDraft(result,base),o=M.createOrder(draft);
  assert.equal(o.packages.length,1);assert.equal(o.packages[0].forecast,15);assert.equal(o.packages[0].items.length,2);
  assert.equal(o.status,'待受理');assert.equal(M.totals(o).inStock,0);assert.equal(o.receipts.length,0);assert.equal(o.products[0].reportedBoxes,2);
  M.editOrder(o,{...draft,products:draft.products.map(p=>({...p,requirement:'仅换标'}))});assert.equal(o.products[0].requirement,'仅换标');assert.equal(o.products[0].reportedReceived,8);
});
test('multiple tracking numbers retain the original product quantity without invented parcel allocation',()=>{
  const result=I.validateRows([headers,row({8:'TRACK-1；TRACK-2'})]),draft=I.buildOrderDraft(result,base);
  assert.equal(draft.products[0].quantity,10);assert.equal(draft.products[0].tracking,'TRACK-1；TRACK-2');assert.equal(draft.packages.length,0);
});
test('unknown owner forecasts stay unclaimed and create no actual inventory',()=>{
  const result=I.validateRows([headers,row({0:''})]),draft=I.buildOrderDraft(result,{...base,customer:'',customerCode:'',source:'国外代理反馈'}),o=M.createOrder(draft);
  assert.equal(o.customerCode,'');assert.equal(o.status,'待受理');assert.equal(M.totals(o).available,0);assert.equal(o.boxes.length,0);
});
test('invalid quantities, dates, duplicate SKU, formulas and customer conflicts block import',()=>{
  const result=I.validateRows([headers,row({4:1.5,9:'2026-02-30'}),row({0:'另一客户',5:{v:1,f:'1+1'}})]);
  assert.equal(result.errorCount,2);assert.ok(result.rows[0].errors.some(e=>e.includes('日期')));assert.ok(result.rows[1].errors.some(e=>e.includes('公式')));
  const valid=I.validateRows([headers,row({0:'另一客户'})]);assert.throws(()=>I.buildOrderDraft(valid,base),/客户名称/);
  assert.throws(()=>I.validateRows([['清货产品'],['产品名称','数量']]),/15 列/);
});
test('CSV quoting, actual Excel date cells, and the downloadable one-sheet template work',async()=>{
  const csv=[headers,row({13:'清点,换标\n核对SKU'})].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const bytes=new TextEncoder().encode(csv),result=await I.readImportFile({name:'退换货.csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer});assert.equal(result.errorCount,0);assert.equal(result.rows[0].product.requirement,'清点,换标\n核对SKU');
  assert.equal(I.validateRows([headers,row({9:{v:new Date('2026-10-02T00:00:00Z')},10:46303})]).errorCount,0);
  vm.runInThisContext(fs.readFileSync(new URL('./vendor/xlsx.full.min.js',import.meta.url),'utf8'));const template=fs.readFileSync(new URL('./退换货导入模板.xlsx',import.meta.url)),wb=XLSX.read(template,{type:'buffer',cellDates:true});assert.deepEqual(wb.SheetNames,['退换货-预报单']);
  assert.equal(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1})[3].length,15);
  await assert.rejects(()=>I.readImportFile({name:'退换货.xlsx',size:template.length,arrayBuffer:async()=>template.buffer.slice(template.byteOffset,template.byteOffset+template.byteLength)}),/未找到产品数据/);
});
test('metadata migration preserves actual stock, product filters and per-product exports',()=>{
  const o=M.seed().find(o=>o.status==='待指令'),before=JSON.stringify({boxes:o.boxes,receipts:o.receipts,instructions:o.instructions,status:o.status});delete o.products[0].location;M.migrate([o]);assert.equal(JSON.stringify({boxes:o.boxes,receipts:o.receipts,instructions:o.instructions,status:o.status}),before);
  o.products[0].requirement='换标';o.products[0].location='洛杉矶退件区';assert.equal(F.matchesProductFilters(o,{requirement:'换标',location:'洛杉矶',quantityMin:'1'}),true);assert.equal(F.matchesProductFilters(o,{location:'芝加哥'}),false);
  const grid=F.exportProductGrid([o]);assert.equal(grid.length,2);assert.equal(grid[0].length,21);assert.ok(grid[1].includes('洛杉矶退件区'));
});
