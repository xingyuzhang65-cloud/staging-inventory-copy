// Template values and confirmed warehouse receipt remain separate.
export const TEMPLATE_FIELDS=[
  {key:'customer',label:'客户名称'},{key:'name',label:'产品名称'},{key:'sku',label:'SKU'},
  {key:'image',label:'预报产品图片'},{key:'quantity',label:'预报产品数量(个)'},
  {key:'weight',label:'预报产品重量(单个产品KG)'},{key:'dimensions',label:'外箱尺寸(cm)'},
  {key:'packing',label:'装箱数量'},{key:'tracking',label:'追踪单号'},{key:'returnedAt',label:'退仓时间'},
  {key:'reportedReceivedAt',label:'入库时间'},{key:'reportedReceived',label:'入库个数(个)'},
  {key:'reportedBoxes',label:'入库件数(箱)'},{key:'requirement',label:'操作要求'},
  {key:'location',label:'货物目前所在地'}
];
export function productReceipt(o,p){
  if(!p)return {packages:o.packages,known:o.boxes.filter(b=>b.counted),unknown:o.boxes.filter(b=>!b.counted),received:o.boxes.filter(b=>b.counted).reduce((n,b)=>n+b.items.reduce((s,i)=>s+i.quantity,0),0),boxes:o.boxes.length,times:[...new Set(o.boxes.map(b=>b.receivedAt))],tracking:o.packages.map(k=>k.tracking)};
  const packages=o.packages.filter(k=>k.items.some(i=>i.productId===p.id)||(k.productIds||[]).includes(p.id));
  const known=o.boxes.filter(b=>b.counted&&b.items.some(i=>i.productId===p.id));
  const unknown=o.boxes.filter(b=>!b.counted&&packages.some(k=>k.id===b.packageId));
  return {packages,known,unknown,received:known.reduce((n,b)=>n+b.items.filter(i=>i.productId===p.id).reduce((s,i)=>s+i.quantity,0),0),boxes:known.length,times:[...new Set([...known,...unknown].map(b=>b.receivedAt))],tracking:[...new Set([...packages.map(k=>k.tracking),...String(p.tracking||'').split(/[;；,，\n]+/).map(s=>s.trim()).filter(Boolean)])]};
}
export function templateValue(o,p,key,{reported=false}={}){
  if(key==='customer')return o.customer||'';
  if(!p){
    const r=productReceipt(o,null);
    if(key==='name')return o.unclaimedDescription||'待核实货物';
    if(key==='quantity')return o.registrationType==='unforecasted'?'未预报':'';
    if(key==='tracking')return r.tracking.filter(Boolean).join('；');
    if(key==='reportedReceivedAt')return r.times.filter(Boolean).join('；');
    if(key==='reportedReceived')return r.unknown.length?(r.received?r.received+' + 未清点':'未清点'):r.received;
    if(key==='reportedBoxes')return r.boxes;
    return '';
  }
  if(key==='name')return p.name||p.sku||'待核实产品';
  if(key==='quantity'&&o.registrationType==='unforecasted')return '未预报';
  if(key==='image'&&p.imageVisibility==='warehouse')return '';
  if(key==='dimensions')return (p.dimensions||[]).some(value=>value!==null&&value!==undefined&&value!=='')?(p.dimensions||[]).map(value=>value??'—').join(' × '):'';
  if(reported)return p[key]??'';
  const r=productReceipt(o,p);
  if(key==='tracking')return r.tracking.join('；');
  if(key==='reportedReceivedAt')return r.times.join('；');
  if(key==='reportedReceived')return r.unknown.length?(r.received?r.received+' + 未清点':'未清点'):r.received;
  if(key==='reportedBoxes')return r.unknown.length?r.boxes+' + '+r.unknown.length+' 箱未清点关联':r.boxes;
  return p[key]??'';
}
export function matchesProductFilters(o,f){
  const has=(value,query)=>String(value||'').toLowerCase().includes(String(query||'').trim().toLowerCase());
  const keys=['productName','sku','requirement','location','quantityMin','quantityMax','weightMin','weightMax','packingMin','packingMax','returnedFrom','returnedTo'];
  if(!keys.some(key=>f[key]!==undefined&&f[key]!==''))return true;
  return o.products.some(p=>{
    for(const [key,prop] of [['productName','name'],['sku','sku'],['requirement','requirement'],['location','location']])if(f[key]&&!has(p[prop],f[key]))return false;
    for(const key of ['quantity','weight','packing']){
      if((f[key+'Min']!==undefined&&f[key+'Min']!==''||f[key+'Max']!==undefined&&f[key+'Max']!=='')&&(p[key]===null||p[key]===undefined||p[key]===''))return false;
      if(f[key+'Min']!==undefined&&f[key+'Min']!==''&&Number(p[key]||0)<Number(f[key+'Min']))return false;
      if(f[key+'Max']!==undefined&&f[key+'Max']!==''&&Number(p[key]||0)>Number(f[key+'Max']))return false;
    }
    if(f.returnedFrom&&(!p.returnedAt||p.returnedAt.slice(0,10)<f.returnedFrom)||f.returnedTo&&(!p.returnedAt||p.returnedAt.slice(0,10)>f.returnedTo))return false;
    return true;
  });
}
export function exportProductGrid(orders){
  const business=[['id','退换货单号'],['warehouse','退回仓库'],['source','退件来源'],['status','退换货状态'],['created','申请时间'],['updated','最近更新时间']];
  return [[...business.map(([,label])=>label),...TEMPLATE_FIELDS.map(f=>f.key==='reportedReceivedAt'?'到仓时间':f.label),'出仓时间'],...orders.flatMap(o=>(o.products.length?o.products:[null]).map(p=>[...business.map(([key])=>o[key]||''),...TEMPLATE_FIELDS.map(({key})=>templateValue(o,p,key)),productStorage(o,p).outboundAt]))];
}
export function productStorage(o,p=null){
  const receipt=productReceipt(o,p),boxes=[...receipt.known,...receipt.unknown];
  const times=[...new Set(boxes.filter(b=>b.outbound&&b.outboundAt).map(b=>b.outboundAt))].sort();
  return {arrivedAt:[...receipt.times].sort().join('；'),outboundAt:times.join('；'),inStock:boxes.filter(b=>!b.outbound).length,hasMissingTime:boxes.some(b=>b.outbound&&!b.outboundAt)};
}
