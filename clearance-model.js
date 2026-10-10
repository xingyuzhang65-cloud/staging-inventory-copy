export const STATUSES = ['待受理','寻找买家中','待确认报价','待提货','待结算','已完成','已终止'];
export const RECEIPTS = ['未发运','运输中','部分入仓','已入仓'];
export const WAREHOUSES = ['洛杉矶一号仓 · LAX','新泽西仓 · NJ','达拉斯仓 · DFW'];
export const now = () => new Date().toLocaleString('sv-SE');
const uid = prefix => prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
const integer = (v, label) => { const n = Number(v); if (!Number.isSafeInteger(n) || n <= 0) throw Error(label + '须为大于 0 的整数'); return n; };
export const sum = (o, key) => o.products.reduce((n,p)=>n + p[key],0);
export const stock = p => p.received - p.delivered;
export const reserved = (o,pid) => o.quotes.filter(q=>q.product===pid && q.result==='已接受').reduce((n,q)=>n+q.quantity-q.delivered,0);
export const available = (o,p) => Math.max(0,stock(p)-reserved(o,p.id));
export const receipt = o => sum(o,'received') >= sum(o,'quantity') ? '已入仓' : sum(o,'received')>0 ? '部分入仓' : o.products.some(p=>p.shipped) ? '运输中' : '未发运';
export const acceptedTime = o => o.acceptedAt || o.searchAt || (o.logs||[]).find(l=>l.action==='受理申请'&&l.time)?.time || '';
const timestamp = value => value ? Date.parse(String(value).replace(' ','T')) : NaN;
const daysSince = (start,end=Date.now()) => Number.isFinite(timestamp(start)) ? Math.max(0,Math.floor((Number(end)-timestamp(start))/86400000)) : 0;
export const elapsed = o => daysSince(o.searchAt||acceptedTime(o));
export function clearanceProgress(o,at=Date.now()) {
  const acceptedAt=acceptedTime(o),started=Number.isFinite(timestamp(acceptedAt)),closed=isClosed(o);
  const closedAt=closed?o.closedAt||'':'',hasMissingEndTime=started&&closed&&!Number.isFinite(timestamp(closedAt));
  const end=closed&&Number.isFinite(timestamp(closedAt))?timestamp(closedAt):Number(at);
  const totalHours=started?Math.max(0,Math.floor((end-timestamp(acceptedAt))/3600000)):0;
  const days=Math.floor(totalHours/24),hours=totalHours%24,searchDays=daysSince(o.searchAt||acceptedAt,at);
  const searching=o.status==='寻找买家中',limitReached=searching&&searchDays>=30;
  return {acceptedAt,closedAt,started,days,hours,searchDays,hasMissingEndTime,
    durationText:!started?(o.status==='待受理'?'未受理':'受理时间待补录'):hasMissingEndTime?'结束时间待补录':days+' 天 '+hours+' 小时',
    feedbackDue:searching&&searchDays>=7&&!o.extended&&!limitReached,limitReached,
    firstFeedbackAt:started?new Date(timestamp(acceptedAt)+7*86400000).toISOString():'',
    searchDeadlineAt:started?new Date(timestamp(acceptedAt)+30*86400000).toISOString():''};
}
export const isClosed = o => ['已完成','已终止'].includes(o.status);
export function can(o,action) {
  const stage=o.status;
  if(action==='warehouse')return STATUSES.includes(stage);
  if(action==='edit'||action==='accept'||action==='cancel')return stage==='待受理';
  if(action==='receive'||action==='shipping')return ['待确认报价','待提货'].includes(stage)&&receipt(o)!=='已入仓';
  if(action==='quote')return stage==='寻找买家中'&&elapsed(o)<30;
  if(action==='decide')return stage==='待确认报价'&&o.quotes.some(q=>q.result==='待确认');
  if(action==='deliver')return !isClosed(o)&&o.quotes.some(q=>q.result==='已接受'&&q.delivered<q.quantity);
  if(action==='settle')return !isClosed(o)&&o.quotes.some(q=>q.result==='已接受'&&q.delivered===q.quantity&&!q.settled);
  if(action==='remind')return stage==='寻找买家中'&&elapsed(o)>=7;
  if(action==='extend')return stage==='寻找买家中'&&elapsed(o)>=7&&elapsed(o)<30&&!o.extended;
  if(action==='terminate')return ['寻找买家中','待确认报价'].includes(stage);
  return false;
}
const requireAction=(o,action)=>{if(!can(o,action))throw Error('当前状态不可执行此操作，请先完成当前阶段');};
export function log(o,action,note,user='客服 · 陈琳') { o.updated=now(); o.logs.unshift({time:o.updated,user,action,note}); }
export function editWarehouse(o,warehouse) {
  requireAction(o,'warehouse');
  if(!WAREHOUSES.includes(warehouse))throw Error('请选择有效清货仓库');
  if(o.warehouse===warehouse)return o;
  const previous=o.warehouse;o.warehouse=warehouse;
  log(o,'修改清货仓库',previous+' → '+warehouse);return o;
}
export function departureInfo(o,productId='') {
  const products=(o.products||[]).filter(p=>!productId||p.id===productId),ids=new Set(products.map(p=>p.id));
  const records=(o.deliveries||[]).filter(r=>ids.has(r.product)&&Number(r.quantity)>0);
  const valid=r=>r.time&&Number.isFinite(Date.parse(String(r.time).replace(' ','T')));
  const times=[...new Set(records.filter(valid).map(r=>r.time))].sort((a,b)=>Date.parse(a.replace(' ','T'))-Date.parse(b.replace(' ','T')));
  return {times,departedAt:times.at(-1)||'',inStock:products.reduce((n,p)=>n+stock(p),0),hasMissingTime:records.some(r=>!valid(r))||products.some(p=>p.delivered>0&&!records.some(r=>r.product===p.id&&valid(r)))};
}
export function refresh(o) {
  if (isClosed(o) || o.status==='待受理') return;
  if (o.quotes.some(q=>q.result==='待确认')) o.status='待确认报价';
  else if (o.quotes.some(q=>q.result==='已接受' && q.delivered<q.quantity)) o.status='待提货';
  else if (o.quotes.some(q=>q.result==='已接受' && !q.settled)) o.status='待结算';
  else if (sum(o,'delivered')===sum(o,'quantity') && sum(o,'received')===sum(o,'quantity')) {o.status='已完成';o.closedAt ||= now();}
  else o.status='寻找买家中';
}
export function acceptOrder(o) { if(o.status!=='待受理')throw Error('仅待受理申请可受理'); o.status='寻找买家中';o.acceptedAt=now();o.searchAt=o.acceptedAt;log(o,'受理申请','受理时间 '+o.acceptedAt+'；开始寻找买家，满 7 天反馈，累计最长 30 天，到期由人工处理'); }
export function receive(o,pid,qty,time,note,carrier) {
  requireAction(o,'receive');
  const p=o.products.find(p=>p.id===pid); if(!p)throw Error('请选择产品'); const n=integer(qty,'实收数量');
  if(n>p.quantity-p.received)throw Error('实收数量不能超过剩余待收数量');
  if(!time || !Number.isFinite(new Date(time).getTime()))throw Error('请选择有效入库时间');
  p.received+=n; p.shipped ||= time; o.receipts.unshift({id:uid('RC'),product:pid,quantity:n,time,tracking:p.tracking,carrier:carrier||'UPS',note});log(o,'登记收货',p.name+' 实收 '+n+' 件；'+(note||'无备注'),'仓库 · 李明'); refresh(o);
}
export function addQuote(o,pid,buyer,qty,amount) {
  requireAction(o,'quote');
  const p=o.products.find(p=>p.id===pid),n=integer(qty,'报价数量'),a=Number(amount);
  if(!p||!buyer.trim()||!Number.isFinite(a)||a<=0)throw Error('请填写买家、产品及有效报价金额');
  const committed=o.quotes.filter(q=>q.product===pid&&q.result==='已接受').reduce((n,q)=>n+q.quantity-q.delivered,0);
  if(n>p.quantity-p.delivered-committed)throw Error('报价数量超过未成交数量');
  o.quotes.unshift({id:uid('BJ'),product:pid,buyer:buyer.trim(),quantity:n,amount:a,time:now(),result:'待确认',delivered:0,settled:false});log(o,'新增报价',buyer+' 报价 USD '+a.toFixed(2)+' / '+n+' 件');refresh(o);
}
export function decideQuote(o,qid,accept) {
  requireAction(o,'decide');
  const q=o.quotes.find(q=>q.id===qid);if(!q||q.result!=='待确认'||isClosed(o))throw Error('该报价已处理');
  const p=o.products.find(p=>p.id===q.product);
  if(accept){const remaining=p.quantity-p.delivered-reserved(o,p.id);if(q.quantity>remaining)throw Error('报价数量超过未占用预报数量');q.result='已接受';}
  else q.result='已拒绝';
  log(o,accept?'接受报价':'拒绝报价',q.buyer+' · '+q.quantity+' 件'+(accept?'；保留待交付数量，实物在库不变':''),'客户 · '+o.customer);refresh(o);
}
export function deliver(o,qid,qty,time,receiver,note) {
  requireAction(o,'deliver');
  const q=o.quotes.find(q=>q.id===qid),n=integer(qty,'本次提货数量');
  if(!q||q.result!=='已接受'||q.delivered===q.quantity)throw Error('请选择待交付成交报价');
  const p=o.products.find(p=>p.id===q.product);
  if(n>q.quantity-q.delivered)throw Error('提货数量超过该成交的剩余待提数量');
  if(n>stock(p))throw Error('实物在库不足，请先登记收货');
  if(!time||!Number.isFinite(new Date(time).getTime())||!receiver.trim())throw Error('请填写提货时间和提货人');
  const arrived=p.arrivedAt||o.arrivedAt||(o.receipts||[]).filter(r=>r.product===p.id&&r.quantity>0&&r.time).map(r=>r.time).sort((a,b)=>Date.parse(a)-Date.parse(b))[0];
  if(arrived&&Date.parse(time)<Date.parse(arrived))throw Error('出仓时间不能早于实际到仓时间');
  p.delivered+=n;q.delivered+=n;
  o.deliveries.unshift({id:uid('TH'),quote:qid,product:p.id,buyer:q.buyer,quantity:n,time,receiver:receiver.trim(),note});
  log(o,'登记提货',q.buyer+' · '+p.name+' · 本次 '+n+' 件；实际在库扣减 '+n+' 件','仓库 · 李明');refresh(o);
}
export function ship(o,pid,tracking,time,carrier) {
  requireAction(o,'shipping');const p=o.products.find(p=>p.id===pid);
  if(!p||p.received>=p.quantity||!tracking.trim()||!time||!Number.isFinite(new Date(time).getTime()))throw Error('请填写未收齐产品的追踪单号及发运时间');
  p.tracking=tracking.trim();p.shipped=time;p.carrier=carrier.trim();log(o,'补充发运',p.name+' · '+tracking+' · '+time);
}
export function settle(o,qid) {
  requireAction(o,'settle');
  const q=o.quotes.find(q=>q.id===qid);if(!q||q.result!=='已接受'||q.delivered!==q.quantity||q.settled)throw Error('仅全部交付且未结算的报价可结算');
  q.settled=true;q.settledAt=now();log(o,'确认结算',q.buyer+' · USD '+q.amount.toFixed(2)+'，模拟结算','财务 · 王悦');refresh(o);
}
export function recordReminder(o,note='') {
  requireAction(o,'remind');const progress=clearanceProgress(o);
  o.remindedAt=now();o.reminderCount=(o.reminderCount||0)+1;
  log(o,progress.limitReached?'30 天到期提醒':'7 天客户提醒','已人工提醒客户；寻找 '+progress.searchDays+' 天；'+(progress.limitReached?'已达 30 天，等待人工处理':'请客户确认是否继续寻找')+(String(note).trim()?'；'+String(note).trim():''));
}
export function extend(o,consent,note='') {
  requireAction(o,'extend');
  if(isClosed(o)||!o.searchAt||elapsed(o)<7)throw Error('尚未到首轮反馈时间');if(elapsed(o)>=30)throw Error('累计寻找达到 30 天，无法继续延长');if(!consent)throw Error('须记录客户同意后才可继续寻找');
  o.extended=true;o.consentAt=now();o.consentNote=String(note).trim();log(o,'继续寻找','客户已同意于 '+o.consentAt+' 继续寻找；从原受理时间起累计最长 30 天'+(o.consentNote?'；'+o.consentNote:''),'客户 · '+o.customer);
}
export function terminate(o,reason) {
  if(!can(o,'terminate')&&!can(o,'cancel'))throw Error('当前阶段不可终止，请先处理成交及结算');
  if(!reason.trim())throw Error('请填写终止原因');
  if(o.quotes.some(q=>q.result==='已接受'&&q.delivered>0&&!q.settled))throw Error('存在已交付未结算的报价，请先完成该报价交付及结算');
  const action=o.status==='待受理'?'取消申请':'终止清货';
  o.quotes.forEach(q=>{if(q.result==='待确认'||(q.result==='已接受'&&q.delivered===0))q.result='已取消';});o.status='已终止';o.closedAt=now();log(o,action,reason+'；剩余实物保留在清货库存');
}
export function productImage(index=0) {
  const colors=['#d5e3ef','#e4d9cd','#d7ddd0','#e2d9eb'];
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="#f1f4f7"/><path d="M39 57 80 36l41 21v47l-41 23-41-23z" fill="${colors[index%4]}"/><path d="m39 57 41 22 41-22M80 79v48M60 47l41 22" fill="none" stroke="#8093a3" stroke-width="3"/><rect x="51" y="81" width="18" height="11" rx="2" fill="#fff"/><text x="80" y="147" font-family="Arial" font-size="11" fill="#8794a2" text-anchor="middle">MW PRODUCT</text></svg>`);
}
export function seed() {
  const names=['折叠露营椅','无线蓝牙耳机','竹木收纳架','不锈钢保温杯','LED 床头灯','瑜伽垫','宠物自动饮水机','厨房置物架','户外太阳能灯','办公人体工学椅'];
  return names.map((name,index)=>{
    const quantities=[100,240,80,180,120,200,60,96,150,40];const received=[0,120,80,180,120,200,60,48,150,40];const status=['待受理','寻找买家中','待确认报价','待提货','待结算','已完成','已终止','寻找买家中','寻找买家中','待提货'][index];
    const p={id:'P'+index,name,sku:'MW-'+['CAMP','AUDIO','RACK','CUP','LAMP','YOGA','PET','KIT','SOLAR','CHAIR'][index]+'-01',quantity:quantities[index],received:received[index],delivered:index===4?120:index===5?200:0,image:productImage(index),weight:2.4,dimensions:[48,36,28],boxes:Math.ceil(quantities[index]/10),link:'https://www.amazon.com/s?k='+encodeURIComponent(name),price:39.99,currency:'USD',tracking:'1ZMW2026100'+index,shipped:index===0?'':'2026-09-28T09:00',requirement:index%2?'按 SKU 分拣，保留原包装':'检查外箱，拍照反馈'};
    const o={id:'QH2026100800'+(index+1).toString().padStart(2,'0'),customer:['星河跨境','海拓科技','远帆家居','安可贸易'][index%4],warehouse:['洛杉矶一号仓 · LAX','新泽西仓 · NJ','达拉斯仓 · DFW'][index%3],status,created:'2026-09-'+(20+index)+' 09:30:00',updated:'2026-10-08 10:20:00',searchAt:index===0?'':new Date(Date.now()-[0,3,4,5,6,6,15,9,31,6][index]*86400000).toISOString(),extended:false,remark:index===8?'累计寻找已达 30 天，待客户反馈':'客户同意在海外仓寻找本地买家',products:[p],quotes:[],deliveries:[],receipts:received[index]?[{id:'RC'+index,product:p.id,quantity:received[index],tracking:p.tracking,carrier:'UPS',time:'2026-10-01T11:30',note:'外箱完整'}]:[],logs:[{time:'2026-10-08 10:20:00',user:'客服 · 陈琳',action:'申请记录',note:'客户提交清货申请'}]};
    if([2,3,4,5,9].includes(index))o.quotes.push({id:'BJ'+index,product:p.id,buyer:['West Coast Outlet','NJ Home Wholesale','Dallas Liquidators'][index%3],quantity:index===3?60:quantities[index],amount:index===3?720:quantities[index]*8.5,time:'2026-10-07 14:00:00',result:index===2?'待确认':'已接受',delivered:[4,5].includes(index)?quantities[index]:0,settled:index===5});
    if([4,5].includes(index))o.deliveries.push({id:'TH202610070'+index,product:p.id,quantity:quantities[index],quote:'BJ'+index,buyer:o.quotes[0].buyer,note:'买家到仓提货',receiver:'John · 买家代表',time:'2026-10-08 10:00:00'});
    if(index===0||index===7)o.products.push({...p,id:p.id+'B',name:'配套收纳袋',sku:p.sku+'-B',quantity:20,received:0,delivered:0,boxes:2,tracking:p.tracking+'B',image:productImage(index+1)});
    if(o.searchAt)o.acceptedAt=o.searchAt;
    if(isClosed(o))o.closedAt=o.updated;
    return o;
  });
}
export const newId = () => uid('QH');
export function migrate(input) {
  return input.map(original=>{
    const o=structuredClone(original);o.deliveries ||= [];o.acceptedAt ||= acceptedTime(o);
    if(isClosed(o)&&!o.closedAt){const ended=(o.logs||[]).find(l=>['终止清货','取消申请'].includes(l.action));const settled=(o.quotes||[]).map(q=>q.settledAt).filter(t=>Number.isFinite(timestamp(t))).sort((a,b)=>timestamp(b)-timestamp(a));o.closedAt=ended?.time||(o.status==='已完成'?settled[0]:'')||'';}
    for(const i of o.instructions||[]){if(i.status==='已完成'&&i.quote)o.deliveries.push({id:'TH-'+i.id,quote:i.quote,product:i.product,quantity:i.quantity,buyer:o.quotes.find(q=>q.id===i.quote)?.buyer||'',time:i.completed||i.created,receiver:'仓库记录',note:'历史提货记录'});}
    delete o.instructions;o.logs=o.logs.filter(l=>!/(指令|审批|执行)/.test(l.action));return o;
  });
}
