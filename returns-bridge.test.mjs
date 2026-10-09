import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const M=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(new URL('./returns-model.js',import.meta.url),'utf8')).toString('base64'));
const bridgeSource=fs.readFileSync(new URL('./returns-bridge.js',import.meta.url),'utf8');
function harness({stored=new Map(),inventoryRows=[]}={}){
  const listeners=[],navigation=[],drawers=[],confirmations=[],names=['approvalRows','instructionPendingRows','instructionProcessingRows','outboundRows','shippedRows','destroyedRows','rejectedRows','inventoryRows'];
  const c={document:{querySelector:()=>({hidden:true}),querySelectorAll:()=>[],addEventListener:(name,handler)=>listeners.push(handler),createElement:()=>({dataset:{},setAttribute(){}})},window:{confirm:message=>{confirmations.push(message);return true;},alert:message=>{throw Error(message)}},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},updateStatusTabCount(){},applyFilters(){},renderRows(){},renderInstructionList(){},activeReleaseSourceRow:null,activeReleaseStatus:'暂存',body:{querySelectorAll:()=>[]},visibleRows:[],activeStatus:'',filters:{request:{value:''}},showInventorySection(page,status){navigation.push({page,status});c.filters.request.value='';},showInstructionList(status){navigation.push({page:'instructions',status});c.filters.request.value='';},openReleaseDrawer(row,options){drawers.push({row,options});},activeApprovalReviewRow:null,approvalReviewDecision:'',closeApprovalReview(){},console};
  for(const name of names)c[name]=name==='inventoryRows'?[...inventoryRows]:[];
  vm.runInNewContext(bridgeSource,c);
  const bridge=c.window.ReturnsBridge;
  function move(instructionId,from,to){const index=c[from].findIndex(row=>row.returnInstructionId===instructionId);assert.ok(index>=0);const row=c[from].splice(index,1)[0];c[to].push(row);return row;}
  function reconcile(orders){for(const o of orders)for(const i of o.instructions){const status=bridge.status(i.id);if(status&&status!==i.status)M.syncInstruction(o,i.id,status);}bridge.sync(orders);}
  return {c,bridge,move,reconcile,stored,navigation,drawers,confirmations};
}
function owned(){const o=M.seed().find(o=>o.id.endsWith('0009'));assert.ok(o);return o;}

