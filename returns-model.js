// Return orders keep forecast units, actual units and physical boxes separate.
export const STATUSES = ['待受理','待退回','退回中','待认领','待指令','处理中','已完成','已关闭'];
export const CLIENTS = [{name:'星河跨境',code:'KH001'},{name:'海拓电商',code:'KH002'},{name:'优品出海',code:'KH003'},{name:'北辰贸易',code:'KH004'}];
export const WAREHOUSES = ['洛杉矶仓 · LA','芝加哥仓 · CHI','新泽西仓 · NJ'];
export const SOURCES = ['客户预报','国外代理反馈','其他'];
const OPERATOR = '仓库运营 · Demo';
const TYPES = ['库内增值服务','发货计划','自提','销毁'];
const INSTRUCTION_STATUSES = ['待审批','指令待处理','指令处理中','指令处理完成','指令处理完成、待出库','待出库','已出库','已完成','审批拒绝','已取消'];
let sequence = 0;
const pad = n => String(n).padStart(2,'0');
export function now(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;}
export function id(prefix='RT'){return `${prefix}-${Date.now().toString(36).toUpperCase()}-${(++sequence).toString(36).toUpperCase()}`;}
const str = v => String(v ?? '').trim();
const fail = message => {throw new Error(message);};
const assert = (ok,message) => {if(!ok)fail(message);};
const integer = (v,label,min=0) => {const n=Number(v);assert(v!==''&&v!==null&&v!==undefined&&Number.isSafeInteger(n)&&n>=min,`${label}须为${min?'正':'非负'}整数`);return n;};
const nonnegative = (v,label) => {const n=Number(v);assert(Number.isFinite(n)&&n>=0,`${label}须为非负数`);return n;};
function date(v,label,required=false){
  const s=str(v).replace('T',' ');if(!s){assert(!required,`请填写${label}`);return '';}
  const match=/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  assert(match,`${label}日期格式无效`);const [y,m,d,h,mi,se]=match.slice(1).map(x=>Number(x||0));
  const result=new Date(y,m-1,d,h,mi,se);assert(result.getFullYear()===y&&result.getMonth()===m-1&&result.getDate()===d&&result.getHours()===h&&result.getMinutes()===mi&&result.getSeconds()===se,`${label}日期无效`);
  return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(se)}`;
}
function customer(name,code,required=false){
  name=str(name);code=str(code);if(!name&&!code){assert(!required,'客户预报必须选择客户');return {customer:'',customerCode:''};}
  const c=CLIENTS.find(c=>c.name===name&&c.code===code);assert(c,'请选择客户列表中名称与编码一致的客户');return {customer:c.name,customerCode:c.code};
}
function mappings(items,products,required=false){
  assert(Array.isArray(items),'SKU 明细须为数组');assert(!required||items.length,'请关联包裹 SKU 及产品个数');
  const seen=new Set();return items.map(i=>{const productId=str(i.productId);assert(products.some(p=>p.id===productId),'SKU 关联的产品不存在');assert(!seen.has(productId),'同一 SKU 不能重复关联');seen.add(productId);return {productId,quantity:integer(i.quantity,'产品个数',1)};});
}
function product(data){
  const name=str(data.name),sku=str(data.sku);assert(name&&sku,'请填写产品名称和 SKU');
  const dimensions=data.dimensions??[0,0,0];assert(Array.isArray(dimensions)&&dimensions.length===3,'外箱尺寸须包含长宽高');
  const optionalCount=(value,label)=>value===''||value===undefined||value===null?null:integer(value,label);
  const reportedDate=str(data.reportedReceivedAt);
  return {id:str(data.id)||id('P'),name,sku,image:str(data.image),quantity:integer(data.quantity,'预报产品个数',1),weight:nonnegative(data.weight??0,'单件重量'),dimensions:dimensions.map(v=>nonnegative(v,'外箱尺寸')),packing:integer(data.packing??0,'装箱数量'),returnedAt:date(data.returnedAt,'退仓时间'),tracking:str(data.tracking),requirement:str(data.requirement),location:str(data.location),reportedReceivedAt:date(reportedDate&&/^\d{4}-\d{2}-\d{2}$/.test(reportedDate)?reportedDate+' 00:00:00':reportedDate,'模板入库时间'),reportedReceived:optionalCount(data.reportedReceived,'模板入库个数'),reportedBoxes:optionalCount(data.reportedBoxes,'模板入库件数')};
}
export function migrate(orders){
  if(!Array.isArray(orders))return seed();
  for(const o of orders)for(const p of o.products||[])Object.assign(p,{tracking:str(p.tracking),requirement:str(p.requirement),location:str(p.location),reportedReceivedAt:str(p.reportedReceivedAt),reportedReceived:p.reportedReceived??null,reportedBoxes:p.reportedBoxes??null});
  for(const o of orders){
    o.registrationType ||= !o.customer&&o.boxes?.length?'unforecasted':'template';
    for(const receipt of o.receipts||[])receipt.imageVisibility='warehouse';
    for(const box of o.boxes||[])box.outboundAt=str(box.outboundAt);
  }
  return orders;
}
function parcel(data,products,existing=[]){
  const tracking=str(data.tracking);assert(tracking,'请填写追踪单号');assert(!existing.some(p=>p.tracking.toLowerCase()===tracking.toLowerCase()),'追踪单号已存在');
  const items=mappings(data.items??[],products);const forecast=integer(data.forecast,'包裹预报数量',1);
  assert(items.reduce((n,i)=>n+i.quantity,0)<=forecast,'SKU 明细合计不能超过包裹预报数量');
  const carrier=str(data.carrier);assert(carrier,'请选择物流商');
  const logistics=str(data.logistics)|| (data.shipped?'运输中':'未发运');assert(['未发运','运输中','物流已妥投','待核实','退回异常'].includes(logistics),'物流状态无效');
  return {id:str(data.id)||id('PK'),tracking,carrier,items,forecast,returnedAt:date(data.returnedAt,'退仓时间'),shipped:date(data.shipped,'发运时间'),eta:date(data.eta,'预计送达时间'),logistics,note:str(data.note),received:false};
}
function orderData(data){
  const source=str(data.source)||SOURCES[0];assert(SOURCES.includes(source),'退件来源无效');assert(WAREHOUSES.includes(data.warehouse),'请选择退回仓库');
  const c=customer(data.customer,data.customerCode,source==='客户预报');
  assert(Array.isArray(data.products??[]),'产品明细须为数组');const products=(data.products??[]).map(product);assert(source!=='客户预报'||products.length,'客户预报必须填写产品明细');
  assert(new Set(products.map(p=>p.id)).size===products.length,'产品编号重复');
  const packages=[];assert(Array.isArray(data.packages??[]),'包裹明细须为数组');
  for(const p of data.packages??[]){const next=parcel(p,products,packages);assert(!packages.some(k=>k.id===next.id),'包裹编号重复');packages.push(next);}
  return {...c,warehouse:data.warehouse,source,reason:str(data.reason),request:str(data.request),originalTracking:str(data.originalTracking),ticket:str(data.ticket),ticketStatus:str(data.ticketStatus),remark:str(data.remark),products,packages};
}
const terminal = i => ['审批拒绝','已取消','已出库','已完成'].includes(i.status)||(i.status==='指令处理完成'&&i.type==='库内增值服务');
const activeInstructions = o => o.instructions.filter(i=>!terminal(i));
const live = o => !['已关闭','已完成'].includes(o.status);
const usable = (o,b) => !b.outbound&&b.claimed&&!b.reservedBy&&Boolean(o.customerCode)&&b.customerCode===o.customerCode;
export function totals(o){
  const inStock=o.boxes.filter(b=>!b.outbound),reserved=inStock.filter(b=>b.reservedBy);
  return {forecast:o.products.length?o.products.reduce((n,p)=>n+p.quantity,0):o.packages.reduce((n,p)=>n+p.forecast,0),received:o.boxes.filter(b=>b.counted).reduce((n,b)=>n+b.items.reduce((s,i)=>s+i.quantity,0),0),receivedUnknown:o.boxes.some(b=>!b.counted),boxes:o.boxes.length,inStock:inStock.length,reserved:reserved.length,available:inStock.filter(b=>usable(o,b)).length,outbound:o.boxes.filter(b=>b.outbound).length};
}
export function receiptStatus(o){
  if(o.receipts.length)return o.packages.length&&o.packages.every(p=>p.received)?'已入仓':'部分入仓';
  if(o.packages.some(p=>p.logistics==='物流已妥投'))return '待仓库确认';
  if(o.packages.some(p=>p.shipped||['运输中','待核实','退回异常'].includes(p.logistics)))return '运输中';
  return '未发运';
}
export function claimStatus(o){const n=o.boxes.filter(b=>b.claimed).length;return n===0?'待认领':n===o.boxes.length?'已认领':'部分认领';}
export function refresh(o){
  if(o.closedReason||o.status==='已关闭')o.status='已关闭';
  else if(!o.acceptedAt)o.status='待受理';
  else if(!o.boxes.length)o.status=receiptStatus(o)==='未发运'?'待退回':'退回中';
  else if(o.boxes.some(b=>!b.claimed&&!b.outbound))o.status='待认领';
  else if(activeInstructions(o).length)o.status='处理中';
  else if(o.boxes.some(b=>usable(o,b)))o.status='待指令';
  else if(o.packages.length&&o.packages.every(p=>p.received)&&o.boxes.every(b=>b.outbound))o.status='已完成';
  else o.status='退回中';
  return o;
}
export function can(o,action){
  if(action==='warehouse')return STATUSES.includes(o.status);
  if(action==='accept'||action==='reject')return o.status==='待受理'&&!o.boxes.length&&!activeInstructions(o).length;
  if(action==='edit')return ['待受理','待退回'].includes(o.status)&&!o.boxes.length&&!activeInstructions(o).length;
  if(action==='close')return live(o)&&!o.boxes.length&&!activeInstructions(o).length;
  if(!live(o))return false;
  if(action==='track')return Boolean(o.acceptedAt);
  if(action==='receive')return Boolean(o.acceptedAt)&&o.packages.some(p=>!p.received);
  if(action==='notify'||action==='claim')return Boolean(o.acceptedAt)&&o.boxes.some(b=>!b.outbound&&!b.claimed);
  if(action==='instruct')return Boolean(o.acceptedAt)&&o.boxes.some(b=>usable(o,b));
  if(action==='fee')return Boolean(o.acceptedAt);
  return false;
}
function allowed(o,action){assert(can(o,action),`当前状态不可执行${({edit:'编辑预报',accept:'受理',reject:'拒绝受理',close:'关闭',track:'登记包裹',receive:'登记收货',claim:'认领',notify:'通知认领',instruct:'下指令',fee:'登记费用'})[action]||action}`);}
export function log(o,action,note=''){assert(str(action),'日志操作不能为空');const time=now();o.logs.push({time,operator:OPERATOR,action:str(action),note:str(note)});o.updated=time;refresh(o);return o;}
export function createOrder(data){
  const normalized=orderData(data),time=now();const o={id:id('RT'),...normalized,registrationType:'template',status:'待受理',created:time,updated:time,acceptedAt:'',acceptedBy:'',closedReason:'',receipts:[],boxes:[],instructions:[],fees:[],logs:[]};
  log(o,'提交退换货申请','等待仓库受理');return o;
}
export function editOrder(o,data){allowed(o,'edit');const next=orderData(data);Object.assign(o,next);return log(o,'编辑预报','更新客户、产品及包裹预报');}
export function registerUnclaimedReturn(data){
  assert(data.confirmed===true,'请确认货物已实际到达海外仓');
  assert(WAREHOUSES.includes(data.warehouse),'请选择退回仓库');
  const time=date(data.time,'实际到仓时间',true),boxes=integer(data.boxes,'实际到仓箱数',1);
  const o=createOrder({warehouse:data.warehouse,source:'其他',reason:'未预报到仓，货主待核实',request:'核实货主后按客户指令处理',remark:str(data.note),products:[],packages:[]});
  o.registrationType='unforecasted';o.unclaimedDescription=str(data.description)||'待核实退回货物';
  o.acceptedAt=now();o.acceptedBy=OPERATOR;
  const p={id:id('PK'),tracking:str(data.tracking),carrier:str(data.carrier)||'待核实',forecast:null,items:[],returnedAt:'',shipped:'',eta:'',logistics:'物流已妥投',note:str(data.note),received:false,unforecasted:true};
  o.packages.push(p);
  receive(o,{packageId:p.id,time,boxes,counted:false,items:[],note:str(data.note),image:str(data.image),complete:true});
  log(o,'登记无主退换货',`${o.warehouse} · 实际到仓 ${boxes} 箱 · 待核实货主`);
  return o;
}
export function editWarehouse(o,warehouse){
  allowed(o,'warehouse');assert(WAREHOUSES.includes(warehouse),'请选择有效退回仓库');
  if(o.warehouse===warehouse)return o;
  const previous=o.warehouse,status=o.status;o.warehouse=warehouse;o.returnAddress='';
  for(const p of o.products)if(p.location===previous+' · 退件区')p.location=warehouse+' · 退件区';
  log(o,'修改退回仓库',`${previous} → ${warehouse}`);o.status=status;return o;
}
// Warehouse receipt photos never appear in customer-facing data or exports.
export function receiptImage(receipt,audience='customer'){return audience==='warehouse'?str(receipt?.image):'';}
export function accept(o){allowed(o,'accept');o.acceptedAt=now();o.acceptedBy=OPERATOR;return log(o,'受理申请','仓库已确认可接收退件');}
export function close(o,reason,rejected=false){allowed(o,rejected?'reject':'close');reason=str(reason);assert(reason,'请填写关闭原因');o.closedReason=reason;o.status='已关闭';return log(o,rejected?'拒绝受理':'关闭申请',reason);}
export function addPackage(o,data){allowed(o,'track');const p=parcel(data,o.products,o.packages);assert(!o.packages.some(k=>k.id===p.id),'包裹编号重复');o.packages.push(p);log(o,'登记退回包裹',p.tracking);return p;}
export function updateLogistics(o,packageId,status){
  assert(live(o)&&o.acceptedAt,'当前状态不可更新物流');const p=o.packages.find(p=>p.id===packageId);assert(p,'包裹不存在');assert(['运输中','物流已妥投','待核实','退回异常'].includes(status),'物流状态无效');p.logistics=status;return log(o,'更新物流反馈',`${p.tracking} · ${status}（不代表仓库实际收货）`);
}
function selected(o,boxIds){assert(Array.isArray(boxIds)&&boxIds.length,'请至少选择一个箱');assert(new Set(boxIds).size===boxIds.length,'箱号不能重复选择');return boxIds.map(v=>{const b=o.boxes.find(b=>b.id===v);assert(b,'所选箱不存在');assert(!b.outbound,'所选箱已出库');return b;});}
export function receive(o,data){
  allowed(o,'receive');const p=o.packages.find(p=>p.id===data.packageId);assert(p&&!p.received,'包裹不存在或已确认收齐');
  const time=date(data.time,'实际入库时间',true),boxes=integer(data.boxes,'入库箱数',1);assert(typeof data.counted==='boolean','请确认是否清点内件');
  assert(data.complete===undefined||typeof data.complete==='boolean','收齐标记无效');const counted=data.counted;
  const items=counted?mappings(data.items??[],o.products,true):[];if(!counted)assert((data.items??[]).length===0,'未清点不能填写实际产品数量');
  const receipt={id:id('RC'),packageId:p.id,time,boxes,counted,items,note:str(data.note),difference:str(data.difference),image:str(data.image),imageVisibility:'warehouse'};
  // Allocate each SKU as integers across the actual boxes; totals always equal the receipt.
  const actual=Array.from({length:boxes},(_,index)=>({id:id('BX'),packageId:p.id,storageNo:id('TS'),receivedAt:time,counted,items:items.map(i=>({productId:i.productId,quantity:Math.floor(i.quantity/boxes)+(index<i.quantity%boxes?1:0)})).filter(i=>i.quantity>0),claimed:false,customer:o.customer,customerCode:o.customerCode,notifiedAt:'',claimedAt:'',claimedBy:'',claimNote:'',reservedBy:'',outbound:false,outboundAt:''}));
  o.receipts.push(receipt);o.boxes.push(...actual);if(data.complete!==false)p.received=true;
  log(o,'登记实际收货',`${p.tracking} · ${boxes} 箱 · ${counted?items.reduce((n,i)=>n+i.quantity,0)+' 个':'内件未清点'}`);return receipt;
}
export function notify(o,boxIds){allowed(o,'notify');const boxes=selected(o,boxIds);assert(boxes.every(b=>!b.claimed),'已认领箱不需再次通知');const time=now();for(const b of boxes)b.notifiedAt=time;return log(o,'通知客户认领',boxes.map(b=>b.id).join('、'));}
export function claim(o,data){
  allowed(o,'claim');const c=customer(data.customer,data.customerCode,true),boxes=selected(o,data.boxIds);assert(boxes.every(b=>!b.claimed),'所选箱已经认领');
  assert(!o.customerCode||o.customerCode===c.customerCode,'认领客户与申请归属冲突');assert(boxes.every(b=>!b.customerCode||b.customerCode===c.customerCode),'所选箱客户归属冲突');
  const time=now();if(!o.customerCode)Object.assign(o,c);for(const b of boxes)Object.assign(b,c,{claimed:true,claimedAt:time,claimedBy:OPERATOR,claimNote:str(data.note)});
  return log(o,'确认客户认领',`${c.customer} · ${boxes.map(b=>b.id).join('、')}`);
}
export function instruct(o,data){
  allowed(o,'instruct');assert(TYPES.includes(data.type),'指令类型无效');const boxes=selected(o,data.boxIds);assert(boxes.every(b=>usable(o,b)),'所选箱须已收货、已认领、归属一致且未被占用');assert(str(data.note),'请填写具体操作要求');
  const i={id:id('INS'),source:o.id,type:data.type,boxIds:boxes.map(b=>b.id),note:str(data.note),status:'待审批',created:now(),operator:OPERATOR};
  o.instructions.push(i);for(const b of boxes)b.reservedBy=i.id;log(o,'提交处理指令',`${i.id} · ${i.type} · ${boxes.length} 箱`);return i;
}
export function syncInstruction(o,instructionId,status,{outboundAt=''}={}){
  const i=o.instructions.find(i=>i.id===instructionId);assert(i,'指令不存在');assert(INSTRUCTION_STATUSES.includes(status),'指令状态无效');if(i.status===status)return i;
  if(terminal(i)){
    assert(status==='已完成'&&(i.status==='已出库'||i.type==='库内增值服务'&&i.status==='指令处理完成'),'已结束指令不能重新进入处理流程');
    i.status=status;log(o,'同步指令状态',`${i.id} · ${status}`);return i;
  }
  const boxes=i.boxIds.map(v=>o.boxes.find(b=>b.id===v));assert(boxes.every(Boolean),'指令关联箱不存在');
  const cancelled=['审批拒绝','已取消'].includes(status),finished=['指令处理完成','已完成'].includes(status);
  const outbound=i.type!=='库内增值服务'&&['已出库','已完成'].includes(status);
  assert(i.type!=='库内增值服务'||!['已出库','指令处理完成、待出库','待出库'].includes(status),'库内增值服务不产生出库');
  assert(boxes.every(b=>b.reservedBy===i.id&&!b.outbound),'指令箱已失去有效占用');
  const suppliedTime=outboundAt&&/Z$/.test(outboundAt)?new Date(outboundAt).toLocaleString('sv-SE'):outboundAt;
  const time=outbound?date(suppliedTime||now(),'实际出仓时间',true):'';
  if(outbound)assert(boxes.every(b=>!b.receivedAt||time>=b.receivedAt.replace('T',' ')),'出仓时间不能早于实际到仓时间');
  i.status=status;if(outbound)i.outboundAt=time;for(const b of boxes){if(outbound){b.outbound=true;b.outboundAt=time;}if(cancelled||outbound||(i.type==='库内增值服务'&&finished))b.reservedBy='';}
  log(o,'同步指令状态',`${i.id} · ${status}`);return i;
}
export function updateOutboundTime(o,instructionId,value){
  const i=o.instructions.find(i=>i.id===instructionId);assert(i&&i.type!=='库内增值服务'&&['已出库','已完成'].includes(i.status),'请选择已实际出仓的指令');
  const boxes=i.boxIds.map(id=>o.boxes.find(b=>b.id===id));assert(boxes.length&&boxes.every(b=>b?.outbound),'指令关联箱尚未全部出仓');
  const time=date(value,'实际出仓时间',true);assert(boxes.every(b=>!b.receivedAt||time>=b.receivedAt.replace('T',' ')),'出仓时间不能早于实际到仓时间');
  const status=o.status;i.outboundAt=time;for(const b of boxes)b.outboundAt=time;
  log(o,'更新实际出仓时间',`${i.id} · ${time}`);o.status=status;return i;
}
export function addFee(o,data){allowed(o,'fee');const name=str(data.name),currency=str(data.currency);assert(name,'请填写费用项目');assert(['USD','CAD','CNY'].includes(currency),'币种无效');const fee={name,amount:nonnegative(data.amount,'费用金额'),currency,note:str(data.note),time:now(),operator:OPERATOR};o.fees.push(fee);log(o,'登记报价 / 费用',`${fee.name} · ${fee.currency} ${fee.amount}`);return fee;}

export function seed(){
  const orders=[];
  function make(n,{unknown=false,multi=false,two=false}={}){
    const c=CLIENTS[(n-1)%CLIENTS.length],products=unknown?[]:[{id:`P-DEMO-${n}-1`,name:'无线蓝牙耳机',sku:`EAR-US-${pad(n)}`,quantity:two?12:8,weight:0.18,dimensions:[18,12,6],packing:2,returnedAt:'2026-10-02 09:00:00'},...(multi?[{id:`P-DEMO-${n}-2`,name:'USB-C 充电线',sku:`CBL-US-${pad(n)}`,quantity:4,weight:0.06,dimensions:[15,8,3],packing:1,returnedAt:''}]:[])];
    const o=createOrder({customer:unknown?'':c.name,customerCode:unknown?'':c.code,warehouse:WAREHOUSES[(n-1)%3],source:unknown?'国外代理反馈':'客户预报',reason:unknown?'代理收到无预报退件':'客户退货',request:'核实退件后安排处理',originalTracking:`OR-US-202610-${pad(n)}`,remark:'模拟数据，用于演示实际收货与后续处理',products,packages:[]});o.id=`RT-202610-${String(n).padStart(4,'0')}`;o.created=`2026-10-${pad(Math.min(n,9))} 09:30:00`;
    orders.push(o);return o;
  }
  function pack(o,n,items=o.products.map(p=>({productId:p.id,quantity:p.quantity})),logistics='运输中'){
    return addPackage(o,{tracking:`1ZDEMO${o.id.slice(-4)}${n}`,carrier:n===2?'FedEx':'UPS',items,forecast:items.reduce((s,i)=>s+i.quantity,0)||6,returnedAt:'2026-10-03 08:00:00',shipped:'2026-10-04 11:00:00',eta:'2026-10-08 16:00:00',logistics});
  }
  function received(o,p,{counted=true,boxes=2,complete=true}={}){return receive(o,{packageId:p.id,time:'2026-10-08 14:20:00',boxes,counted,items:counted?p.items:[],complete,note:counted?'仓库已逐项清点':'仅核对外箱标签，未开箱清点'});}
  function claimed(o){const c=CLIENTS.find(c=>c.code===o.customerCode)||CLIENTS[1];claim(o,{boxIds:o.boxes.map(b=>b.id),customer:c.name,customerCode:c.code,note:'客户已确认标签及原运单'});}
  make(1); // 待受理
  accept(make(2)); // 已受理，等待退回
  const transit=make(3,{multi:true});accept(transit);pack(transit,1); // 多 SKU 在途
  const delivered=make(4);accept(delivered);pack(delivered,1,undefined,'物流已妥投'); // 物流妥投，尚无实收
  const partial=make(5,{two:true});accept(partial);const pa=pack(partial,1,[{productId:partial.products[0].id,quantity:6}]);pack(partial,2,[{productId:partial.products[0].id,quantity:6}]);received(partial,pa); // 两包只收到一包
  const uncounted=make(6);accept(uncounted);received(uncounted,pack(uncounted,1),{counted:false,boxes:3});notify(uncounted,uncounted.boxes.map(b=>b.id)); // 实收箱，内件未知，已通知认领
  const closed=make(7);close(closed,'客户已撤回退件申请，尚未寄回',true); // 未实收的关闭样例
  const unknown=make(8,{unknown:true});accept(unknown);received(unknown,pack(unknown,1),{counted:false,boxes:1});unknown.ticket='TK-US-202610-008';unknown.ticketStatus='核实中';
  unknown.registrationType='unforecasted';unknown.unclaimedDescription='未预报快递退件 · 外箱标签待核实';for(const p of unknown.packages){p.unforecasted=true;p.forecast=null;}
  const available=make(9);accept(available);received(available,pack(available,1));claimed(available);
  const processing=make(10);accept(processing);received(processing,pack(processing,1));claimed(processing);const pending=instruct(processing,{type:'库内增值服务',boxIds:[processing.boxes[0].id],note:'核对 SKU 并更换标签'});syncInstruction(processing,pending.id,'指令处理中');
  const out=make(11);accept(out);received(out,pack(out,1),{boxes:3});claimed(out);const shipment=instruct(out,{type:'发货计划',boxIds:[out.boxes[0].id],note:'转发至客户指定地址'});syncInstruction(out,shipment.id,'已出库');
  const completed=make(12);accept(completed);received(completed,pack(completed,1));claimed(completed);const disposal=instruct(completed,{type:'销毁',boxIds:completed.boxes.map(b=>b.id),note:'客户确认销毁全部退件'});syncInstruction(completed,disposal.id,'已完成');
  for(const o of orders){refresh(o);o.updated='2026-10-09 10:00:00';for(const p of o.products)Object.assign(p,{requirement:o.instructions[0]?.note||o.request,location:o.status==='已完成'?'已按客户要求处理':o.boxes.length?o.warehouse+' · 退件区':o.packages.length?'退回运输途中':'客户所在地',tracking:'',reportedReceivedAt:'',reportedReceived:null,reportedBoxes:null});}return orders;
}
