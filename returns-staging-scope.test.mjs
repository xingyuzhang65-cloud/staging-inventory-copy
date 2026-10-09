import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./script.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const rowArrays={暂存:'inventoryRows',待审批:'approvalRows',指令待处理:'instructionPendingRows',指令处理中:'instructionProcessingRows',待出库:'outboundRows',已出库:'shippedRows',销毁:'destroyedRows',审批拒绝:'rejectedRows'};
function actualFunction(name){
  const match=source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'));
  assert.ok(match,`Cannot find the actual ${name} function.`);
  return match[0];
}
function actualBlock(start,end){
  const from=source.indexOf(start),to=source.indexOf(end,from);
  assert.ok(from>=0&&to>from,`Cannot find the actual handler beginning ${start}.`);
  return source.slice(from,to);
}
function rows(status){
  const base={status,system:'SYSTEM',container:'CONTAINER',inbound:'INBOUND',pallet:'PALLET',destination:'WAREHOUSE',dispatch:'TRUCK',transfer:'拆转',releaseType:'发货',applicationType:'其他地址',financialAudit:'未审核',boxes:2,pending:0,unsent:2,sent:0};
  return [
    {...base,id:1,customer:'TEMP_CUSTOMER',applicationNo:'TEMP-INSTRUCTION',blocked:'暂存'},
    {...base,id:2,customer:'INTERCEPT_CUSTOMER',applicationNo:'INTERCEPT-INSTRUCTION',blocked:'拦截'},
    {...base,id:3,customer:'RETURN_SOURCE_CUSTOMER',applicationNo:'RETURN-SOURCE',blocked:'暂存',returnSource:'RT-001'},
    {...base,id:4,customer:'RETURN_BOX_CUSTOMER',applicationNo:'RETURN-BOX',blocked:'拦截',returnBoxKey:'RT-002::BX-001'},
    {...base,id:5,customer:'RETURN_TYPE_CUSTOMER',applicationNo:'RETURN-TYPE',blocked:'退换货'}
  ];
}
function classList(){const values=new Set();return {toggle(name,on){if(on===undefined)on=!values.has(name);on?values.add(name):values.delete(name);},remove(...names){names.forEach(name=>values.delete(name));},contains:name=>values.has(name)};}
function harness(){
  const nodes=new Map(),events=new Map(),activations=[],downloads=[],csv=[];
  const tabs=Object.keys(rowArrays).map(status=>({dataset:{status},textContent:`${status}(999)`,hidden:false,classList:classList()}));
  function node(selector){
    if(!nodes.has(selector))nodes.set(selector,{value:'',innerHTML:'',classList:classList(),addEventListener(name,handler){events.set(`${selector}:${name}`,handler);}});
    return nodes.get(selector);
  }
  const blocked={_html:'<option value="">全部库存类型</option><option value="暂存">暂存</option><option value="拦截">拦截</option>',_value:'',get innerHTML(){return this._html;},set innerHTML(value){this._html=value;this._value='';},get value(){return this._value;},set value(value){this._value=[...this._html.matchAll(/value="([^"]*)"/g)].some(match=>match[1]===value)?value:'';},addEventListener(){}};
  const filters=Object.fromEntries(['keyword','customer','request','inbound','releaseType','transfer','fba','dispatch','container','pallet','financialAudit'].map(name=>[name,node(`#${name}Filter`)]));
  filters.blocked=blocked;
  let renderCount=0;
  const c={activeInventoryPage:'staging',activeStatus:'暂存',lastInstructionStatus:'待审批',filters,selected:new Set(),visibleRows:[],instructionStatusDrafts:new Map(),$:node,confirmDiscardInstructionStatusDrafts:()=>true,activateWarehousePage:(...args)=>activations.push(args),renderRows:()=>{renderCount++;},getListInstructionRows:()=>[],getInstructionCount:()=>0,getInstructionText:()=>'',window:{alert:message=>{throw Error(message);}},document:{querySelector:selector=>tabs.find(tab=>selector===`.status-tab[data-status="${tab.dataset.status}"]`)||null,querySelectorAll:selector=>selector==='.status-tab[data-status]'?tabs:[],createElement:()=>({click(){downloads.push(this.download);}})},Blob:class{constructor(parts){csv.push(parts.join(''));}},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}};
  for(const [status,name] of Object.entries(rowArrays))c[name]=rows(status);
  const names=['isApprovalView','isInstructionView','isInstructionPendingView','isInstructionProcessingView','isOutboundView','isShippedView','isRejectedView','isDestroyedView','isTerminalRequestView','getOutboundViewRows','isRequestTableView','getInstructionViewRows','getActiveStatusRows','isStagingInventoryRow','getReleaseType','applyFilters','updateStatusTabCount','showInventorySection'];
  const fragments=names.map(actualFunction);
  fragments.push(actualBlock('$("#resetButton").addEventListener','Object.values(filters).forEach((control) => {\n  control.addEventListener'));
  fragments.push(actualBlock('$("#exportButton").addEventListener','const approvalReviewOverlay'));
  vm.runInNewContext(fragments.join('\n'),c);
  return {c,tabs,events,activations,downloads,csv,node,renderCount:()=>renderCount};
}

test('each temporary inventory stage excludes all return markers and preserves temporary and intercept stock',()=>{
  const {c}=harness();
  for(const status of ['暂存','待出库','已出库']){
    c.activeStatus=status;
    const original=c[rowArrays[status]],visible=c.getActiveStatusRows();
    assert.equal(visible.length,2);assert.equal(visible[0],original[0]);assert.equal(visible[1],original[1]);
    assert.ok(visible.every(c.isStagingInventoryRow));assert.ok(original.slice(2).every(row=>!c.isStagingInventoryRow(row)));
    assert.equal(original.length,5,'View scoping cannot delete workflow records.');
  }
});
test('instruction approval, processing and terminal stages retain associated return instructions',()=>{
  const {c}=harness();c.activeInventoryPage='instructions';
  for(const status of ['待审批','指令待处理','指令处理中','销毁','审批拒绝']){
    c.activeStatus=status;
    assert.equal(c.getActiveStatusRows(),c[rowArrays[status]]);
    assert.equal(c.getActiveStatusRows().length,5);
  }
});
test('temporary inventory status counts exclude returns and instruction counts retain their supplied total',()=>{
  const {c,tabs}=harness();
  for(const status of ['暂存','待出库','已出库']){
    c.updateStatusTabCount(status,5);
    assert.equal(tabs.find(tab=>tab.dataset.status===status).textContent,`${status}(2)`);
    c.updateStatusTabCount(status,999);
    assert.equal(tabs.find(tab=>tab.dataset.status===status).textContent,`${status}(2)`);
  }
  c.activeInventoryPage='instructions';c.updateStatusTabCount('待审批',5);
  assert.equal(tabs.find(tab=>tab.dataset.status==='待审批').textContent,'待审批(5)');
});
test('navigation rebuilds inventory types for its page and preserves valid filters within that page',()=>{
  const h=harness(),{c}=h;c.filters.blocked.value='拦截';c.showInventorySection('staging','待出库');
  assert.ok(!c.filters.blocked.innerHTML.includes('退换货'));assert.equal(c.filters.blocked.value,'拦截');
  assert.equal(c.visibleRows.length,1);assert.equal(c.visibleRows[0].customer,'INTERCEPT_CUSTOMER');
  assert.ok(h.tabs.filter(tab=>!tab.hidden).every(tab=>['暂存','待出库','已出库'].includes(tab.dataset.status)));
  c.showInventorySection('instructions','待审批');
  assert.ok(c.filters.blocked.innerHTML.includes('退换货'));assert.equal(c.filters.blocked.value,'');
  c.filters.blocked.value='退换货';c.showInventorySection('instructions','指令处理中');
  assert.equal(c.filters.blocked.value,'退换货');assert.equal(c.visibleRows.length,1);assert.equal(c.visibleRows[0].customer,'RETURN_TYPE_CUSTOMER');
  c.showInventorySection('staging','暂存');
  assert.ok(!c.filters.blocked.innerHTML.includes('退换货'));assert.equal(c.filters.blocked.value,'');
  assert.equal(c.visibleRows.length,2);assert.equal(h.activations.at(-1)[0],'staging');
});
test('search, reset and CSV export use the scoped temporary rows for all three stages',()=>{
  for(const status of ['暂存','待出库','已出库']){
    const h=harness(),{c}=h;c.activeStatus=status;c.filters.keyword.value='RETURN';c.applyFilters();
    assert.equal(c.visibleRows.length,0,'Searching return identifiers cannot reveal hidden rows.');
    c.filters.keyword.value='INTERCEPT';c.applyFilters();assert.equal(c.visibleRows.length,1);assert.equal(c.visibleRows[0].customer,'INTERCEPT_CUSTOMER');
    h.events.get('#resetButton:click')();
    assert.equal(c.filters.keyword.value,'');assert.equal(c.visibleRows.length,2);
    h.events.get('#exportButton:click')();
    assert.equal(h.csv.length,1);assert.ok(h.csv[0].includes('TEMP_CUSTOMER'));assert.ok(h.csv[0].includes('INTERCEPT_CUSTOMER'));assert.ok(!h.csv[0].includes('RETURN_'));
    assert.equal(h.downloads.length,1);assert.ok(h.renderCount()>=3);
  }
});
test('initial temporary inventory HTML omits the return inventory type',()=>{
  const match=html.match(/<select id="blockedFilter">([^]*?)<\/select>/);
  assert.ok(match);assert.ok(match[1].includes('value="暂存"'));assert.ok(match[1].includes('value="拦截"'));assert.ok(!match[1].includes('退换货'));
});
