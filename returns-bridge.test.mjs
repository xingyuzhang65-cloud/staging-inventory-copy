import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const M=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(new URL('./returns-model.js',import.meta.url),'utf8')).toString('base64'));
const bridgeSource=fs.readFileSync(new URL('./returns-bridge.js',import.meta.url),'utf8');
function harness(){
  const listeners=[],stored=new Map(),names=['approvalRows','instructionPendingRows','instructionProcessingRows','outboundRows','shippedRows','destroyedRows','rejectedRows','inventoryRows'];
  const c={document:{querySelector:()=>({hidden:true}),querySelectorAll:()=>[],addEventListener:(name,handler)=>listeners.push(handler),createElement:()=>({dataset:{},setAttribute(){}})},window:{confirm:()=>true,alert:message=>{throw Error(message)}},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},updateStatusTabCount(){},applyFilters(){},renderRows(){},renderInstructionList(){},activeReleaseSourceRow:null,activeReleaseStatus:'暂存',body:{querySelectorAll:()=>[]},visibleRows:[],activeStatus:'',filters:{request:{value:''}},showInventorySection(){c.filters.request.value='';},showInstructionList(){c.filters.request.value='';},activeApprovalReviewRow:null,approvalReviewDecision:'',closeApprovalReview(){},console};
  for(const name of names)c[name]=[];
  vm.runInNewContext(bridgeSource,c);
  const bridge=c.window.ReturnsBridge;
  function move(instructionId,from,to){const index=c[from].findIndex(row=>row.returnInstructionId===instructionId);assert.ok(index>=0);const row=c[from].splice(index,1)[0];c[to].push(row);return row;}
  function reconcile(orders){for(const o of orders)for(const i of o.instructions){const status=bridge.status(i.id);if(status&&status!==i.status)M.syncInstruction(o,i.id,status);}bridge.sync(orders);}
  function confirmOutbound(id){const button={dataset:{instruction:id}};for(const callback of listeners)callback({target:{closest:selector=>selector==='.returns-confirm-outbound'?button:null},preventDefault(){},stopImmediatePropagation(){}});}
  return {c,bridge,move,reconcile,confirmOutbound};
}
function owned(){const o=M.seed().find(o=>o.id.endsWith('0009'));assert.ok(o);return o;}

test('real sample model and legacy bridge agree on actual box inventory and seeded instruction states',()=>{
  const h=harness(),orders=M.seed();h.bridge.sync(orders);h.reconcile(orders);
  const expected=orders.reduce((n,o)=>n+M.totals(o).inStock,0);
  assert.equal(h.c.inventoryRows.length,expected);
  assert.ok(h.c.inventoryRows.filter(r=>r.customer==='待识别货主').every(r=>!r.returnAvailable));
  assert.ok(!h.c.inventoryRows.some(r=>r.returnSource.endsWith('0004')),'Carrier delivery cannot create inventory.');
  const count=h.c.inventoryRows.length,instructions=h.c.destroyedRows.length+h.c.shippedRows.length+h.c.instructionProcessingRows.length;
  h.bridge.sync(orders);h.reconcile(orders);assert.equal(h.c.inventoryRows.length,count);
  assert.equal(h.c.destroyedRows.length+h.c.shippedRows.length+h.c.instructionProcessingRows.length,instructions,'Repeated synchronization cannot duplicate instructions.');
});
test('unified workflow releases rejected boxes and completes service without deducting physical inventory',()=>{
  const h=harness(),o=owned();const rejected=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'退件转寄'});h.bridge.publish(o,rejected);h.bridge.sync([o]);
  h.move(rejected.id,'approvalRows','rejectedRows');h.reconcile([o]);assert.equal(M.totals(o).reserved,0);
  const service=M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'换标'});h.bridge.publish(o,service);
  h.move(service.id,'approvalRows','instructionPendingRows');h.reconcile([o]);assert.equal(service.status,'指令待处理');
  h.move(service.id,'instructionPendingRows','instructionProcessingRows');h.reconcile([o]);
  h.move(service.id,'instructionProcessingRows','outboundRows');h.reconcile([o]);
  assert.equal(service.status,'指令处理完成');assert.equal(M.totals(o).reserved,0);assert.equal(M.totals(o).inStock,2);assert.equal(h.c.inventoryRows.length,2);
});
test('shipping and destruction deduct selected actual boxes only after physical confirmation',()=>{
  for(const type of ['发货计划','自提','销毁']){
    const h=harness(),o=owned(),instruction=M.instruct(o,{type,boxIds:[o.boxes[0].id],note:'已确认处理要求'});
    h.bridge.publish(o,instruction);h.move(instruction.id,'approvalRows','outboundRows');h.reconcile([o]);
    assert.equal(M.totals(o).inStock,2);assert.equal(M.totals(o).reserved,1);
    h.confirmOutbound(instruction.id);h.reconcile([o]);assert.equal(M.totals(o).inStock,1);assert.equal(M.totals(o).outbound,1);assert.equal(h.c.inventoryRows.length,1);
    h.confirmOutbound(instruction.id);h.reconcile([o]);assert.equal(M.totals(o).outbound,1,'Repeated confirmation cannot double deduct inventory.');
  }
});
test('source data can restore a rejected instruction even after its boxes enter a later instruction',()=>{
  const o=owned(),first=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'取消转寄'});M.syncInstruction(o,first.id,'审批拒绝');
  M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'更换标签'});
  const h=harness();h.bridge.sync([o]);h.reconcile([o]);assert.equal(h.c.rejectedRows.length,1);assert.equal(h.c.approvalRows.length,1);
});
test('associated instruction navigation retains its number after existing page filters reset',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'发货计划',boxIds:[o.boxes[0].id],note:'转寄'});h.bridge.publish(o,i);h.bridge.openInstruction(i.id);assert.equal(h.c.filters.request.value,i.id);
});
test('processing details expose the original instruction status control only for return instructions',()=>{
  const h=harness(),o=owned(),i=M.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[0].id],note:'换标'});h.bridge.publish(o,i);
  let replacement;h.c.document.querySelectorAll=()=>[{textContent:'待处理',replaceWith:control=>{replacement=control}}];
  h.c.activeReleaseSourceRow=h.c.approvalRows[0];h.c.activeReleaseStatus='指令处理中';h.c.renderInstructionList();
  assert.equal(replacement.dataset.instructionIndex,'0');assert.ok(replacement.innerHTML.includes('value="已处理"'));
  replacement=null;h.c.activeReleaseSourceRow={};h.c.renderInstructionList();assert.equal(replacement,null);
});
