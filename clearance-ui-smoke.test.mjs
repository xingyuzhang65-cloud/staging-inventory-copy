import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./clearance-model.js',import.meta.url),'utf8');
const C=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const DAY=86400000;
const seeds=C.seed(),pending=seeds[0],waiting=seeds[1],limit=seeds[8];
waiting.acceptedAt=waiting.searchAt=new Date(Date.now()-8*DAY-3*3600000).toISOString();
limit.acceptedAt=limit.searchAt=new Date(Date.now()-31*DAY).toISOString();
const elements=new Map(),listeners=new Map(),stored=new Map([['mw-clearance-prototype-v2',JSON.stringify([pending,waiting,limit])]]);
function node(selector){if(!elements.has(selector))elements.set(selector,{hidden:true,innerHTML:'',textContent:'',value:'',dataset:{},elements:new Proxy({},{get:(target,key)=>target[key]||(target[key]={value:'',checked:false})}),reportValidity:()=>true,classList:{add(){},remove(){},toggle(){}},after(){},insertAdjacentHTML(){},querySelector:s=>node(s),querySelectorAll:()=>[],focus(){},reset(){}});return elements.get(selector);}
class TestFormData {
  constructor(form){this.values=[];for(const [name,control]of Object.entries(form.elements)){if(control.disabled)continue;if(['consent','notified'].includes(name)){if(control.checked)this.values.push([name,'on']);}else this.values.push([name,control.value]);}}
  get(name){return this.values.find(([key])=>key===name)?.[1]??null;}
  [Symbol.iterator](){return this.values[Symbol.iterator]();}
}
const document={querySelector:node,createElement:()=>node('main'),body:node('body'),addEventListener(name,callback){const list=listeners.get(name)||[];list.push(callback);listeners.set(name,list);}};
const window={confirmDiscardInstructionStatusDrafts:()=>true,activateWarehousePage(){}};
const context=vm.createContext({document,window,localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},location:{search:'?page=clearance'},URL,URLSearchParams,Blob,TextDecoder,FormData:TestFormData,console,structuredClone,setTimeout:()=>0,clearTimeout(){}});
const modules=new Map();
async function load(file){if(modules.has(file))return modules.get(file);const module=new vm.SourceTextModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{context,identifier:file});modules.set(file,module);await module.link(specifier=>load(specifier.replace('./','')));return module;}
const ui=await load('clearance.js');await ui.evaluate();
const model=modules.get('clearance-model.js').namespace,address=modules.get('warehouse-address.js').namespace;
const read=id=>JSON.parse(stored.get('mw-clearance-prototype-v2')).find(o=>o.id===id);
function click(data,orderId=''){const target={disabled:false,dataset:data,closest(selector){if(selector==='[data-cl-order]')return orderId?{dataset:{clOrder:orderId}}:null;if(selector==='[data-cl-action]'&&data.clAction)return target;if(selector==='[data-cl-tab]'&&data.clTab)return target;if(selector==='[data-cl-detail-tab]'&&data.clDetailTab!=null)return target;return null;}};for(const callback of listeners.get('click')||[])callback({target});}
const mf=node('#clModalForm');const submit=()=>mf.onsubmit({target:mf,preventDefault(){}});
assert.equal(node('main').hidden,false);assert.ok(node('#clHead').innerHTML.includes('受理时间'));assert.ok(node('#clHead').innerHTML.includes('清货时长'));
assert.ok(node('#clDeadlineSummary').innerHTML.includes('满 30 天待人工处理 1 条'));
address.saveWarehouseAddress(model.WAREHOUSES[0],'123 Test Ave, CA');address.saveWarehouseAddress(model.WAREHOUSES[1],'456 Sample St, NJ');
click({clAction:'accept'},pending.id);assert.ok(node('#clModal').innerHTML.includes('受理清货申请'));assert.ok(node('#clModal').innerHTML.includes('123 Test Ave, CA'));
assert.equal(read(pending.id).status,'待受理','Opening acceptance does not accept before confirmation.');
mf.elements.warehouse.value=model.WAREHOUSES[1];
const change={id:'',form:mf,matches:selector=>selector.includes('#clModalForm [name="warehouse"]')};
for(const callback of listeners.get('change')||[])callback({target:change});
assert.equal(mf.elements.warehouseAddress.value,'456 Sample St, NJ');submit();
const accepted=read(pending.id);assert.equal(accepted.status,'寻找买家中');assert.ok(accepted.acceptedAt);assert.equal(accepted.acceptedAt,accepted.searchAt);assert.equal(accepted.warehouse,model.WAREHOUSES[1]);
click({clTab:'寻找买家中'});assert.ok(node('#clBody').innerHTML.includes('8 天 3 小时'));assert.ok(node('#clBody').innerHTML.includes('已达 30 天 · 待人工处理'));
click({clAction:'detail'},waiting.id);assert.ok(node('#clDrawer').innerHTML.includes('7 天反馈时间'));assert.ok(node('#clDrawer').innerHTML.includes('30 天寻找上限'));assert.ok(node('#clDrawer').innerHTML.includes('请提醒客户确认是否继续寻找'));
click({clAction:'remind'},waiting.id);mf.elements.notified.checked=false;mf.elements.note.value='已联系客户，等待反馈';const before=read(waiting.id);submit();assert.deepEqual(read(waiting.id),before);assert.ok(node('#clModalError').textContent.includes('人工提醒客户'));
mf.elements.notified.checked=true;submit();assert.equal(read(waiting.id).reminderCount,1);assert.equal(read(waiting.id).status,'寻找买家中');
click({clAction:'feedback'},waiting.id);assert.ok(node('#clModal').innerHTML.includes('客户已明确同意'));mf.elements.consent.checked=true;mf.elements.note.value='客户回复继续寻找';submit();
const continued=read(waiting.id);assert.equal(continued.extended,true);assert.equal(continued.acceptedAt,before.acceptedAt);assert.equal(continued.searchAt,before.searchAt);assert.ok(continued.consentAt);assert.ok(node('#clDrawer').innerHTML.includes('同意继续寻找'));
click({clAction:'detail'},limit.id);assert.ok(node('#clDrawer').innerHTML.includes('已寻找 31 天，达到 30 天上限，待人工处理'));assert.equal(read(limit.id).status,'寻找买家中');
const stockBefore=structuredClone({products:read(limit.id).products,receipts:read(limit.id).receipts});click({clAction:'terminate'},limit.id);assert.ok(node('#clModal').innerHTML.includes('清货时长停止计时'));mf.elements.reason.value='客户确认停止';submit();
const ended=read(limit.id);assert.equal(ended.status,'已终止');assert.ok(ended.closedAt);assert.deepEqual({products:ended.products,receipts:ended.receipts},stockBefore);
const clock=model.clearanceProgress(ended);assert.equal(model.clearanceProgress(ended,Date.now()+100*DAY).durationText,clock.durationText);
click({clTab:'全部'});click({clAction:'warehouse'},limit.id);mf.elements.warehouse.value=model.WAREHOUSES[2];mf.elements.warehouseAddress.value='789 Test Road, TX';submit();
const corrected=read(limit.id);assert.equal(corrected.warehouse,model.WAREHOUSES[2]);assert.equal(corrected.status,'已终止');assert.equal(corrected.closedAt,ended.closedAt);assert.deepEqual({products:corrected.products,receipts:corrected.receipts},stockBefore);
assert.equal(address.warehouseAddress(model.WAREHOUSES[2]),'789 Test Road, TX');
console.log('Clearance UI smoke checks passed: acceptance warehouse and address, acceptance clock, 7-day client reminder and consent, 30-day manual termination, frozen duration and preserved inventory.');
