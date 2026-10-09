import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// The static browser prototype intentionally has no Node package.json.
const source=await readFile(new URL('./returns-model.js',import.meta.url),'utf8');
const M=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const base=()=>({customer:M.CLIENTS[0].name,customerCode:M.CLIENTS[0].code,warehouse:M.WAREHOUSES[0],source:'客户预报',products:[{id:'p1',name:'耳机',sku:'EAR-01',quantity:9,dimensions:[1,2,3]}],packages:[]});
function ready(){const o=M.createOrder(base());M.accept(o);const p=M.addPackage(o,{tracking:M.id('TRACK'),carrier:'UPS',forecast:9,items:[{productId:'p1',quantity:9}],shipped:'2026-10-08 10:00:00'});return {o,p};}
function stock({counted=true,boxes=3,complete=true}={}){const {o,p}=ready();M.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes,counted,items:counted?[{productId:'p1',quantity:9}]:[],complete});return {o,p};}
function owned(options){const {o,p}=stock(options);M.claim(o,{boxIds:o.boxes.map(b=>b.id),customer:o.customer,customerCode:o.customerCode});return {o,p};}
const snapshot=o=>JSON.stringify(o);

test('seed includes twelve distinct operational scenarios and complete schemas',()=>{
  const list=M.seed();assert.equal(list.length,12);assert.equal(new Set(list.map(o=>o.id)).size,12);
  assert(list.some(o=>M.receiptStatus(o)==='待仓库确认'&&M.totals(o).inStock===0));
  assert(list.some(o=>M.receiptStatus(o)==='部分入仓'));assert(list.some(o=>M.totals(o).receivedUnknown));
  assert(list.some(o=>o.status==='已完成'&&M.totals(o).outbound===o.boxes.length));
  assert(list.some(o=>o.status==='已关闭'&&o.closedReason&&!o.boxes.length));
  assert(list.some(o=>M.totals(o).receivedUnknown&&o.boxes.every(b=>b.notifiedAt&&!b.claimed)));
  for(const o of list)for(const key of ['products','packages','receipts','boxes','instructions','fees','logs'])assert(Array.isArray(o[key]));
});
test('carrier delivery never creates actual goods or inventory',()=>{
  const {o,p}=ready();M.updateLogistics(o,p.id,'物流已妥投');assert.equal(M.receiptStatus(o),'待仓库确认');
  assert.deepEqual([M.totals(o).received,M.totals(o).boxes,M.totals(o).inStock],[0,0,0]);assert.equal(o.status,'退回中');
});
test('parcel forecast is independent, partial SKU mapping is allowed, duplicate tracking is atomic',()=>{
  const {o}=ready();const p=M.addPackage(o,{tracking:'INDEPENDENT',carrier:'FedEx',forecast:12,items:[{productId:'p1',quantity:2}]});assert.equal(p.forecast,12);
  M.addPackage(o,{tracking:'NO-SKU',carrier:'USPS',forecast:6,items:[]});const before=snapshot(o);
  assert.throws(()=>M.addPackage(o,{tracking:'independent',carrier:'UPS',forecast:1,items:[]}));assert.equal(snapshot(o),before);
  assert.throws(()=>M.addPackage(o,{tracking:'TOO-MANY',carrier:'UPS',forecast:1,items:[{productId:'p1',quantity:2}]}));assert.equal(snapshot(o),before);
});
test('uncounted boxes remain unknown and cannot acquire forecast quantities',()=>{
  const {o,p}=ready();const before=snapshot(o);
  assert.throws(()=>M.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes:2,counted:false,items:[{productId:'p1',quantity:9}]}));assert.equal(snapshot(o),before);
  M.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes:2,counted:false,items:[]});
  assert.equal(M.totals(o).received,0);assert.equal(M.totals(o).receivedUnknown,true);assert.equal(M.totals(o).inStock,2);assert(o.boxes.every(b=>b.items.length===0));
});
test('multi-box actual SKU allocation uses integers and preserves receipt totals',()=>{
  const {o,p}=ready();M.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes:4,counted:true,items:[{productId:'p1',quantity:7}],complete:false});
  assert.equal(M.totals(o).received,7);assert(o.boxes.every(b=>b.items.every(i=>Number.isInteger(i.quantity))));assert.equal(p.received,false);assert.equal(M.receiptStatus(o),'部分入仓');
  M.receive(o,{packageId:p.id,time:'2026-10-09 09:00:00',boxes:1,counted:true,items:[{productId:'p1',quantity:2}]});assert.equal(M.totals(o).received,9);assert.equal(M.receiptStatus(o),'已入仓');
  const before=snapshot(o);assert.throws(()=>M.receive(o,{packageId:p.id,time:'2026-10-09 10:00:00',boxes:1,counted:false,items:[]}));assert.equal(snapshot(o),before);
});
test('unknown owner claim binds the actual customer and rejects ownership conflicts before mutation',()=>{
  const o=M.createOrder({warehouse:M.WAREHOUSES[1],source:'国外代理反馈',products:[]});M.accept(o);
  const p=M.addPackage(o,{tracking:'UNKNOWN',carrier:'UPS',forecast:6,items:[]});M.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes:2,counted:false,items:[]});
  const c=M.CLIENTS[1];M.claim(o,{boxIds:[o.boxes[0].id],customer:c.name,customerCode:c.code});assert.equal(o.customerCode,c.code);assert.equal(o.boxes[0].customerCode,c.code);assert.equal(M.claimStatus(o),'部分认领');
  const before=snapshot(o);assert.throws(()=>M.claim(o,{boxIds:[o.boxes[1].id],customer:M.CLIENTS[0].name,customerCode:M.CLIENTS[0].code}));assert.equal(snapshot(o),before);
  M.claim(o,{boxIds:[o.boxes[1].id],customer:c.name,customerCode:c.code});assert.equal(M.totals(o).available,2);
});
test('unclaimed, nonexistent and duplicated boxes cannot enter a handling instruction',()=>{
  const {o}=stock();assert.throws(()=>M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'发货'}));
  M.claim(o,{boxIds:o.boxes.map(b=>b.id),customer:o.customer,customerCode:o.customerCode});const before=snapshot(o);
  assert.throws(()=>M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id,'missing'],note:'发货'}));assert.equal(snapshot(o),before);
  assert.throws(()=>M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id,o.boxes[0].id],note:'发货'}));assert.equal(snapshot(o),before);
});
test('instruction occupation is exclusive and refusal/cancellation releases inventory',()=>{
  const {o}=owned();const ids=o.boxes.map(b=>b.id),i=M.instruct(o,{type:'发货计划',boxIds:[ids[0]],note:'发往客户地址'});assert.equal(M.totals(o).reserved,1);assert.equal(M.totals(o).available,2);
  const before=snapshot(o);assert.throws(()=>M.instruct(o,{type:'自提',boxIds:[ids[0],ids[1]],note:'预约自提'}));assert.equal(snapshot(o),before);
  M.syncInstruction(o,i.id,'审批拒绝');assert.equal(M.totals(o).reserved,0);assert.equal(M.totals(o).available,3);assert.equal(M.totals(o).inStock,3);
  const j=M.instruct(o,{type:'自提',boxIds:[ids[0]],note:'预约自提'});M.syncInstruction(o,j.id,'已取消');assert.equal(M.totals(o).available,3);
  assert.throws(()=>M.syncInstruction(o,j.id,'指令处理中'));
});
test('completed value-added service releases reservation and preserves all stock',()=>{
  const {o}=owned();const i=M.instruct(o,{type:'库内增值服务',boxIds:o.boxes.map(b=>b.id),note:'清点并换标'});M.syncInstruction(o,i.id,'指令处理完成');
  assert.deepEqual([M.totals(o).inStock,M.totals(o).reserved,M.totals(o).available,M.totals(o).outbound],[3,0,3,0]);assert.equal(o.status,'待指令');
  const next=M.instruct(o,{type:'自提',boxIds:[o.boxes[0].id],note:'客户预约提货'});M.syncInstruction(o,i.id,'已完成');assert.equal(o.boxes[0].reservedBy,next.id);
});
test('shipping preparation keeps inventory, actual outbound deducts only selected boxes',()=>{
  const {o}=owned();const i=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'发货'});M.syncInstruction(o,i.id,'指令处理完成、待出库');
  assert.equal(M.totals(o).inStock,3);assert.equal(M.totals(o).reserved,1);M.syncInstruction(o,i.id,'已出库');
  assert.deepEqual([M.totals(o).inStock,M.totals(o).outbound,M.totals(o).available],[2,1,2]);assert.equal(o.status,'待指令');M.syncInstruction(o,i.id,'已完成');assert.equal(M.totals(o).outbound,1);
});
test('outbound batch cannot finish an order with an unreceived parcel',()=>{
  const {o}=owned();const p=M.addPackage(o,{tracking:'IN-TRANSIT',carrier:'UPS',forecast:1,items:[]});
  const i=M.instruct(o,{type:'销毁',boxIds:o.boxes.map(b=>b.id),note:'客户确认销毁'});M.syncInstruction(o,i.id,'指令处理完成');assert.equal(M.totals(o).inStock,3);assert.equal(M.totals(o).reserved,3);M.syncInstruction(o,i.id,'已完成');assert.equal(o.status,'退回中');assert.equal(p.received,false);assert.equal(M.receiptStatus(o),'部分入仓');
});
test('closing protects all actual receipts and validation failures do not partially edit orders',()=>{
  const {o}=stock();const before=snapshot(o);assert.equal(M.can(o,'close'),false);assert.throws(()=>M.close(o,'取消'));assert.throws(()=>M.editOrder(o,base()));assert.equal(snapshot(o),before);
  const draft=M.createOrder(base()),copy=snapshot(draft);assert.throws(()=>M.editOrder(draft,{...base(),products:[{...base().products[0],returnedAt:'2026-02-30 10:00:00'}]}));assert.equal(snapshot(draft),copy);
  M.close(draft,'客户撤回',true);assert.equal(draft.status,'已关闭');assert.equal(draft.closedReason,'客户撤回');assert.equal(M.can(draft,'accept'),false);
});
