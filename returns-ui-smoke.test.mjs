import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Executes the real UI and model without a browser; verifies rendered pages and routing.
const elements=new Map(),listeners=new Map(),stored=new Map();
function node(selector){if(!elements.has(selector))elements.set(selector,{hidden:false,innerHTML:'',textContent:'',dataset:{},elements:new Proxy({},{get:(target,key)=>target[key]||(target[key]={value:'',checked:false})}),reportValidity:()=>true,classList:{add(){},remove(){},toggle(){}},after(){},insertAdjacentHTML(){},querySelector(s){return node(s);},querySelectorAll(){return [];},focus(){},reset(){}});return elements.get(selector);}
const document={querySelector:node,createElement:()=>node('main'),body:node('body'),addEventListener(name,callback){const list=listeners.get(name)||[];list.push(callback);listeners.set(name,list);}};
const window={confirmDiscardInstructionStatusDrafts:()=>true,activateWarehousePage(){},ReturnsBridge:{sync(){},status(){return null;}}};
const context=vm.createContext({document,window,localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},location:{search:'?page=returns'},URL,URLSearchParams,Blob,TextDecoder,console,structuredClone,setTimeout:()=>0,clearTimeout(){}});
const modules=new Map();
async function load(file){if(modules.has(file))return modules.get(file);const module=new vm.SourceTextModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{context,identifier:file});modules.set(file,module);await module.link(specifier=>load(specifier.replace('./','')));return module;}
const ui=await load('returns.js');await ui.evaluate();
const model=modules.get('returns-model.js').namespace,seed=JSON.parse(stored.get('mw-returns-prototype-v1'));
assert.ok(seed.length>=10&&seed.length<=12,'Representative data must include 10–12 business cases.');
assert.equal(new Set([...node('#rtBody').innerHTML.matchAll(/data-rt-order="([^"]+)"/g)].map(m=>m[1])).size,10,'First page renders 10 complete orders.');
assert.equal((node('#rtBody').innerHTML.match(/data-rt-order=/g)||[]).length,11,'Products appear on individual rows.');
assert.ok(!node('main').hidden,'Direct route opens the returns page.');
function click(data,orderId=''){const target={disabled:false,dataset:data,closest(selector){if(selector==='[data-rt-order]')return orderId?{dataset:{rtOrder:orderId}}:null;if(selector==='[data-rt-action]'&&data.rtAction)return target;if(selector==='[data-rt-detail-tab]'&&data.rtDetailTab!=null)return target;return null;}};for(const callback of listeners.get('click')||[])callback({target});}
let detailChecks=0;
for(const order of seed){click({rtAction:'detail'},order.id);assert.ok(!node('#rtDrawer').hidden);for(let tab=0;tab<7;tab++){click({rtDetailTab:String(tab)});const html=node('#rtDrawer').innerHTML;assert.ok(html.includes(order.id));assert.ok(!/\bundefined\b|\bNaN\b/.test(html),'Details should render complete, valid business data.');assert.ok(html.includes('role="dialog"'));detailChecks++;}}
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
console.log(`Returns UI smoke checks passed: ${seed.length} scenarios, ${detailChecks} detail views, direct route and independent receipt states.`);
