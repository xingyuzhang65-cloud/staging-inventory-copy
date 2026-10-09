import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Executes the real UI and model without a browser; verifies rendered pages and routing.
async function createUI(initialOrders){
  const elements=new Map(),listeners=new Map(),stored=new Map(),states=new Map(),linked=new Map();
  const confirmations=[],opened=[];
  if(initialOrders)stored.set('mw-returns-prototype-v1',JSON.stringify(initialOrders));
  for(const o of initialOrders||[])for(const i of o.instructions)states.set(i.id,i.status);
  function node(selector){if(!elements.has(selector))elements.set(selector,{hidden:false,innerHTML:'',textContent:'',dataset:{},elements:new Proxy({},{get:(target,key)=>target[key]||(target[key]={value:'',checked:false})}),reportValidity:()=>true,classList:{add(){},remove(){},toggle(){}},after(){},insertAdjacentHTML(){},querySelector(s){return node(s);},querySelectorAll(){return [];},focus(){},reset(){}});return elements.get(selector);}
  const document={querySelector:node,createElement:()=>node('main'),body:node('body'),addEventListener(name,callback){const list=listeners.get(name)||[];list.push(callback);listeners.set(name,list);}};
  const bridge={
    sync(orders){for(const o of orders)for(const i of o.instructions){linked.set(i.id,structuredClone(i));if(!states.has(i.id))states.set(i.id,i.status);}},
    status:id=>states.get(id)||null,
    confirmOutbound(id){
      confirmations.push(id);
      const i=linked.get(id);
      if(!i||states.get(id)!=='指令处理完成、待出库'||i.type==='库内增值服务')return false;
      states.set(id,'已出库');return true;
    },
    openInstruction(id){opened.push(id);node('#instructionDrawer').hidden=false;return true;}
  };
  const window={confirmDiscardInstructionStatusDrafts:()=>true,activateWarehousePage(){},ReturnsBridge:bridge};
  const context=vm.createContext({document,window,localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},location:{search:'?page=returns'},URL,URLSearchParams,Blob,TextDecoder,console,structuredClone,setTimeout:()=>0,clearTimeout(){}});
  const modules=new Map();
  async function load(file){if(modules.has(file))return modules.get(file);const module=new vm.SourceTextModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{context,identifier:file});modules.set(file,module);await module.link(specifier=>load(specifier.replace('./','')));return module;}
  function click(data,orderId=''){const target={disabled:false,dataset:data,closest(selector){if(selector==='[data-rt-order]')return orderId?{dataset:{rtOrder:orderId}}:null;if(selector==='[data-rt-action]'&&data.rtAction)return target;if(selector==='[data-rt-detail-tab]'&&data.rtDetailTab!=null)return target;return null;}};for(const callback of listeners.get('click')||[])callback({target});}
  const ui=await load('returns.js');await ui.evaluate();
  return {node,listeners,stored,modules,window,bridge,confirmations,opened,click};
}
const {node,listeners,stored,modules,click}=await createUI();
const model=modules.get('returns-model.js').namespace,seed=JSON.parse(stored.get('mw-returns-prototype-v1'));
assert.ok(seed.length>=10&&seed.length<=12,'Representative data must include 10–12 business cases.');
assert.equal(new Set([...node('#rtBody').innerHTML.matchAll(/data-rt-order="([^"]+)"/g)].map(m=>m[1])).size,10,'First page renders 10 complete orders.');
assert.equal((node('#rtBody').innerHTML.match(/data-rt-order=/g)||[]).length,11,'Products appear on individual rows.');
assert.ok(!node('main').hidden,'Direct route opens the returns page.');
let detailChecks=0;
for(const order of seed){click({rtAction:'detail'},order.id);assert.ok(!node('#rtDrawer').hidden);for(let tab=0;tab<7;tab++){click({rtDetailTab:String(tab)});const html=node('#rtDrawer').innerHTML;assert.ok(html.includes(order.id));assert.ok(!/\bundefined\b|\bNaN\b/.test(html),'Details should render complete, valid business data.');assert.ok(html.includes('role="dialog"'));assert.ok(!html.includes('关联暂存'),'Returns details must not present returns stock as staging inventory.');if(tab===4){assert.match(html,/data-rt-detail-tab="4">退换货库存<\/button>/);assert.ok(html.includes('退换货在库明细'));assert.ok(html.includes('<th>库存记录</th>'));if(model.can(order,'instruct'))assert.match(html,/data-rt-action="instruct"[^>]*>下指令<\/button>/,'Available returns stock keeps its instruction entry.');}detailChecks++;}}
assert.ok(seed.some(o=>model.totals(o).receivedUnknown),'An uncounted actual receipt must be represented.');
assert.ok(seed.some(o=>model.receiptStatus(o)==='待仓库确认'),'Carrier delivery and warehouse receipt remain separate.');
assert.ok(seed.some(o=>model.receiptStatus(o)==='部分入仓'),'Partially received orders must be represented.');
click({rtAction:'create'});assert.ok(node('#rtDrawer').innerHTML.includes('rtImportForm'));assert.ok(node('#rtDrawer').innerHTML.includes('下载退换货模板'));
const f=node('#rtImportForm');Object.assign(f.elements.customer,{value:model.CLIENTS[0].name});f.elements.warehouse.value=model.WAREHOUSES[0];f.elements.source.value='客户预报';f.id='rtImportForm';
const headers=modules.get('returns-fields.js').namespace.TEMPLATE_FIELDS.map(f=>f.label),csv=[headers,[model.CLIENTS[0].name,'导入样例','SKU-IMPORT','','6','0.2','18×12×6','2','TRACK-IMPORT','2026-10-02','2026-10-08','6','2','换标','代理退件区']].map(row=>row.map(v=>'"'+v+'"').join(',')).join('\r\n');
const bytes=new TextEncoder().encode(csv),target={id:'rtImportFile',files:[{name:'测试.csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer}],matches:()=>false};
for(const callback of listeners.get('change')||[])callback({target});await new Promise(setImmediate);
assert.ok(node('#rtImportPreview').innerHTML.includes('SKU-IMPORT'));assert.equal(node('#rtImportSubmit').disabled,false);
for(const callback of listeners.get('submit')||[])callback({target:f,preventDefault(){}});
const saved=JSON.parse(stored.get('mw-returns-prototype-v1')),created=saved.find(o=>o.products.some(p=>p.sku==='SKU-IMPORT'));assert.ok(created,'The import submission creates a real order.');assert.equal(created.status,'待受理');assert.equal(created.boxes.length,0);assert.equal(created.products[0].requirement,'换标');
function actualStock(type,index){
  const c=model.CLIENTS[0],productId=`P-UI-${index}`;
  const o=model.createOrder({customer:c.name,customerCode:c.code,warehouse:model.WAREHOUSES[0],source:'客户预报',products:[{id:productId,name:'实际收货耳机',sku:`SKU-UI-${index}`,quantity:9}],packages:[]});
  o.id=`RT-UI-STOCK-${index}`;model.accept(o);
  const p=model.addPackage(o,{tracking:`TRACK-UI-${index}`,carrier:'UPS',forecast:9,items:[{productId,quantity:9}]});
  model.receive(o,{packageId:p.id,time:'2026-10-09 08:00:00',boxes:3,counted:true,items:[{productId,quantity:9}]});
  model.claim(o,{boxIds:o.boxes.map(b=>b.id),customer:c.name,customerCode:c.code});
  const i=model.instruct(o,{type,boxIds:[o.boxes[0].id,o.boxes[2].id],note:'仅处理第一箱和第三箱'});
  model.syncInstruction(o,i.id,type==='库内增值服务'?'指令处理完成':'指令处理完成、待出库');
  return o;
}
const stockOrders=['发货计划','自提','销毁','库内增值服务'].map(actualStock),stockUI=await createUI(stockOrders);
const readStock=id=>JSON.parse(stockUI.stored.get('mw-returns-prototype-v1')).find(o=>o.id===id);
const confirmationLabels=['确认实际出库','确认实际提货','确认实际销毁'];
for(const [index,order] of stockOrders.slice(0,3).entries()){
  const instruction=order.instructions[0],before=readStock(order.id),unselected=before.boxes[1];
  assert.equal(model.totals(before).inStock,3,'Instruction completion must keep all three actual boxes in stock.');
  assert.equal(model.totals(before).reserved,2);
  stockUI.click({rtAction:'detail'},order.id);stockUI.click({rtDetailTab:'4'});
  assert.match(stockUI.node('#rtDrawer').innerHTML,/data-rt-action="instruct"[^>]*>下指令<\/button>/);
  stockUI.click({rtAction:'instruct'});
  assert.equal(stockUI.node('#rtModal').hidden,false,'Returns stock instruction entry opens the actual instruction form.');
  assert.ok(stockUI.node('#rtModal').innerHTML.includes('提交至指令管理'));
  assert.ok(stockUI.node('#rtModal').innerHTML.includes(unselected.id));
  stockUI.click({rtAction:'modal-close'});stockUI.click({rtDetailTab:'5'});
  const actions=[...stockUI.node('#rtDrawer').innerHTML.matchAll(/<button[^>]*data-rt-action="confirm-outbound"[^>]*>([^<]+)<\/button>/g)];
  assert.equal(actions.length,1);assert.equal(actions[0][1],confirmationLabels[index]);
  assert.ok(actions[0][0].includes(`data-rt-instruction="${instruction.id}"`));
  stockUI.click({rtAction:'confirm-outbound',rtInstruction:instruction.id});
  assert.equal(stockUI.confirmations.length,index+1,'The action confirms through the shared instruction bridge.');
  assert.equal(stockUI.confirmations[index],instruction.id);
  const after=readStock(order.id),t=model.totals(after);
  assert.equal(after.instructions[0].status,'已出库');
  assert.deepEqual([t.inStock,t.reserved,t.available,t.outbound],[1,0,1,2]);
  assert.deepEqual(after.boxes[1],unselected,'Actual outbound must leave the unselected box unchanged.');
  assert.ok(after.boxes.filter(b=>instruction.boxIds.includes(b.id)).every(b=>b.outbound&&!b.reservedBy));
  assert.ok(!stockUI.node('#rtDrawer').innerHTML.includes('data-rt-action="confirm-outbound"'));
  assert.ok(stockUI.node('#rtDrawer').innerHTML.includes('1 箱在库 · 0 箱占用 · 2 箱已出库'));
  stockUI.click({rtAction:'confirm-outbound',rtInstruction:instruction.id});
  assert.equal(stockUI.confirmations.length,index+1,'A repeated or stale click cannot confirm actual outbound twice.');
  assert.deepEqual(readStock(order.id),after,'A repeated confirmation cannot deduct inventory or log another transition.');
}
const service=stockOrders[3],serviceBefore=readStock(service.id);
stockUI.click({rtAction:'detail'},service.id);stockUI.click({rtDetailTab:'5'});
assert.ok(!stockUI.node('#rtDrawer').innerHTML.includes('data-rt-action="confirm-outbound"'),'Completed value-added service must not expose an outbound confirmation.');
stockUI.click({rtAction:'confirm-outbound',rtInstruction:service.instructions[0].id});
assert.equal(stockUI.confirmations.length,3,'A service instruction cannot reach the outbound bridge.');
assert.deepEqual(readStock(service.id),serviceBefore);
assert.deepEqual([model.totals(serviceBefore).inStock,model.totals(serviceBefore).reserved,model.totals(serviceBefore).outbound],[3,0,0]);
stockUI.node('#instructionDrawer').hidden=true;
stockUI.click({rtAction:'open-instruction',rtInstruction:service.instructions[0].id});
assert.deepEqual(stockUI.opened,[service.instructions[0].id]);
assert.equal(stockUI.node('#instructionDrawer').hidden,false);
assert.equal(stockUI.node('#rtDrawer').hidden,true,'Opening a completed instruction directly must close the returns overlay.');
stockUI.click({rtAction:'detail'},stockOrders[0].id);stockUI.click({rtDetailTab:'5'});
stockUI.bridge.openInstruction=()=>false;
stockUI.click({rtAction:'open-instruction',rtInstruction:stockOrders[0].instructions[0].id});
assert.equal(stockUI.node('#rtDrawer').hidden,false,'A cancelled instruction navigation keeps the returns details visible.');
console.log(`Returns UI smoke checks passed: ${seed.length} scenarios, ${detailChecks} detail views, import, returns stock instructions, selective actual outbound and completed service.`);
