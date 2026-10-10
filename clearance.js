import * as M from './clearance-model.js';
import { TEMPLATE_URL, readImportFile } from './clearance-import.js';
import { TEMPLATE_FIELDS, productFieldValue, matchesProductFilters, exportProductGrid } from './clearance-fields.js';
import { arrivalInfo, arrivalMatches, registerArrival } from './clearance-arrival.js';
import { editProductFields } from './clearance-edit.js';
import { editArrivalFields } from './clearance-edit-arrival.js';
import { warehouseAddress, saveWarehouseAddress, syncWarehouseAddress, rememberWarehouseAddress, warehouseAddressField } from './warehouse-address.js';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key='mw-clearance-prototype-v2';
let orders;
try { const saved=localStorage.getItem(key);orders=saved?M.migrate(JSON.parse(saved)):localStorage.getItem('mw-clearance-prototype-v1')?M.migrate(JSON.parse(localStorage.getItem('mw-clearance-prototype-v1'))):M.seed(); }catch{orders=M.seed();}
const requestedStatus=new URLSearchParams(location.search).get('status');
let tab=[...M.STATUSES,'全部'].includes(requestedStatus)?requestedStatus:'待受理',page=1,size=10,filters={},current=null,detailTab=0,editing=null,importResult=null,importLoading=false,importSequence=0;
const hiddenCols=new Set(),tabs=['申请详情','到仓与库存','发运 / 到仓信息','买家报价','提货 / 结算记录','操作日志'];
const selectedOrderIds=new Set();
const canOperate=(o,action)=>(action==='warehouse'||tab!=='全部')&&M.can(o,action)&&(action!=='receive'||arrivalInfo(o).status==='未到仓');
const clients=['星河跨境','海拓科技','远帆家居','安可贸易'],warehouses=M.WAREHOUSES;
const option=(v,label=v,selected='')=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(label)}</option>`;
const options=(values,selected='',first='全部')=>option('',first,selected)+values.map(v=>option(v,v,selected)).join('');
const btn=(label,action,primary=false,attrs='')=>`<button type="button" class="cl-btn ${primary?'primary':''}" data-cl-action="${action}" ${attrs}>${label}</button>`;
const field=(label,control,required=false,wide=false)=>`<label class="cl-field ${wide?'cl-wide':''}"><span class="${required?'cl-required':''}">${label}</span>${control}</label>`;
const input=(name,type='text',value='',attrs='')=>`<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}>`;
const numberRanges=[['quantity','清货数量(件)','1'],['weight','单件重量(KG)','any'],['length','外箱长(cm)','any'],['width','外箱宽(cm)','any'],['height','外箱高(cm)','any'],['boxes','预报箱数(箱)','1'],['price','亚马逊售价','any']];
const rangeField=(key,label,step)=>field(label,`<div class="cl-range">${input(key+'Min','number','','min="0" step="'+step+'" placeholder="最小值" aria-label="'+label+'最小值"')}<span>至</span>${input(key+'Max','number','','min="0" step="'+step+'" placeholder="最大值" aria-label="'+label+'最大值"')}</div>`);
const productImage=p=>p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" data-cl-image="${esc(p.image)}" loading="lazy">`:'<span class="cl-image-empty" aria-label="未填写图片">无图</span>';
function templateValueHTML(p,key){
  const value=productFieldValue(p,key);if(value===''||value==null)return '<span class="cl-muted">—</span>';
  if(key==='image'&&String(value).startsWith('data:image/'))return `<div class="cl-product">${productImage(p)}</div>`;
  if(key==='link'||key==='image'){
    let valid=false;try{const url=new URL(value);valid=['http:','https:'].includes(url.protocol)&&!url.username&&!url.password;}catch{}
    return valid?`<a class="cl-link cl-template-url" href="${esc(value)}" target="_blank" rel="noopener noreferrer" title="${esc(value)}">${esc(value)}</a>`:esc(value);
  }
  if(key==='shipped')return displayTime(value);
  return esc(value);
}
const productLines=(o,key)=>o.products.map(p=>`<div class="cl-product-line" title="${esc(productFieldValue(p,key))}">${templateValueHTML(p,key)}</div>`).join('');
const money=v=>'USD '+Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const badge=s=>`<span class="cl-badge ${['寻找买家中','运输中'].includes(s)?'blue':['待确认报价','待提货','待结算','待确认'].includes(s)?'orange':['已完成','已到仓','已接受','已结算'].includes(s)?'green':['已终止','已拒绝','已取消'].includes(s)?'red':''}">${esc(s)}</span>`;
const displayTime=t=>t?esc(/Z$/.test(t)?new Date(t).toLocaleString('sv-SE'):String(t).replace('T',' ').slice(0,19)):'—';
const arrivalTimeHTML=a=>a.arrivedAt?displayTime(a.arrivedAt):a.hasMissingTime?'<span class="cl-deadline">待补充</span>':'—';
const arrivalInputValue=time=>{if(!time)return '';const value=(/Z$/.test(String(time))?new Date(time).toLocaleString('sv-SE'):String(time)).replace(' ','T').slice(0,19);return /^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T00:00':value;};
const departureTimeHTML=(o,productId='')=>{const d=M.departureInfo(o,productId);return (d.times.map(displayTime).join('<br>')+(d.hasMissingTime?'<div class="cl-deadline">出仓时间待补充</div>':'')+(d.times.length&&d.inStock>0?'<div class="cl-subline">部分出仓，仍有在库</div>':''))||(d.inStock>0?'未出仓':'—');};
const serviceClock=o=>{if(o.status==='待受理')return '';const p=M.clearanceProgress(o);return `<section class="cl-service-clock"><div class="cl-clock-grid"><div><span>受理时间</span><strong>${displayTime(p.acceptedAt)}</strong></div><div><span>清货时长</span><strong>${esc(p.durationText)}</strong></div><div><span>7 天反馈时间</span><strong>${displayTime(p.firstFeedbackAt)}</strong></div><div><span>30 天寻找上限</span><strong>${displayTime(p.searchDeadlineAt)}</strong></div></div>${p.closedAt?`<p class="cl-muted">结束时间：${displayTime(p.closedAt)}</p>`:''}${p.limitReached?`<div class="cl-notice warning"><strong>已寻找 ${p.searchDays} 天，达到 30 天上限，待人工处理。</strong><p>请与客户确认后点击终止清货。系统保留当前状态和剩余库存。</p></div>`:p.feedbackDue?`<div class="cl-notice warning"><strong>已寻找 ${p.searchDays} 天，尚未找到合适买家。</strong><p>请提醒客户确认是否继续寻找；继续寻找累计最长 30 天。</p></div>`:o.extended?`<p class="cl-muted">客户已于 ${displayTime(o.consentAt)} 同意继续寻找，累计期限从原受理时间计算。</p>`:''}${o.remindedAt?`<p class="cl-muted">最近提醒客户：${displayTime(o.remindedAt)} · 共 ${o.reminderCount||1} 次</p>`:''}<div class="cl-clock-actions">${canOperate(o,'remind')?btn('记录已提醒客户','remind'):''}${canOperate(o,'extend')?btn('记录客户同意继续寻找','feedback',true):''}${canOperate(o,'terminate')&&(p.feedbackDue||p.limitReached)?btn('终止清货','terminate'):''}</div><small>清货时长自受理起算，完成或人工终止后停止计时。仓租按实际到仓、实际出仓记录核算。</small></section>`;};
const arrivalSummary=o=>{const a=arrivalInfo(o);return `<section class="cl-arrival-summary"><div><span>到仓状态</span>${badge(a.status)}</div><div><span>到仓时间</span><strong>${arrivalTimeHTML(a)}</strong></div><div><span>出仓时间</span><strong>${departureTimeHTML(o)}</strong></div><small>仓租核算以实际到仓、实际出仓时间为依据；分批提货保留各批次时间。</small></section>`;};
const totalStock=o=>o.products.reduce((n,p)=>n+M.stock(p),0),totalReserved=o=>o.products.reduce((n,p)=>n+M.reserved(o,p.id),0);
const save=()=>{try{localStorage.setItem(key,JSON.stringify(orders));}catch{toast('浏览器存储空间不足，本次数据仅在当前页面保留');}};
const toast=msg=>{const t=$('#clToast');t.textContent=msg;t.hidden=false;clearTimeout(window.clToastTimer);window.clToastTimer=setTimeout(()=>t.hidden=true,4000);};
const pageEl=document.createElement('main');pageEl.id='clearancePage';pageEl.className='content cl-page';pageEl.hidden=true;$('#warehousePlaceholderPage').after(pageEl);
document.body.insertAdjacentHTML('beforeend','<div id="clDrawer" class="cl-overlay" hidden></div><div id="clModal" class="cl-overlay cl-modal-overlay" hidden></div><div id="clToast" class="cl-toast" role="status" hidden></div>');
pageEl.innerHTML=`<div class="cl-heading"><div><h2>清货管理</h2><p>清货申请、买家报价、到仓提货与结算</p></div><span class="cl-chip">前端交互原型</span></div><form id="clFilter" class="cl-card cl-filter"><div class="cl-grid">
${field('关键字',input('keyword','search','','placeholder="清货单号 / 产品名称 / SKU / 追踪单号"'))}
${field('客户名称',input('customer','search','','list="clCustomers" placeholder="搜索或选择客户"')+'<datalist id="clCustomers"></datalist>')}
${field('清货状态',`<select name="status">${options(M.STATUSES)}</select>`)}${field('到仓状态',`<select name="arrival">${options(['未到仓','已到仓'])}</select>`)}${field('清货仓库',`<select name="warehouse">${options(warehouses,'','全部仓库')}</select>`)}${field('到仓时间',`<div class="cl-range">${input('arrivalFrom','date','','aria-label="到仓开始日期"')}<span>至</span>${input('arrivalTo','date','','aria-label="到仓结束日期"')}</div>`)}${field('SKU',input('sku','search','','placeholder="输入 SKU"'))}${field('追踪单号',input('tracking','search','','placeholder="输入追踪单号"'))}${field('申请时间',`<div class="cl-range">${input('from','date')}<span>至</span>${input('to','date')}</div>`)}</div>
<div id="clAdvanced" class="cl-advanced" hidden><div class="cl-filter-heading">清货产品条件 <span>同一产品满足所填条件时显示该清货单</span></div><div class="cl-grid">${field('产品名称',input('productName','search','','placeholder="输入产品名称"'))}${numberRanges.map(([key,label,step])=>rangeField(key,label,step)).join('')}${field('币种',input('currency','text','','list="clCurrencies" maxlength="3" placeholder="例如 USD"')+'<datalist id="clCurrencies"></datalist>')}${field('发运时间',`<div class="cl-range">${input('shippedFrom','date','','aria-label="发运开始日期"')}<span>至</span>${input('shippedTo','date','','aria-label="发运结束日期"')}</div>`)}${field('产品销售链接',input('link','search','','placeholder="链接或域名"'))}${field('产品图片链接',input('image','search','','placeholder="图片链接或域名"'))}${field('操作要求',input('requirement','search','','placeholder="输入操作要求"'))}</div><div class="cl-filter-heading cl-filter-secondary">业务条件</div><div class="cl-grid">${field('买家报价',`<select name="quote">${options(['有报价','无报价'])}</select>`)}${field('寻找买家期限',`<select name="deadline">${options(['满 7 天待客户反馈','达到 30 天待人工处理'])}</select>`)}</div></div>
<div class="cl-filter-actions"><span class="cl-muted">数量单位：件 · 箱数单位：箱 · 重量 KG · 外箱尺寸 cm</span><button class="cl-btn primary" type="submit">⌕ 搜索</button>${btn('重置','reset')}${btn('展开产品筛选 ⌄','expand')}</div></form><div id="clDeadlineSummary" class="cl-notice warning cl-deadline-summary" hidden></div><section class="cl-card"><div id="clTabs" class="cl-tabs"></div><div class="cl-toolbar cl-list-toolbar"><div class="cl-toolbar-left">${btn('＋ 模板导入下单','create',true)}${btn('取消','cancel-selected',false,'title="取消勾选的运单"')}${btn('查看日志','list-logs')}${btn('↓ 导出','export',false,'title="按当前筛选清货单导出，每个产品一行，包含全部模板字段"')}</div><div class="cl-toolbar-right"><span class="cl-muted" id="clSummary"></span>${btn('☷ 列设置','columns')}</div></div><div id="clColumns" class="cl-columns" hidden></div><div class="cl-scroll"><table class="cl-table"><thead id="clHead"></thead><tbody id="clBody"></tbody></table></div><div id="clFooter" class="cl-footer"></div></section>`;
const templateCols=[['customer','客户名称'],['product','产品名称'],['image','清货产品图片'],['quantity','清货产品数量(件)'],['weight','清货产品重量(单个产品KG)'],['dimensions','外箱尺寸(cm)'],['link','产品链接'],['price','亚马逊卖价'],['tracking','追踪单号'],['received','入库数量(件)'],['requirement','操作要求']];
const extraTemplateCols=TEMPLATE_FIELDS.filter(({key})=>['sku','length','width','height','boxes','currency'].includes(key)).map(({key,label})=>[key,label]);
const businessCols=[['warehouse','清货仓库'],['stock','当前在库(件)'],['status','清货状态'],['arrival','到仓状态'],['arrivedAt','到仓时间'],['outboundAt','出仓时间'],['acceptedAt','受理时间'],['duration','清货时长'],['quote','当前买家报价(USD)'],['created','申请时间'],['updated','最后更新时间']];
const cols=[['id','清货单号'],...templateCols,...extraTemplateCols,...businessCols];
const defaultCols=new Set(['id',...templateCols.map(([key])=>key),'sku','boxes','warehouse','stock','status','arrival','arrivedAt','outboundAt','acceptedAt','duration','created']);
cols.forEach(([key])=>{if(!defaultCols.has(key))hiddenCols.add(key);});
const stageColumns=columns=>columns.filter(([key])=>tab!=='待受理'||!['acceptedAt','duration'].includes(key));
const columnControls=columns=>stageColumns(columns).map(([k,v])=>`<label><input type="checkbox" data-cl-col="${k}" ${hiddenCols.has(k)?'':'checked'}>${v}</label>`).join('');
function renderColumns(){$('#clColumns').innerHTML=`<div class="cl-column-group"><strong>下单模板字段</strong><div>${columnControls(templateCols)}</div></div><div class="cl-column-group"><strong>补充产品字段</strong><div>${columnControls(extraTemplateCols)}</div></div><div class="cl-column-group"><strong>业务信息</strong><div>${columnControls(businessCols)}</div></div>`;}
function matches(o){const f=filters,has=(v,q)=>String(v).toLowerCase().includes(String(q).trim().toLowerCase());if(f.keyword&&!has([o.id,...o.products.flatMap(p=>[p.name,p.sku,p.tracking])].join(' '),f.keyword))return false;if(f.customer&&!has(o.customer,f.customer))return false;if(f.status&&o.status!==f.status||f.warehouse&&o.warehouse!==f.warehouse)return false;if(f.from&&o.created.slice(0,10)<f.from||f.to&&o.created.slice(0,10)>f.to)return false;if(!matchesProductFilters(o,f)||!arrivalMatches(o,f))return false;if(f.quote==='有报价'&&!o.quotes.length||f.quote==='无报价'&&o.quotes.length)return false;if(f.deadline){const p=M.clearanceProgress(o);if(f.deadline==='达到 30 天待人工处理'?!p.limitReached:!p.feedbackDue)return false;}return true;}
const filtered=()=>orders.filter(matches).filter(o=>tab==='全部'||o.status===tab);
const stagePrimary=o=>tab==='全部'?null:({待受理:['受理','accept'],寻找买家中:M.elapsed(o)>=30?['终止清货','terminate']:M.can(o,'extend')?['客户反馈','feedback']:['新增报价','quote'],待确认报价:['确认报价','quotes'],待提货:['登记提货','deliver'],待结算:['确认结算','settlements']})[o.status];
function rowActions(o){const primary=stagePrimary(o);return [['quote','新增报价','quote'],['remind','记录已提醒客户','remind'],['extend','客户反馈','feedback'],['shipping','补充发运','shipping'],['receive','登记到仓','receive'],['terminate','终止清货','terminate'],['settle','确认结算','settlements']].filter(([cap,,a])=>canOperate(o,cap)&&a!==primary?.[1]).map(([,label,a])=>`<button class="cl-link" data-cl-action="${a}">${label}</button>`).join('');}
function renderList(){
  renderColumns();
  pageEl.querySelector('[data-cl-action="create"]').hidden=tab!=='待受理';
  $('#clCustomers').innerHTML=[...new Set([...clients,...orders.map(o=>o.customer)])].map(v=>option(v)).join('');
  $('#clCurrencies').innerHTML=[...new Set(['USD',...orders.flatMap(o=>o.products.map(p=>p.currency)).filter(Boolean)])].map(v=>option(v)).join('');
  const base=orders.filter(matches),due=base.filter(o=>M.clearanceProgress(o).feedbackDue),limits=base.filter(o=>M.clearanceProgress(o).limitReached),deadlineSummary=$('#clDeadlineSummary');deadlineSummary.hidden=!due.length&&!limits.length;deadlineSummary.innerHTML=`<strong>期限提醒</strong><span>满 7 天待客户反馈 ${due.length} 条 · 满 30 天待人工处理 ${limits.length} 条</span><button type="button" class="cl-link" data-cl-tab="寻找买家中">查看寻找中的清货单</button>`;
  const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(1,Math.min(page,pages));
  const selectable=tab==='待受理',pageRows=rows.slice((page-1)*size,page*size);
  for(const id of selectedOrderIds)if(!selectable||!rows.some(o=>o.id===id&&canOperate(o,'cancel')))selectedOrderIds.delete(id);
  const cancelButton=pageEl.querySelector('[data-cl-action="cancel-selected"]');cancelButton.hidden=!selectable;cancelButton.disabled=false;cancelButton.title=selectedOrderIds.size?`取消已选择的 ${selectedOrderIds.size} 条申请`:'取消勾选的运单';
  $('#clTabs').innerHTML=[...M.STATUSES,'全部'].map(s=>`<button type="button" data-cl-tab="${s}" class="${tab===s?'active':''}">${s}<span class="cl-count">${base.filter(o=>s==='全部'||o.status===s).length}</span></button>`).join('');
  const visible=stageColumns(cols).filter(([k])=>!hiddenCols.has(k));$('#clHead').innerHTML='<tr>'+(selectable?'<th class="cl-select-col"><input type="checkbox" class="cl-select-all" aria-label="全选当前页待受理申请"></th>':'')+visible.map(([key,v])=>`<th class="cl-list-col-${key}">${v}</th>`).join('')+'<th class="cl-fixed">操作</th></tr>';
  $('#clBody').innerHTML=pageRows.map(o=>{
    const d=M.elapsed(o),progress=M.clearanceProgress(o),primary=stagePrimary(o);
    const orderValues={id:`<button class="cl-link cl-mono" data-cl-action="detail">${esc(o.id)}</button>`,customer:esc(o.customer),warehouse:`${esc(o.warehouse)}<div class="cl-subline"><button type="button" class="cl-link" data-cl-action="warehouse">修改仓库</button></div>`,status:badge(o.status)+(o.status==='寻找买家中'&&d>=7?`<div class="cl-subline cl-deadline">${d>=30?'已达 30 天 · 待人工处理':o.extended?'客户同意继续 · '+d+' 天':'满 7 天 · 请确认是否继续'}</div>`:''),acceptedAt:displayTime(progress.acceptedAt),duration:`<strong>${esc(progress.durationText)}</strong>`,created:displayTime(o.created),updated:displayTime(o.updated)};
    return o.products.map(p=>{
      const a=arrivalInfo(o,p.id),q=o.quotes.find(q=>q.product===p.id&&!['已拒绝','已取消'].includes(q.result));
      const values={...orderValues,...Object.fromEntries(TEMPLATE_FIELDS.map(({key})=>[key==='name'?'product':key,templateValueHTML(p,key)])),outboundAt:departureTimeHTML(o,p.id)};
      const dimensions=['length','width','height'].map(key=>productFieldValue(p,key)),price=productFieldValue(p,'price');
      Object.assign(values,{product:esc(p.name),image:`<div class="cl-product cl-list-image">${productImage(p)}</div>`,dimensions:dimensions.some(value=>value!=='')?`${dimensions.map(value=>value===''?'—':esc(value)).join(' × ')}<div class="cl-subline">长 × 宽 × 高</div>`:'—',price:price===''?'—':`${esc(p.currency||'')} ${Number(price).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`.trim(),received:(p.received??0)+' 件',stock:`<span class="cl-qty">${M.stock(p)}</span> 件<div class="cl-subline">待提 ${M.reserved(o,p.id)} · 可用 ${M.available(o,p)}</div>`,arrival:badge(a.status),arrivedAt:arrivalTimeHTML(a),quote:q?money(q.amount)+`<div class="cl-subline">${q.quantity} 件 · ${esc(q.buyer)}</div>`:'—'});
      const cells=visible.map(([key])=>`<td class="cl-list-col-${key}">${values[key]}</td>`).join('');
      const selection=selectable?`<td class="cl-select-col"><input type="checkbox" class="cl-row-check" data-cl-selected="${esc(o.id)}" aria-label="选择清货单 ${esc(o.id)} · ${esc(p.name)}" ${selectedOrderIds.has(o.id)?'checked':''}></td>`:'';
      const actions=`<td class="cl-fixed cl-row-actions"><div class="cl-action-set">${primary?`<button class="cl-link" data-cl-action="${primary[1]}">${primary[0]}</button>`:''}<button class="cl-link" data-cl-action="detail">${tab==='全部'?'查看':'详情'}</button>${rowActions(o)}</div></td>`;
      return `<tr data-cl-order="${esc(o.id)}" data-cl-product="${esc(p.id)}">${selection}${cells}${actions}</tr>`;
    }).join('');
  }).join('')||`<tr><td colspan="${visible.length+1+(selectable?1:0)}" class="cl-empty">暂无匹配的清货申请</td></tr>`;
  if(selectable){const all=$('#clHead .cl-select-all'),count=pageRows.filter(o=>selectedOrderIds.has(o.id)).length;all.checked=pageRows.length>0&&count===pageRows.length;all.indeterminate=count>0&&count<pageRows.length;all.disabled=!pageRows.length;}
  $('#clSummary').textContent=`共 ${rows.length} 条清货申请 · ${rows.reduce((n,o)=>n+o.products.length,0)} 行产品${selectedOrderIds.size?' · 已选 '+selectedOrderIds.size+' 条':''}`;
  $('#clFooter').innerHTML=`<span>共 ${rows.length} 条</span>${btn('‹','prev',false,page===1?'disabled':'')}${Array.from({length:pages},(_,i)=>`<button class="cl-btn ${page===i+1?'primary':''}" data-cl-page="${i+1}">${i+1}</button>`).join('')}${btn('›','next',false,page===pages?'disabled':'')}<select id="clPageSize" aria-label="每页数量">${[5,10,20,50].map(n=>option(String(n),n+' 条/页',String(size))).join('')}</select>`;
}
function open(){if(!window.confirmDiscardInstructionStatusDrafts())return;window.activateWarehousePage('clearance','清货管理','#navClearanceManagement');pageEl.hidden=false;renderList();}
function metrics(o){return `<div class="cl-metrics"><div><span>实际在库</span><b>${totalStock(o)}</b><small>件</small></div><div><span>成交待提数量</span><b>${totalReserved(o)}</b><small>件</small></div><div><span>可用数量</span><b>${o.products.reduce((n,p)=>n+M.available(o,p),0)}</b><small>件</small></div><div><span>累计已提货</span><b>${M.sum(o,'delivered')}</b><small>件</small></div></div>`;}
function table(headers,rows){return `<div class="cl-scroll"><table class="cl-table"><thead><tr>${headers.map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}" class="cl-empty">暂无记录</td></tr>`}</tbody></table></div>`;}
function timeline(o){return `<ol class="cl-timeline">${o.logs.map(l=>`<li><strong>${esc(l.action)}</strong><span class="cl-muted" style="float:right">${displayTime(l.time)}</span><p>${esc(l.note)}</p><span class="cl-muted">${esc(l.user)}</span></li>`).join('')}</ol>`;}
const info=(label,value)=>`<div><dt>${label}</dt><dd>${value}</dd></div>`;
function productControl(p,key){
  const value=productFieldValue(p,key),required=['name','quantity','link','image'].includes(key);
  if(key==='requirement')return `<textarea name="${key}" maxlength="1000">${esc(value)}</textarea>`;
  const numeric=numberRanges.find(([name])=>name===key);
  if(numeric)return input(key,'number',value,`min="${key==='quantity'?1:0}" step="${numeric[2]}" ${required?'required':''}`);
  if(key==='shipped')return input(key,'date',String(value).slice(0,10));
  return input(key,['link','image'].includes(key)?'url':'text',value,`${required?'required':''} ${key==='currency'?'maxlength="3" placeholder="USD"':''}`);
}
function applicationSections(o,editable){
  const a=arrivalInfo(o),readField=(label,value,wide=false)=>field(label,`<div class="cl-read-value">${value}</div>`,false,wide);
  const base=editable?`${field('客户名称',input('customer','text',o.customer,'required list="clCustomers"'),true)}${field('清货仓库',`<select name="warehouse" required>${options(warehouses,o.warehouse,'请选择仓库')}</select>`,true)}${warehouseAddressField(o.warehouse,'cl')}${field('清货备注',`<textarea name="remark" maxlength="1000">${esc(o.remark||'')}</textarea>`,false,true)}`:`${readField('客户名称',esc(o.customer))}${readField('清货仓库',esc(o.warehouse)+' '+btn('修改仓库','warehouse'))}${readField('仓库地址',esc(warehouseAddress(o.warehouse)||'地址待维护'),true)}${readField('清货备注',esc(o.remark||'—'),true)}`;
  const arrival=editable?`${field('到仓状态',`<select name="arrival">${['未到仓','已到仓'].map(v=>option(v,v,a.status)).join('')}</select>`,true)}${field('实际到仓时间',input('arrivedAt','datetime-local',arrivalInputValue(a.arrivedAt),'step="1"'))}`:`${readField('到仓状态',badge(a.status))}${readField('实际到仓时间',arrivalTimeHTML(a))}${readField('实际出仓时间',departureTimeHTML(o))}`;
  const headers=TEMPLATE_FIELDS.map(({key,label})=>`<th class="cl-edit-cell-${key}"><span class="${editable&&['name','quantity','link','image'].includes(key)?'cl-required':''}">${esc(label)}</span></th>`).join('');
  const rows=o.products.map((p,i)=>`<tr class="cl-edit-row" ${editable?'data-cl-edit-product':'data-cl-detail-product'}="${esc(p.id)}">${TEMPLATE_FIELDS.map(({key,label})=>{
    const image=key==='image'?`<div class="cl-detail-product-image"><div class="cl-product">${productImage(p)}</div>${p.image&&!String(p.image).startsWith('data:image/')?templateValueHTML(p,key):''}</div>`:'';
    return `<td class="cl-edit-cell-${key}">${editable?`<label class="cl-edit-control"><span class="cl-sr-only">产品 ${i+1} ${esc(label)}</span>${productControl(p,key)}</label>`:`<div class="cl-read-product-value">${key==='image'?image:templateValueHTML(p,key)}</div>`}</td>`;
  }).join('')}</tr>`).join('');
  return `<section class="cl-section"><h3>基础信息</h3><div class="cl-grid">${base}</div></section><section class="cl-section"><h3>到仓信息</h3><div class="cl-grid">${arrival}</div></section><section class="cl-section"><h3>产品信息</h3><div class="cl-scroll cl-edit-scroll"><table class="cl-table cl-edit-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}
function detail(o,index=0,editable=false){
  if(editable&&!canOperate(o,'edit'))throw Error('仅待受理申请可编辑');
  if(editable){index=0;importSequence++;importLoading=false;importResult=null;}
  $('#clDrawer').classList.add('cl-import-overlay');
  current=o;editing=editable?o:null;detailTab=index;let content='';
  if(index===0)content=editable?`<form id="clEditForm">${applicationSections(o,true)}<p id="clEditError" class="cl-error" role="alert"></p></form>`:applicationSections(o,false);
  if(index===1)content=`<section class="cl-section"><h3>到仓与库存信息</h3>${table(['产品名称','SKU','到仓状态','到仓时间','出仓时间','清货数量(件)','实收数量(件)','当前在库(件)','成交待提(件)','可用数量(件)','已提货(件)'],o.products.map(p=>{const a=arrivalInfo(o,p.id);return `<tr><td>${esc(p.name)}</td><td>${esc(p.sku||'—')}</td><td>${badge(a.status)}</td><td>${arrivalTimeHTML(a)}</td><td>${departureTimeHTML(o,p.id)}</td><td>${p.quantity}</td><td>${p.received}</td><td>${M.stock(p)}</td><td>${M.reserved(o,p.id)}</td><td>${M.available(o,p)}</td><td>${p.delivered}</td></tr>`;}).join(''))}</section>`;
  if(index===2)content=`<section class="cl-section"><div class="cl-heading"><h3 style="margin:0">发运 / 到仓信息</h3><div>${canOperate(o,'shipping')?btn('补充发运','shipping'):''} ${canOperate(o,'receive')?btn('登记到仓','receive',true):''}</div></div>${table(['产品名称','SKU','追踪单号','物流商','发运时间','到仓状态','到仓时间','出仓时间','清货数量(件)','实收数量(件)'],o.products.map(p=>{const a=arrivalInfo(o,p.id);return `<tr><td>${esc(p.name)}</td><td>${esc(p.sku||'—')}</td><td>${esc(p.tracking||'—')}</td><td>${esc(p.carrier||'—')}</td><td>${displayTime(p.shipped)}</td><td>${badge(a.status)}</td><td>${arrivalTimeHTML(a)}</td><td>${departureTimeHTML(o,p.id)}</td><td>${p.quantity}</td><td>${p.received}</td></tr>`;}).join(''))}<div class="cl-notice" style="margin-top:18px">到仓时间为实际登记时间，用于后续仓租核算。发运时间和到仓时间分别保存。</div></section>`;
  if(index===3)content=`<section class="cl-section"><div class="cl-heading"><h3 style="margin:0">买家报价</h3>${canOperate(o,'quote')?btn('＋ 新增报价','quote',true):''}</div><div class="cl-notice" style="margin-bottom:18px">报价金额为本次成交总金额，币种 USD。接受后保留成交待提数量，登记实际提货时扣减在库数量。</div>${table(['买家 / 标识','产品','报价总金额','数量','报价时间','确认结果','已提货','结算','操作'],o.quotes.map(q=>`<tr data-cl-quote="${q.id}"><td>${esc(q.buyer)}</td><td>${esc(o.products.find(p=>p.id===q.product)?.name)}</td><td>${money(q.amount)}</td><td>${q.quantity} 件</td><td>${displayTime(q.time)}</td><td>${badge(q.result)}</td><td>${q.delivered} 件</td><td>${q.settled?badge('已结算'):'—'}</td><td>${q.result==='待确认'&&canOperate(o,'decide')?`<button class="cl-link" data-cl-action="accept-quote">接受报价</button> <button class="cl-link danger" data-cl-action="reject-quote">拒绝报价</button>`:q.result==='已接受'&&q.delivered<q.quantity&&canOperate(o,'deliver')?btn('登记提货','deliver'):q.result==='已接受'&&q.delivered===q.quantity&&!q.settled&&canOperate(o,'settle')?btn('确认结算','settle'):''}</td></tr>`).join(''))}${canOperate(o,'terminate')?`<div class="cl-stage-buttons">${btn('终止清货','terminate')}</div>`:''}</section>`;
  if(index===4)content=`<section class="cl-section"><div class="cl-heading"><h3 style="margin:0">提货记录</h3>${canOperate(o,'deliver')?btn('登记提货','deliver',true):''}</div>${table(['提货记录号','买家','产品','本次提货数量','出仓时间（实际提货）','提货人','备注'],o.deliveries.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.buyer)}</td><td>${esc(o.products.find(p=>p.id===r.product)?.name)}</td><td>${r.quantity} 件</td><td>${displayTime(r.time)}</td><td>${esc(r.receiver)}</td><td>${esc(r.note||'—')}</td></tr>`).join(''))}<h3 style="margin-top:26px">成交结算</h3>${table(['买家','成交数量','成交总金额','提货进度','结算状态','结算时间','操作'],o.quotes.filter(q=>q.result==='已接受').map(q=>`<tr data-cl-quote="${q.id}"><td>${esc(q.buyer)}</td><td>${q.quantity} 件</td><td>${money(q.amount)}</td><td>${q.delivered} / ${q.quantity} 件</td><td>${q.settled?badge('已结算'):badge(q.delivered===q.quantity?'待结算':'待提货')}</td><td>${displayTime(q.settledAt)}</td><td>${!q.settled&&q.delivered===q.quantity&&canOperate(o,'settle')?btn('确认结算','settle'):''}</td></tr>`).join(''))}</section>`;
  if(index===5)content=`<section class="cl-section"><h3>操作日志</h3>${timeline(o)}</section>`;
  $('#clDrawer').innerHTML=`<section class="cl-drawer cl-create cl-edit cl-detail" role="dialog" aria-modal="true" aria-label="清货详情"><header class="cl-drawer-header"><div><h2>清货详情 <span class="cl-muted cl-mono">${esc(o.id)}</span></h2><p>${badge(o.status)} ${badge(arrivalInfo(o).status)} <span class="cl-muted">${esc(o.customer)} · ${displayTime(o.created)}</span></p></div><div class="cl-detail-header-actions">${editable?'<span class="cl-muted">编辑中</span>':canOperate(o,'edit')?btn('编辑','edit',true):''}<button class="cl-close" data-cl-action="close" aria-label="关闭详情">×</button></div></header><div class="cl-tabs cl-detail-tabs">${tabs.map((t,i)=>`<button type="button" class="${index===i?'active':''}" data-cl-detail-tab="${i}" ${editable?'disabled':''}>${t}</button>`).join('')}</div><div class="cl-drawer-body">${editable?'':serviceClock(o)}${index===0?'':arrivalSummary(o)+metrics(o)}${content}</div><footer class="cl-drawer-footer">${editable?`${btn('取消编辑','cancel-edit')}<button class="cl-btn primary" type="submit" form="clEditForm">保存修改</button>`:`<span class="cl-muted">${tab==='全部'||M.isClosed(o)?'业务历史记录':'按当前业务阶段处理'}</span>${btn('关闭','close')}`}</footer></section>`;
  if(editable){syncEditArrival();$('#clEditForm').dataset.arrivalInputBaseline=$('#clEditForm').elements.arrivedAt.value;}
  $('#clDrawer').hidden=false;
}
function create(o=null){
  if(o){edit(o);return;}
  if(!o&&tab!=='待受理')throw Error('请在待受理状态下进行模板导入下单');
  if(o&&!canOperate(o,'edit'))throw Error('仅待受理申请可编辑');
  $('#clDrawer').classList.add('cl-import-overlay');
  current=o;editing=o;importSequence++;importLoading=false;importResult=o?{rows:o.products.map((p,i)=>({line:i+2,product:structuredClone(p),errors:[]})),total:o.products.length,validCount:o.products.length,errorCount:0}:null;
  $('#clDrawer').innerHTML=`<section class="cl-drawer cl-create" role="dialog" aria-modal="true" aria-label="模板导入下单"><header class="cl-drawer-header"><div><h2>${o?'编辑待受理申请':'模板导入清货下单'}</h2><p class="cl-muted">下载模板填写产品，导入校验后提交整单申请</p></div><button class="cl-close" data-cl-action="close" aria-label="关闭">×</button></header><div class="cl-drawer-body"><form id="clImportForm"><section class="cl-section"><h3>基础信息</h3><div class="cl-grid">${field('客户名称',input('customer','text',o?.customer||'','required list="clCustomers" placeholder="搜索或选择客户"'),true)}${field('清货仓库',`<select name="warehouse" required>${options(warehouses,o?.warehouse||'','请选择仓库')}</select>`,true)}${warehouseAddressField(o?.warehouse||'','cl')}${field('清货备注',`<textarea name="remark" maxlength="1000">${esc(o?.remark||'')}</textarea>`,false,true)}</div></section>
  <section class="cl-section"><h3>清货模板导入</h3><div class="cl-import-steps"><div><b>1</b><strong>下载并填写清货模板</strong><span>每行登记一个产品</span></div><i>›</i><div><b>2</b><strong>上传清货文件</strong><span>支持 Excel / CSV</span></div><i>›</i><div><b>3</b><strong>校验后提交下单</strong><span>整张清货单包含全部产品</span></div></div><div class="cl-import-upload"><a class="cl-btn" href="${esc(TEMPLATE_URL)}" download>↓ 下载清货模板</a><label class="cl-file-button">↑ 上传清货文件<input id="clImportFile" type="file" accept=".xlsx,.csv"></label><span id="clImportFileName" class="cl-muted">${esc(o?.importFile||'尚未选择文件')}</span></div><div class="cl-notice">清货模板共 15 列，请保留“清货产品”工作表第一行标题及列顺序。产品名称、清货数量(件)、产品销售链接、产品图片链接为必填。图片填写 http/https 链接，实收数量及入库时间由仓库登记。最多支持 500 行，全部校验通过后可提交。</div><div id="clImportPreview" style="margin-top:18px"></div></section>
  <section class="cl-section"><h3>清货须知</h3><div class="cl-notice"><ul><li>清货交易在海外仓内完成，由买家到仓提货。</li><li>受理后开始计时，满 7 天未找到买家时反馈客户，确认是否继续寻找。</li><li>累计最长寻找 30 天，到期后等待人工处理，终止须人工确认。</li><li>在仓期间可能产生仓储费用，选择弃货按相关流程收费。</li></ul></div><label class="cl-consent"><input name="consent" type="checkbox" required>我已确认产品资料并知悉清货服务规则</label></section><p id="clImportError" class="cl-error" role="alert"></p></form></div><footer class="cl-drawer-footer"><span class="cl-muted">${o?'保存后仍为待受理':'校验通过后生成清货单号，进入待受理'}</span>${btn('取消','close')}<button class="cl-btn primary" id="clImportSubmit" type="submit" form="clImportForm">${o?'保存修改':'确认导入并提交下单'}</button></footer></section>`;$('#clDrawer').hidden=false;renderImportPreview();
}
function edit(o){
  detail(o,0,true);
}
function syncEditArrival(){const form=$('#clEditForm');if(!form)return;const arrived=form.elements.arrival.value==='已到仓';form.elements.arrivedAt.disabled=!arrived;form.elements.arrivedAt.required=arrived;form.elements.arrivedAt.closest('.cl-field').querySelector('span').classList.toggle('cl-required',arrived);}
function submitEdit(e){
  e.preventDefault();try{
    const o=editing;if(!o||!canOperate(o,'edit'))throw Error('申请状态已变化，无法编辑');
    const form=e.target,customer=form.elements.customer.value.trim(),warehouse=form.elements.warehouse.value,status=form.elements.arrival.value;
    if(!customer||!warehouse)throw Error('请填写客户名称和清货仓库');
    if(!warehouses.includes(warehouse))throw Error('请选择有效清货仓库');
    const rows=[...form.querySelectorAll('[data-cl-edit-product]')].map(card=>{
      const original=o.products.find(p=>p.id===card.dataset.clEditProduct);
      return {id:card.dataset.clEditProduct,values:TEMPLATE_FIELDS.map(({key})=>{
        const value=card.querySelector(`[name="${key}"]`).value;
        return key==='shipped'&&value===String(original?.shipped||'').slice(0,10)?original.shipped||'':value;
      })};
    });
    const validationProducts=status==='未到仓'?o.products.map(p=>({...p,received:0})):o.products;
    const products=editProductFields(validationProducts,rows);
    products.forEach(p=>{if(p.quantity<p.delivered+M.reserved(o,p.id))throw Error(p.name+' 清货数量不能小于已提货和成交待提数量之和');});
    const previousTime=arrivalInfo(o).arrivedAt;
    const arrival=editArrivalFields(o,products,{status,arrivedAt:status==='未到仓'?'':form.elements.arrivedAt.value===form.dataset.arrivalInputBaseline?previousTime:form.elements.arrivedAt.value});
    rememberWarehouseAddress(form);
    o.products=arrival.products;o.arrivedAt=arrival.arrivedAt;o.receipts=arrival.receipts;o.customer=customer;M.editWarehouse(o,warehouse);o.remark=form.elements.remark.value;
    M.log(o,'编辑申请','更新下单信息及清货产品字段；到仓状态：'+status+(arrival.arrivedAt?'；到仓时间：'+arrival.arrivedAt:''));save();renderList();
    importSequence++;detail(o);toast('申请修改已保存');
  }catch(error){$('#clEditError').textContent=error.message;}
}
function renderImportPreview(){
  const el=$('#clImportPreview');if(!el)return;
  $('#clImportSubmit').disabled=importLoading||!importResult||!importResult.total||importResult.errorCount>0;
  if(importLoading){el.innerHTML='<div class="cl-import-empty">正在解析文件并校验产品资料…</div>';return;}
  if(!importResult){el.innerHTML='<div class="cl-import-empty">上传填写好的清货模板后，在这里预览产品与校验结果</div>';return;}
  const r=importResult,valid=r.rows.filter(row=>!row.errors.length);const quantity=valid.reduce((n,row)=>n+row.product.quantity,0),boxes=valid.reduce((n,row)=>n+(row.product.boxes||0),0);
  el.innerHTML=`<div class="cl-import-summary"><span>产品 <b>${r.total}</b> 项</span><span>通过 <b class="cl-success">${r.validCount}</b> 行</span><span>错误 <b class="${r.errorCount?'cl-danger':''}">${r.errorCount}</b> 行</span><span>有效件数 <b>${quantity}</b> 件</span><span>有效箱数 <b>${boxes}</b> 箱</span></div>${r.errorCount?'<div class="cl-notice warning" style="margin-bottom:12px">存在错误行，暂不能下单。请按行号修正模板并重新上传。</div>':''}<p class="cl-muted">按清货模板的 15 列顺序展示，可横向滚动查看全部字段。</p>${table(['模板行号',...TEMPLATE_FIELDS.map(f=>f.label),'校验结果'],r.rows.map(row=>`<tr class="${row.errors.length?'cl-import-invalid':''}"><td>${row.line}</td>${TEMPLATE_FIELDS.map(({key})=>`<td>${templateValueHTML(row.product,key)}</td>`).join('')}<td class="cl-validation">${row.errors.length?row.errors.map(e=>`<div>${esc(e)}</div>`).join(''):'<span class="cl-success">✓ 校验通过</span>'}</td></tr>`).join(''))}`;
}
async function uploadImport(file){
  const sequence=++importSequence;importLoading=true;importResult=null;$('#clImportError').textContent='';$('#clImportFileName').textContent=file.name;renderImportPreview();
  try{const parsed=await readImportFile(file);if(sequence!==importSequence||!$('#clImportPreview'))return;importResult=parsed;}catch(error){if(sequence===importSequence&&$('#clImportError'))$('#clImportError').textContent=error.message;}
  finally{if(sequence===importSequence){importLoading=false;renderImportPreview();}}
}
function submitImport(e){
  e.preventDefault();try{
    if(importLoading||!importResult?.total||importResult.errorCount)throw Error('请先上传并通过所有产品行的校验');
    const f=e.target,customer=f.elements.customer.value.trim(),warehouse=f.elements.warehouse.value;if(!customer||!warehouse||!f.elements.consent.checked)throw Error('请填写客户、仓库并确认清货须知');
    const products=importResult.rows.map(row=>structuredClone(row.product));
    if(!warehouses.includes(warehouse))throw Error('请选择有效清货仓库');
    if(editing&&editing.receipts.length&&products.some(p=>!editing.products.some(old=>old.id===p.id)))throw Error('该历史申请已有收货记录，请保留现有产品，仅修改基础资料');
    rememberWarehouseAddress(f);
    if(editing){if(!canOperate(editing,'edit'))throw Error('申请状态已变化，无法编辑');editing.products=products;editing.customer=customer;M.editWarehouse(editing,warehouse);editing.remark=f.elements.remark.value;editing.importFile=$('#clImportFileName').textContent;M.log(editing,'编辑申请','更新模板产品及申请信息');}
    else{const o={id:M.newId(),customer,warehouse,remark:f.elements.remark.value,status:'待受理',created:M.now(),updated:M.now(),searchAt:'',products,quotes:[],deliveries:[],receipts:[],logs:[],importFile:$('#clImportFileName').textContent};M.log(o,'模板导入下单',products.length+' 项产品，共 '+M.sum(o,'quantity')+' 件');orders.unshift(o);}
    save();page=1;tab='待受理';filters={};$('#clFilter').reset();renderList();$('#clDrawer').hidden=true;$('#clDrawer').classList.remove('cl-import-overlay');toast(editing?'申请修改已保存':'模板导入下单成功，等待受理');importSequence++;
  }catch(error){$('#clImportError').textContent=error.message;}
}
function modal(title,body,onSubmit,label='确定'){
  const root=$('#clModal');root.innerHTML=`<section class="cl-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h3>${title}</h3><button class="cl-close" data-cl-action="modal-close" aria-label="关闭弹窗">×</button></header><form id="clModalForm"><div class="cl-modal-body">${body}<p id="clModalError" class="cl-error" role="alert"></p></div><footer>${btn('取消','modal-close')}<button class="cl-btn primary" type="submit">${label}</button></footer></form></section>`;root.hidden=false;
  $('#clModalForm').onsubmit=e=>{e.preventDefault();try{onSubmit(new FormData(e.target));save();root.hidden=true;renderList();if(current&&!$('#clDrawer').hidden)detail(current,detailTab);toast('操作已保存');}catch(error){$('#clModalError').textContent=error.message;}};root.querySelector('input,select,textarea')?.focus();
}
function receiveForm(o){
  if(!canOperate(o,'receive'))throw Error('当前状态不可登记到仓');
  modal('登记到仓',`<div class="cl-notice" style="margin-bottom:18px">${esc(o.id)} · ${esc(o.warehouse)}<br>确认本清货单的货物已全部到仓，登记统一的实际到仓时间。</div>${table(['产品名称','SKU','到仓数量(件)'],o.products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.sku||'—')}</td><td>${p.quantity}</td></tr>`).join(''))}${field('实际到仓时间',input('time','datetime-local',M.now().slice(0,16).replace(' ','T'),'required'),true)}${field('物流商',input('carrier','text','UPS'))}${field('到仓备注','<textarea name="note"></textarea>')}`,f=>registerArrival(o,f.get('time'),f.get('note'),f.get('carrier')),'确认整单到仓');
}
function warehouseForm(o){
  modal('修改清货仓库',`${field('清货仓库',`<select name="warehouse" required>${options(warehouses,o.warehouse,'请选择仓库')}</select>`,true)}${warehouseAddressField(o.warehouse,'cl')}`,f=>{const warehouse=f.get('warehouse');if(!warehouses.includes(warehouse))throw Error('请选择有效清货仓库');rememberWarehouseAddress($('#clModalForm'));M.editWarehouse(o,warehouse);},'保存修改');
}
function shippingForm(o){
  if(!canOperate(o,'shipping'))throw Error('当前状态不可补充发运');const ps=o.products.filter(p=>p.received<p.quantity);
  modal('补充发运',`${field('产品',`<select name="product" id="clShipProduct">${ps.map(p=>option(p.id,p.name)).join('')}</select>`,true)}${field('追踪单号',input('tracking','text',ps[0].tracking||'','required'),true)}${field('发运时间',input('time','datetime-local',(ps[0].shipped||M.now()).slice(0,16).replace(' ','T'),'required'),true)}${field('物流商',input('carrier','text',ps[0].carrier||'UPS'))}`,f=>M.ship(o,f.get('product'),f.get('tracking'),f.get('time'),f.get('carrier')),'保存发运信息');
  $('#clShipProduct').onchange=e=>{const p=ps.find(p=>p.id===e.target.value),f=$('#clModalForm');f.elements.tracking.value=p.tracking||'';f.elements.time.value=(p.shipped||M.now()).slice(0,16).replace(' ','T');f.elements.carrier.value=p.carrier||'UPS';};
}
function quoteForm(o){
  if(!canOperate(o,'quote'))throw Error('仅寻找买家阶段且未超过期限时可新增报价');
  modal('新增买家报价',`${field('产品',`<select name="product">${o.products.filter(p=>p.quantity>p.delivered+M.reserved(o,p.id)).map(p=>option(p.id,p.name+' · 未成交 '+(p.quantity-p.delivered-M.reserved(o,p.id))+' 件')).join('')}</select>`,true)}${field('买家信息 / 标识',input('buyer','text','','required'),true)}${field('报价数量（件）',input('quantity','number','','required min="1" step="1"'),true)}${field('报价总金额（USD）',input('amount','number','','required min="0.01" step="0.01"'),true)}<div class="cl-notice">保存后进入待确认报价，由客户接受或拒绝。可在送仓前确认报价。</div>`,f=>M.addQuote(o,f.get('product'),f.get('buyer'),f.get('quantity'),f.get('amount')),'提交报价待确认');
}
function deliverForm(o,qid=''){
  if(!canOperate(o,'deliver'))throw Error('当前没有待提货成交');const qs=o.quotes.filter(q=>q.result==='已接受'&&q.delivered<q.quantity);const selected=qs.find(q=>q.id===qid)||qs[0];
  modal('登记买家提货',`${field('成交报价 / 买家',`<select name="quote" id="clDeliverQuote">${qs.map(q=>option(q.id,q.buyer+' · '+o.products.find(p=>p.id===q.product).name+' · 待提 '+(q.quantity-q.delivered)+' 件',selected.id)).join('')}</select>`,true)}<div id="clDeliverInfo" class="cl-notice" style="margin-bottom:16px"></div>${field('本次提货数量（件）',input('quantity','number','','required min="1" step="1"'),true)}${field('实际提货时间',input('time','datetime-local',M.now().slice(0,16).replace(' ','T'),'required'),true)}${field('提货人 / 买家代表',input('receiver','text','','required'),true)}${field('提货备注','<textarea name="note" placeholder="车辆、交接或提货凭据等"></textarea>')}<div class="cl-notice warning">保存代表货物已实际交付，本次提货数量将从实物在库及成交待提数量中扣减。</div>`,f=>M.deliver(o,f.get('quote'),f.get('quantity'),f.get('time'),f.get('receiver'),f.get('note')),'确认已实际提货');
  const update=()=>{const q=qs.find(q=>q.id===$('#clDeliverQuote').value),p=o.products.find(p=>p.id===q.product);$('#clDeliverInfo').textContent='成交剩余待提 '+(q.quantity-q.delivered)+' 件 · 实际在库 '+M.stock(p)+' 件 · 本次最多可提 '+Math.min(q.quantity-q.delivered,M.stock(p))+' 件';$('#clModalForm').elements.quantity.max=String(Math.min(q.quantity-q.delivered,M.stock(p)));};$('#clDeliverQuote').onchange=update;update();
}
const confirmAction=(title,msg,fn,label='确认')=>modal(title,`<div class="cl-notice">${msg}</div>`,fn,label);
function listLogs(){
  $('#clDrawer').classList.remove('cl-import-overlay');
  current=null;editing=null;importSequence++;
  const rows=filtered().flatMap(o=>o.logs.map(l=>({o,l}))).sort((a,b)=>new Date(b.l.time).getTime()-new Date(a.l.time).getTime());
  $('#clDrawer').innerHTML=`<section class="cl-drawer" role="dialog" aria-modal="true" aria-label="清货操作日志"><header class="cl-drawer-header"><div><h2>清货操作日志</h2><p class="cl-muted">${esc(tab)} · 当前筛选范围 · 共 ${rows.length} 条记录</p></div><button class="cl-close" data-cl-action="close" aria-label="关闭日志">×</button></header><div class="cl-drawer-body"><section class="cl-section">${table(['操作时间','清货单号','客户名称','操作人','操作类型','变更内容'],rows.map(({o,l})=>`<tr data-cl-order="${o.id}"><td>${displayTime(l.time)}</td><td><button class="cl-link" data-cl-action="detail">${esc(o.id)}</button></td><td>${esc(o.customer)}</td><td>${esc(l.user)}</td><td>${esc(l.action)}</td><td style="white-space:normal;min-width:220px">${esc(l.note)}</td></tr>`).join(''))}</section></div><footer class="cl-drawer-footer">${btn('关闭','close')}</footer></section>`;
  $('#clDrawer').hidden=false;
}
function cancelSelected(){
  if(tab!=='待受理'||!selectedOrderIds.size)throw Error('请勾选运单');
  const ids=[...selectedOrderIds];current=null;
  modal('取消待受理申请',`<div class="cl-notice warning">将取消已选择的 ${ids.length} 条待受理申请，取消后进入已终止，历史记录保留。</div>${field('取消原因','<textarea name="reason" required maxlength="500" placeholder="请输入取消原因"></textarea>',true)}`,f=>{
    const targets=ids.map(id=>orders.find(o=>o.id===id));
    if(targets.some(o=>!o||!canOperate(o,'cancel')))throw Error('所选申请状态已变化，请重新选择');
    const drafts=targets.map(o=>{const draft=structuredClone(o);M.terminate(draft,f.get('reason'));return draft;});
    targets.forEach((o,i)=>Object.assign(o,drafts[i]));selectedOrderIds.clear();
  },'确认取消');
}
function exportCSV(){const rows=exportProductGrid(filtered());const safe=v=>/^[=+@\-\t\r]/.test(String(v??''))?"'"+v:String(v??'');const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+safe(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='清货产品明细_'+M.now().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出筛选清货单的全部产品，每个产品一行');}
function action(name,target){
  const row=target.closest('[data-cl-order]'),o=row?orders.find(o=>o.id===row.dataset.clOrder):current,qid=target.closest('[data-cl-quote]')?.dataset.clQuote;
  if(name==='close'){$('#clDrawer').hidden=true;$('#clDrawer').classList.remove('cl-import-overlay');current=null;editing=null;importSequence++;return;}if(name==='modal-close'){$('#clModal').hidden=true;return;}
  if(name==='cancel-edit'){if(current)detail(current);return;}
  if(name==='save-address'){const form=target.closest('form');saveWarehouseAddress(form?.elements.warehouse.value,form?.elements.warehouseAddress.value);toast('仓库地址已保存，选择时自动带出');return;}
  if(name==='reset'){$('#clFilter').reset();filters={};tab='待受理';page=1;renderList();return;}if(name==='expand'){const a=$('#clAdvanced');a.hidden=!a.hidden;target.textContent=a.hidden?'展开产品筛选 ⌄':'收起产品筛选 ⌃';return;}
  if(name==='list-logs'){listLogs();return;}
  if(name==='cancel-selected'){cancelSelected();return;}
  if(name==='columns'){$('#clColumns').hidden=!$('#clColumns').hidden;return;}if(name==='create'){create();return;}if(name==='export'){exportCSV();return;}if(name==='prev'||name==='next'){page+=name==='prev'?-1:1;renderList();return;}
  if(!o)return;if(tab==='全部'&&!['detail','logs','quotes','settlements','warehouse'].includes(name))throw Error('全部状态仅支持查看');current=o;
  if(name==='warehouse'){warehouseForm(o);return;}
  if(name==='detail'){detail(o);return;}if(name==='logs'){detail(o,5);return;}if(name==='quotes'){detail(o,3);return;}if(name==='settlements'){detail(o,4);return;}if(name==='edit'){edit(o);return;}
  if(name==='receive'){receiveForm(o);return;}if(name==='shipping'){shippingForm(o);return;}if(name==='quote'){quoteForm(o);return;}if(name==='deliver'){deliverForm(o,qid);return;}
  if(name==='accept'){if(!canOperate(o,'accept'))throw Error('仅待受理申请可受理');modal('受理清货申请',`${field('清货仓库',`<select name="warehouse" required>${options(warehouses,o.warehouse,'请选择仓库')}</select>`,true)}${warehouseAddressField(o.warehouse,'cl')}<div class="cl-notice">确认仓库及地址后受理，开始寻找买家并记录首轮 7 天反馈期限。</div>`,f=>{if(!M.can(o,'accept'))throw Error('申请状态已变化，无法受理');const warehouse=f.get('warehouse');if(!warehouses.includes(warehouse))throw Error('请选择有效清货仓库');rememberWarehouseAddress($('#clModalForm'));M.editWarehouse(o,warehouse);M.acceptOrder(o);},'确认受理');return;}
  if(name==='remind'){if(!canOperate(o,'remind'))throw Error('尚未到客户反馈期限');const p=M.clearanceProgress(o);modal(p.limitReached?'30 天到期客户提醒':'7 天客户反馈提醒',`${field('客户提醒内容','<textarea readonly rows="4">'+esc('清货单 '+o.id+' 自 '+p.acceptedAt+' 受理，已寻找 '+p.searchDays+' 天，目前尚未找到合适买家。'+(p.limitReached?'已达最长 30 天寻找期限，请确认后由客服人工终止。':'请确认是否继续寻找买家，累计寻找最长 30 天，期间仓储费用正常计收。'))+'</textarea>')}${field('沟通备注','<textarea name="note" maxlength="1000" placeholder="记录沟通渠道、客户回复等"></textarea>')}<label class="cl-consent"><input name="notified" type="checkbox" required>已将提醒内容告知客户</label>`,f=>{if(!f.get('notified'))throw Error('请确认已人工提醒客户');M.recordReminder(o,f.get('note'));},'保存提醒记录');return;}
  if(name==='feedback'){if(!canOperate(o,'extend'))throw Error('当前无需确认继续寻找或已达 30 天上限');modal('客户确认继续寻找',`<div class="cl-notice">已寻找 ${M.elapsed(o)} 天。继续寻找沿用原受理时间，累计最长 30 天。客户选择停止时，请点击“终止清货”。</div>${field('客户反馈备注','<textarea name="note" maxlength="1000" placeholder="记录客户回复或沟通依据"></textarea>')}<label class="cl-consent"><input name="consent" type="checkbox" required>客户已明确同意继续寻找买家</label>`,f=>M.extend(o,Boolean(f.get('consent')),f.get('note')),'保存客户同意记录');return;}
  if(name==='accept-quote'||name==='reject-quote'){const q=o.quotes.find(q=>q.id===qid);confirmAction(name==='accept-quote'?'接受买家报价':'拒绝买家报价',esc(q.buyer)+' · '+q.quantity+' 件 · '+money(q.amount)+(name==='accept-quote'?'<br>接受后进入待提货，在库数量保持当前数值。':'<br>拒绝后继续寻找买家。'),()=>M.decideQuote(o,qid,name==='accept-quote'));return;}
  if(name==='settle'){const q=o.quotes.find(q=>q.id===qid);confirmAction('确认清货结算',esc(q.buyer)+' · '+money(q.amount)+'<br>本次成交已全部提货。部分成交结算后，剩余货物继续寻找买家。',()=>M.settle(o,qid),'确认已结算');return;}
  if(name==='terminate'||name==='cancel'){if(!canOperate(o,name))throw Error('当前阶段不可取消或终止');modal(name==='cancel'?'取消待受理申请':'终止清货',`${field(name==='cancel'?'取消原因':'终止原因','<textarea name="reason" required></textarea>',true)}<div class="cl-notice warning">确认后记录终止时间，清货时长停止计时。历史记录及剩余实物数量保留。</div>`,f=>M.terminate(o,f.get('reason')),name==='cancel'?'确认取消':'确认终止');}
}
document.addEventListener('click',e=>{
  const image=e.target.closest('[data-cl-image]');if(image){$('#clModal').innerHTML=`<section class="cl-modal" role="dialog" aria-modal="true" aria-label="产品图片预览"><header><h3>产品图片预览</h3><button class="cl-close" data-cl-action="modal-close" aria-label="关闭">×</button></header><div class="cl-modal-body"><img class="cl-image-preview" src="${esc(image.dataset.clImage)}" alt="产品图片"></div></section>`;$('#clModal').hidden=false;return;}
  const t=e.target.closest('[data-cl-tab]');if(t){tab=t.dataset.clTab;page=1;renderList();return;}const dt=e.target.closest('[data-cl-detail-tab]');if(dt){if(!dt.disabled)detail(current,Number(dt.dataset.clDetailTab));return;}const pg=e.target.closest('[data-cl-page]');if(pg){page=Number(pg.dataset.clPage);renderList();return;}
  const a=e.target.closest('[data-cl-action]');if(a&&!a.disabled){try{action(a.dataset.clAction,a);}catch(error){toast(error.message);}return;}if(e.target===$('#clModal'))$('#clModal').hidden=true;
});
document.addEventListener('change',e=>{const t=e.target;if(t.matches('.cl-row-check')){if(t.checked)selectedOrderIds.add(t.dataset.clSelected);else selectedOrderIds.delete(t.dataset.clSelected);renderList();return;}if(t.matches('.cl-select-all')){filtered().slice((page-1)*size,page*size).forEach(o=>{if(t.checked)selectedOrderIds.add(o.id);else selectedOrderIds.delete(o.id);});renderList();return;}if(t.matches('[data-cl-col]')){if(t.checked)hiddenCols.delete(t.dataset.clCol);else hiddenCols.add(t.dataset.clCol);renderList();}if(t.id==='clPageSize'){size=Number(t.value);page=1;renderList();}if(t.id==='clImportFile'&&t.files[0])uploadImport(t.files[0]);});
$('#clFilter').onsubmit=e=>{e.preventDefault();const next=Object.fromEntries(new FormData(e.target));for(const [start,end]of[['from','to'],['arrivalFrom','arrivalTo'],['shippedFrom','shippedTo']])if(next[start]&&next[end]&&next[start]>next[end]){toast('开始日期须早于或等于结束日期');return;}for(const [key,label]of numberRanges)if(next[key+'Min']!==''&&next[key+'Max']!==''&&Number(next[key+'Min'])>Number(next[key+'Max'])){toast(label+'最小值须小于或等于最大值');return;}next.currency=next.currency.trim().toUpperCase();if(next.currency&&!/^[A-Z]{3}$/.test(next.currency)){toast('币种须为三位英文代码，例如 USD');return;}filters=next;page=1;renderList();};
document.addEventListener('change',e=>{if(e.target.matches('#clEditForm [name="arrival"]'))syncEditArrival();if(e.target.matches('#clImportForm [name="warehouse"],#clEditForm [name="warehouse"],#clModalForm [name="warehouse"]'))syncWarehouseAddress(e.target.form||e.target.closest('form'));});
document.addEventListener('submit',e=>{if(e.target.id==='clImportForm')submitImport(e);if(e.target.id==='clEditForm')submitEdit(e);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#clModal').hidden)$('#clModal').hidden=true;else if(!$('#clDrawer').hidden){$('#clDrawer').hidden=true;$('#clDrawer').classList.remove('cl-import-overlay');current=null;editing=null;importSequence++;}}});
document.addEventListener('warehouse-page-change',()=>{pageEl.hidden=true;$('#clDrawer').hidden=true;$('#clDrawer').classList.remove('cl-import-overlay');$('#clModal').hidden=true;importSequence++;});
const refreshServiceClock=()=>{if(pageEl.hidden||document.visibilityState==='hidden')return;renderList();if(current&&!editing&&!$('#clDrawer').hidden){const clock=$('#clDrawer').querySelector('.cl-service-clock');if(clock)clock.outerHTML=serviceClock(current);}};
window.setInterval?.(refreshServiceClock,60000);
document.addEventListener('visibilitychange',refreshServiceClock);
window.ClearanceUI={open};renderList();save();if(new URLSearchParams(location.search).get('page')==='clearance')open();