test('actual return stock remains in its source model while seeded instruction states still synchronize',()=>{
  const h=harness(),orders=M.seed();h.bridge.sync(orders);h.reconcile(orders);
  const expected=orders.reduce((n,o)=>n+M.totals(o).inStock,0);
  assert.ok(expected>0,'Received return boxes remain available in the source model.');
  assert.equal(h.c.inventoryRows.length,0,'Returns cannot create temporary inventory rows.');
  for(const order of orders)for(const instruction of order.instructions){
    assert.equal(h.bridge.status(instruction.id),instruction.status);
  }
  assert.ok(h.c.destroyedRows.length>0);assert.ok(h.c.shippedRows.length>0);assert.ok(h.c.instructionProcessingRows.length>0);
  const instructions=h.c.destroyedRows.length+h.c.shippedRows.length+h.c.instructionProcessingRows.length;
  h.bridge.sync(orders);h.reconcile(orders);assert.equal(h.c.inventoryRows.length,0);
  assert.equal(orders.reduce((n,o)=>n+M.totals(o).inStock,0),expected);
  assert.equal(h.c.destroyedRows.length+h.c.shippedRows.length+h.c.instructionProcessingRows.length,instructions,'Repeated synchronization cannot duplicate instructions.');
});
test('synchronization removes legacy return inventory without changing unrelated temporary stock',()=>{
  const ordinary={id:1,status:'暂存',blocked:'暂存',boxes:12},intercept={id:2,status:'暂存',blocked:'拦截',boxes:4};
  const o=owned(),legacy={id:3,status:'暂存',blocked:'退换货',returnSource:o.id,returnBoxId:o.boxes[0].id,returnBoxKey:`${o.id}::${o.boxes[0].id}`,boxes:1};
  const untaggedLegacy={id:4,status:'暂存',blocked:'退换货',boxes:1};
  const h=harness({inventoryRows:[ordinary,legacy,intercept,untaggedLegacy]});h.bridge.sync([o]);
  assert.equal(h.c.inventoryRows.length,2);assert.equal(h.c.inventoryRows[0],ordinary);assert.equal(h.c.inventoryRows[1],intercept);
  assert.equal(ordinary.boxes,12);assert.equal(intercept.boxes,4);assert.equal(M.totals(o).inStock,2);
  h.bridge.sync([o]);assert.equal(h.c.inventoryRows.length,2);
});
test('unified workflow releases rejected boxes and completes service without deducting physical inventory',()=>{
  const h=harness(),o=owned();const rejected=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'退件转寄'});h.bridge.publish(o,rejected);h.bridge.sync([o]);
  h.move(rejected.id,'approvalRows','rejectedRows');h.reconcile([o]);assert.equal(M.totals(o).reserved,0);
  const service=M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'换标'});h.bridge.publish(o,service);
  h.move(service.id,'approvalRows','instructionPendingRows');h.reconcile([o]);assert.equal(service.status,'指令待处理');
  h.move(service.id,'instructionPendingRows','instructionProcessingRows');h.reconcile([o]);
  h.move(service.id,'instructionProcessingRows','outboundRows');h.reconcile([o]);
  assert.equal(service.status,'指令处理完成');assert.equal(M.totals(o).reserved,0);assert.equal(M.totals(o).inStock,2);assert.equal(h.c.inventoryRows.length,0);
  assert.equal(h.bridge.confirmOutbound(service.id),false);h.reconcile([o]);assert.equal(M.totals(o).inStock,2);assert.equal(M.totals(o).outbound,0);
});
test('shipping and destruction deduct selected actual boxes only after physical confirmation',()=>{
  for(const type of ['发货计划','自提','销毁']){
    const h=harness(),o=owned(),instruction=M.instruct(o,{type,boxIds:[o.boxes[0].id],note:'已确认处理要求'});
    h.bridge.publish(o,instruction);h.move(instruction.id,'approvalRows','outboundRows');h.reconcile([o]);
    assert.equal(M.totals(o).inStock,2);assert.equal(M.totals(o).reserved,1);
    h.bridge.confirmOutbound(instruction.id);h.reconcile([o]);assert.equal(M.totals(o).inStock,1);assert.equal(M.totals(o).outbound,1);assert.equal(h.c.inventoryRows.length,0);
    assert.equal(h.confirmations.length,1);
    h.bridge.confirmOutbound(instruction.id);h.reconcile([o]);assert.equal(M.totals(o).outbound,1,'Repeated confirmation cannot double deduct inventory.');
    assert.equal(h.confirmations.length,1,'Completed instructions cannot be confirmed again.');
  }
});
test('cancelling physical confirmation preserves the pending instruction and its reserved boxes',()=>{
  const h=harness(),o=owned(),instruction=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'转寄'});
  h.bridge.publish(o,instruction);h.move(instruction.id,'approvalRows','outboundRows');h.reconcile([o]);
  h.c.window.confirm=()=>false;h.bridge.confirmOutbound(instruction.id);h.reconcile([o]);
  assert.equal(h.c.outboundRows.length,1);assert.equal(h.c.shippedRows.length,0);assert.equal(instruction.status,'指令处理完成、待出库');
  assert.equal(M.totals(o).inStock,2);assert.equal(M.totals(o).reserved,1);assert.equal(M.totals(o).outbound,0);assert.equal(h.c.inventoryRows.length,0);
});
test('source data can restore a rejected instruction even after its boxes enter a later instruction',()=>{
  const o=owned(),first=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'取消转寄'});M.syncInstruction(o,first.id,'审批拒绝');
  M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'更换标签'});
  const h=harness();h.bridge.sync([o]);h.reconcile([o]);assert.equal(h.c.rejectedRows.length,1);assert.equal(h.c.approvalRows.length,1);
});
test('associated instruction navigation retains its number after existing page filters reset',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'转寄'});h.bridge.publish(o,i);h.bridge.openInstruction(i.id);assert.equal(h.c.filters.request.value,i.id);
  assert.equal(h.navigation.length,1);assert.equal(h.navigation[0].page,'instructions');assert.equal(h.navigation[0].status,'待审批');
});
test('pending and shipped return instructions open a read-only detail without navigating to temporary inventory',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'转寄'});h.bridge.publish(o,i);
  h.move(i.id,'approvalRows','outboundRows');h.bridge.openInstruction(i.id);
  assert.equal(h.navigation.length,0);assert.equal(h.drawers.length,1);assert.equal(h.drawers[0].row.returnInstructionId,i.id);
  assert.equal(h.drawers[0].options.readOnly,true);assert.equal(h.drawers[0].options.status,'待出库');
  h.bridge.confirmOutbound(i.id);h.reconcile([o]);h.bridge.openInstruction(i.id);
  assert.equal(h.navigation.length,0);assert.equal(h.drawers.length,2);assert.equal(h.drawers[1].row.returnInstructionId,i.id);
  assert.equal(h.drawers[1].options.readOnly,true);assert.equal(h.drawers[1].options.status,'已出库');
});
test('saved bridge stages restore return instructions without reintroducing temporary stock',()=>{
  const first=harness(),orders=M.seed();first.bridge.sync(orders);first.reconcile(orders);
  const o=orders.find(order=>order.id.endsWith('0009')),pending=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'待实际转寄'});
  first.bridge.publish(o,pending);first.move(pending.id,'approvalRows','outboundRows');first.reconcile([o]);
  const restored=harness({stored:first.stored});restored.bridge.sync(orders);restored.reconcile(orders);
  for(const order of orders)for(const instruction of order.instructions){
    assert.equal(restored.bridge.status(instruction.id),instruction.status);
  }
  for(const name of ['approvalRows','instructionPendingRows','instructionProcessingRows','outboundRows','shippedRows','destroyedRows','rejectedRows']){
    assert.equal(restored.c[name].length,first.c[name].length,`${name} must restore without duplicate instructions.`);
  }
  assert.equal(restored.c.inventoryRows.length,0);assert.equal(M.totals(o).inStock,2);assert.equal(M.totals(o).reserved,1);
});
test('unified workflow renders persist the latest return instruction stage before returning to its source page',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'转寄'});h.bridge.publish(o,i);
  for(const [from,to,stage] of [['approvalRows','instructionProcessingRows','指令处理中'],['instructionProcessingRows','outboundRows','待出库']]){
    h.move(i.id,from,to);h.c.renderRows();
    const saved=JSON.parse(h.stored.get('mw-returns-instruction-bridge-v1'));
    assert.equal(saved.find(entry=>entry.row.returnInstructionId===i.id).stage,stage);
  }
  assert.equal(i.status,'待审批','The persisted workflow state must not depend on source-page reconciliation.');
});
test('processing details expose the original instruction status control only for return instructions',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'换标'});h.bridge.publish(o,i);
  let replacement;h.c.document.querySelectorAll=()=>[{textContent:'待处理',replaceWith:control=>{replacement=control}}];
  h.c.activeReleaseSourceRow=h.c.approvalRows[0];h.c.activeReleaseStatus='指令处理中';h.c.renderInstructionList();
  assert.equal(replacement.dataset.instructionIndex,'0');assert.ok(replacement.innerHTML.includes('value="已处理"'));
  replacement=null;h.c.activeReleaseSourceRow={};h.c.renderInstructionList();assert.equal(replacement,null);
});
