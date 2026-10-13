// Payment proof interactions for the local warehouse prototype.
// File blobs stay in IndexedDB; only metadata is stored with clearance orders.
export const PAYMENT_CURRENCIES=['USD','CNY','EUR','GBP'];
export const MAX_PAYMENT_FILES=5,MAX_PAYMENT_FILE_SIZE=10*1024*1024;
export const eligiblePaymentQuotes=o=>(o.quotes||[]).filter(q=>q.result==='已接受'&&q.delivered===q.quantity);
export const quotePayments=q=>Array.isArray(q?.payments)?q.payments:[];
export const quoteFileCount=q=>quotePayments(q).reduce((n,p)=>n+(p.files||[]).length,0);
export function paymentSummary(o){
  const quotes=eligiblePaymentQuotes(o),count=quotes.reduce((n,q)=>n+quoteFileCount(q),0),missing=quotes.filter(q=>!quoteFileCount(q)).length;
  return {count,missing,applicable:quotes.length>0,label:count?'已上传':quotes.some(q=>q.settled)?'待补传':quotes.length?'未上传':'—'};
}
export function paymentFields(values){
  const amount=String(values.amount||'').trim(),currency=String(values.currency||'').trim();
  if(!/^\d{1,12}(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)throw Error('请填写大于 0 的付款金额，最多保留两位小数');
  if(!PAYMENT_CURRENCIES.includes(currency))throw Error('请选择有效付款币种');
  const paidAt=String(values.paidAt||'');if(!paidAt||!Number.isFinite(Date.parse(paidAt)))throw Error('请选择有效的实际付款时间');
  return {amount:Number(amount).toFixed(2),currency,paidAt,reference:String(values.reference||'').trim().slice(0,100),remark:String(values.remark||'').trim().slice(0,500)};
}
export function validatePaymentFiles(files){
  if(!files.length)throw Error('请至少上传一份支付水单');
  if(files.length>MAX_PAYMENT_FILES)throw Error('每次最多上传 5 份水单');
  for(const file of files){
    const extension=file.name.split('.').pop().toLowerCase(),mime={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',pdf:'application/pdf'}[extension];
    if(!mime||(file.type&&file.type!==mime))throw Error(file.name+'：仅支持 JPG、PNG 或 PDF 文件');
    if(!file.size)throw Error(file.name+'：文件为空，请重新选择');
    if(file.size>MAX_PAYMENT_FILE_SIZE)throw Error(file.name+'：文件超过 10 MB');
  }
}
const fileSize=n=>n>=1024*1024?(n/1024/1024).toFixed(1)+' MB':Math.max(1,Math.ceil(n/1024))+' KB';
const makeId=prefix=>prefix+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,9).toUpperCase();
let databasePromise;
function database(){
  if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB){reject(Error('当前浏览器不支持本地附件保存，请使用 Chrome 或 Edge'));return;}
    const request=indexedDB.open('mw-clearance-payment-files-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(Error('无法打开本地附件存储，请检查浏览器存储设置'));
  }).catch(error=>{databasePromise=null;throw error;});
  return databasePromise;
}
async function storeFiles(files){
  validatePaymentFiles(files);const db=await database();
  const records=files.map(file=>({id:makeId('PF'),name:file.name,size:file.size,type:file.type||({pdf:'application/pdf',png:'image/png'}[file.name.split('.').pop().toLowerCase()]||'image/jpeg'),blob:file}));
  await new Promise((resolve,reject)=>{
    const transaction=db.transaction('files','readwrite');for(const record of records)transaction.objectStore('files').put(record);
    transaction.oncomplete=resolve;transaction.onerror=transaction.onabort=()=>reject(Error('水单保存失败，请检查浏览器存储空间后重试'));
  });
  return records.map(({blob,...meta})=>meta);
}
async function deleteFiles(files){
  const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');files.forEach(file=>tx.objectStore('files').delete(file.id));tx.oncomplete=resolve;tx.onabort=tx.onerror=reject;});
}
async function readFile(id){
  const db=await database();return new Promise((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(id);request.onsuccess=()=>request.result?resolve(request.result):reject(Error('本地水单文件已丢失，请在原上传浏览器查看或重新补传'));request.onerror=()=>reject(Error('水单读取失败，请重试'));});
}
const fileIcon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/></svg>';
const uploadIcon='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V3M7 8l5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg>';
export function createPaymentUI({esc,field,input,options,now,displayTime,getTab,persist,onSaved,toast,log}){
  const $=selector=>document.querySelector(selector);
  let draft=null,saving=false,sequence=0,previewURL='';
  document.body.insertAdjacentHTML('beforeend','<div id="clPaymentPreview" class="cl-overlay cl-modal-overlay cl-payment-preview-overlay" hidden></div>');
  const amountText=p=>esc(p.currency)+' '+Number(p.amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const writable=(o,q)=>getTab()!=='全部'&&o.status!=='已终止'&&eligiblePaymentQuotes(o).some(item=>item.id===q?.id);
  const control=(label,action,attrs='')=>`<button type="button" class="cl-link" data-cl-payment-action="${action}" ${attrs}>${label}</button>`;
  function summaryHTML(o){const s=paymentSummary(o);return s.applicable?`<span class="cl-badge ${s.count?'blue':''}">${esc(s.label)}${s.count?' · '+s.count+' 份':''}</span>${s.missing?`<div class="cl-subline">${s.missing} 笔成交待补充</div>`:''}`:'<span class="cl-muted">—</span>';}
  function recordHTML(o,q){
    const payments=quotePayments(q);if(!payments.length)return '<div class="cl-payment-empty">暂无支付水单。'+(writable(o,q)?'点击“上传水单”留存本次付款凭证。':'')+'</div>';
    return payments.map(p=>`<article class="cl-payment-record"><div class="cl-payment-record-title"><strong>${amountText(p)}</strong><span class="cl-badge blue">水单已保存</span><span class="cl-muted">实际付款时间 ${displayTime(p.paidAt)}</span></div><div class="cl-payment-record-meta"><span>收款客户：${esc(p.payee||o.customer)}</span><span>流水号：${esc(p.reference||'—')}</span><span>${esc(p.uploadedBy)} · ${displayTime(p.uploadedAt)}</span></div>${p.remark?`<p class="cl-payment-remark">备注：${esc(p.remark)}</p>`:''}<div class="cl-payment-file-list">${(p.files||[]).map(file=>`<div class="cl-payment-file"><span class="cl-payment-file-icon">${fileIcon}</span><div><strong>${esc(file.name)}</strong><small>${fileSize(file.size)}</small></div><div class="cl-payment-file-actions">${control('预览','preview',`data-payment-file="${esc(file.id)}"`)}${control('下载','download',`data-payment-file="${esc(file.id)}"`)}</div></div>`).join('')}</div></article>`).join('');
  }
  function settlementHTML(o){
    const accepted=(o.quotes||[]).filter(q=>q.result==='已接受');
    return `<section class="cl-section cl-payment-section"><div class="cl-payment-section-heading"><h3>支付水单</h3><span class="cl-muted">按成交留存付款凭证，上传后不自动确认结算</span></div>${accepted.map(q=>{const product=o.products.find(p=>p.id===q.product),ready=q.delivered===q.quantity;return `<div class="cl-payment-deal" data-cl-quote="${esc(q.id)}"><div class="cl-payment-deal-heading"><div><strong>${esc(q.buyer)} · ${esc(product?.name||'')}</strong><p>${esc(q.id)} · 成交 USD ${Number(q.amount).toFixed(2)} · 收款客户 ${esc(o.customer)}</p></div>${writable(o,q)?`<button type="button" class="cl-btn ${quoteFileCount(q)?'':'primary'}" data-cl-action="upload-payment">${quoteFileCount(q)?'追加水单':q.settled?'补传水单':'上传水单'}</button>`:''}</div>${ready?recordHTML(o,q):'<div class="cl-payment-empty">该成交尚未全部提货，进入结算环节后可上传支付水单。</div>'}</div>`;}).join('')||'<div class="cl-payment-empty">暂无已接受的成交报价。</div>'}</section>`;
  }
  function close(force=false){
    if(!draft)return true;if(saving&&!force){toast('水单正在保存，请稍候');return false;}
    sequence++;draft=null;saving=false;$('#clModal').hidden=true;return true;
  }
  function closePreview(){
    $('#clPaymentPreview').hidden=true;$('#clPaymentPreview').innerHTML='';if(previewURL)URL.revokeObjectURL(previewURL);previewURL='';
  }
  function preview(file){
    closePreview();previewURL=URL.createObjectURL(file.blob||file);const root=$('#clPaymentPreview');
    const content=(file.type==='application/pdf'||/\.pdf$/i.test(file.name))?`<iframe title="支付水单 PDF 预览" src="${previewURL}"></iframe>`:`<img src="${previewURL}" alt="${esc(file.name)}">`;
    root.innerHTML=`<section class="cl-modal cl-payment-preview" role="dialog" aria-modal="true" aria-label="支付水单预览"><header><h3>${esc(file.name)}</h3><button type="button" class="cl-close" data-cl-payment-action="close-preview" aria-label="关闭水单预览">×</button></header><div class="cl-payment-preview-body">${content}</div></section>`;root.hidden=false;
  }
  function renderSelected(){
    const root=$('#clPaymentSelected');if(!draft||!root)return;
    root.innerHTML=draft.files.map((file,i)=>`<div class="cl-payment-file"><span class="cl-payment-file-icon">${fileIcon}</span><div><strong>${esc(file.name)}</strong><small>${fileSize(file.size)} · 已选择，保存后生效</small></div><div class="cl-payment-file-actions">${control('预览','preview-selected',`data-file-index="${i}"`)}${control('移除','remove-selected',`data-file-index="${i}"`)}</div></div>`).join('');
    $('#clPaymentFileCount').textContent=`已选择 ${draft.files.length} / 5 份`;
  }
  function selectFiles(files){
    if(!draft||saving)return;const next=[...draft.files];let duplicates=0;
    try{
      for(const file of files){if(next.some(existing=>existing.name===file.name&&existing.size===file.size&&existing.lastModified===file.lastModified)){duplicates++;continue;}next.push(file);}
      validatePaymentFiles(next);draft.files=next;renderSelected();$('#clPaymentError').textContent=duplicates?'已跳过重复选择的文件':'';
    }catch(error){$('#clPaymentError').textContent=error.message;}
  }
  async function submit(event){
    event.preventDefault();if(!draft||saving)return;const active=draft,token=sequence,form=event.target;let stored=[];
    try{
      if(!writable(active.order,active.quote))throw Error('当前成交状态不允许上传水单');
      const fields=paymentFields(Object.fromEntries(new FormData(form)));validatePaymentFiles(active.files);
      saving=true;$('#clPaymentError').textContent='';form.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=true);$('#clPaymentSave').textContent='正在保存…';
      stored=await storeFiles(active.files);if(sequence!==token)throw Error('已取消本次水单保存');
      if(!writable(active.order,active.quote))throw Error('成交状态已变化，请刷新后重试');
      const next=structuredClone(active.order),q=next.quotes.find(q=>q.id===active.quote.id);
      const payment={id:makeId('PAY'),...fields,payee:next.customer,direction:'warehouse_to_customer',uploadedBy:'财务 · 王悦',uploadedAt:now(),files:stored};
      q.payments=[payment,...quotePayments(q)];log(next,q.settled?'补传支付水单':'上传支付水单',q.id+' · '+fields.currency+' '+fields.amount+' · '+stored.map(f=>f.name).join('、'),'财务 · 王悦');
      persist(active.order,next);saving=false;close();onSaved(active.order);toast('支付水单已保存');
    }catch(error){
      if(stored.length)await deleteFiles(stored).catch(()=>{});
      if(sequence===token&&draft){$('#clPaymentError').textContent=error.message;saving=false;form.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=false);$('#clPaymentSave').textContent='保存水单';}
    }
  }
  function open(o,qid=''){
    const q=eligiblePaymentQuotes(o).find(q=>q.id===qid)||(!qid&&eligiblePaymentQuotes(o).length===1?eligiblePaymentQuotes(o)[0]:null);
    if(!q||!writable(o,q))throw Error('请在具体成交的结算区域上传水单');
    close(true);sequence++;draft={order:o,quote:q,files:[]};const product=o.products.find(p=>p.id===q.product),root=$('#clModal');
    root.innerHTML=`<section class="cl-modal cl-payment-modal" role="dialog" aria-modal="true" aria-label="上传支付水单"><header><div><h3>${q.settled?'补传支付水单':quoteFileCount(q)?'追加支付水单':'上传支付水单'}</h3><p class="cl-muted">留存海外仓向客户付款的凭证</p></div><button type="button" class="cl-close" data-cl-payment-action="close-upload" aria-label="关闭上传">×</button></header><form id="clPaymentForm"><div class="cl-modal-body"><div class="cl-payment-context"><strong>${esc(o.id)}</strong><span>${esc(q.id)} · ${esc(product?.name||'')}</span><div><span>收款客户：${esc(o.customer)}</span><span>成交金额：USD ${Number(q.amount).toFixed(2)}</span></div></div><div class="cl-grid cl-payment-grid">${field('本次付款金额',input('amount','number','','required min="0.01" step="0.01" max="999999999999.99" placeholder="请输入实际支付金额"'),true)}${field('付款币种',`<select name="currency" required>${options(PAYMENT_CURRENCIES,'USD','请选择币种')}</select>`,true)}${field('实际付款时间',input('paidAt','datetime-local',now().slice(0,16).replace(' ','T'),'required'),true)}${field('银行流水号 / 交易参考号',input('reference','text','','maxlength="100" placeholder="选填，便于查账"'))}${field('备注','<textarea name="remark" maxlength="500" placeholder="选填，说明本次付款或补充信息"></textarea>',false,true)}</div><p class="cl-payment-help">成交金额仅供参考，付款金额和币种按实际水单填写。</p><div class="cl-payment-upload-label"><span class="cl-required">支付水单</span><span id="clPaymentFileCount">已选择 0 / 5 份</span></div><div class="cl-payment-drop" id="clPaymentDrop">${uploadIcon}<strong>点击上传或拖拽文件到此处</strong><span>支持 JPG、PNG、PDF · 单文件不超过 10 MB · 每次最多 5 份</span><button type="button" class="cl-btn" data-cl-payment-action="choose-files">选择文件</button><input id="clPaymentFiles" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple hidden></div><div id="clPaymentSelected" class="cl-payment-selected"></div><div class="cl-notice cl-payment-notice">${q.settled?'补传水单不会改变原结算状态及结算时间。':'保存后保留当前结算状态，财务核对后可单独确认结算。'}</div><p id="clPaymentError" class="cl-error" role="alert"></p></div><footer><span class="cl-muted">至少选择一份水单</span><button type="button" class="cl-btn" data-cl-payment-action="close-upload">取消</button><button type="submit" class="cl-btn primary" id="clPaymentSave">保存水单</button></footer></form></section>`;
    root.hidden=false;$('#clPaymentForm').onsubmit=submit;$('#clPaymentForm [name="amount"]').focus();
    const drop=$('#clPaymentDrop');drop.addEventListener('click',event=>{if(!saving&&!event.target.closest('button,input'))$('#clPaymentFiles').click();});drop.addEventListener('dragover',event=>{event.preventDefault();if(!saving)drop.classList.add('dragging');});drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('dragging');selectFiles(Array.from(event.dataTransfer.files));});
  }
  document.addEventListener('change',event=>{if(event.target.id==='clPaymentFiles'){selectFiles(Array.from(event.target.files));event.target.value='';}});
  document.addEventListener('click',async event=>{
    if(event.target===$('#clPaymentPreview')){closePreview();return;}
    const target=event.target.closest('[data-cl-payment-action]');if(!target||target.disabled)return;
    const action=target.dataset.clPaymentAction;
    try{
      if(action==='close-upload'){close();return;}if(action==='close-preview'){closePreview();return;}
      if(action==='choose-files'){if(!saving)$('#clPaymentFiles').click();return;}
      if(action==='remove-selected'){if(draft&&!saving){draft.files.splice(Number(target.dataset.fileIndex),1);renderSelected();}return;}
      if(action==='preview-selected'){if(draft)preview(draft.files[Number(target.dataset.fileIndex)]);return;}
      const file=await readFile(target.dataset.paymentFile);
      if(action==='preview'){preview(file);return;}
      if(action==='download'){const url=URL.createObjectURL(file.blob),anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    }catch(error){toast(error.message);}
  });
  return {open,close,closePreview,summaryHTML,settlementHTML,writable,get busy(){return saving;},get isOpen(){return Boolean(draft);},get previewOpen(){return Boolean(previewURL);}};
}
