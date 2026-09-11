(() => {
  const app = document.createElement('section');
  app.className = 'forecast-app'; app.hidden = true; app.setAttribute('aria-label','预报单');
  const labels = ['全部(16970)','预报(9)','接整(1)','运输中(227)','预约池(137)','提柜(25)','入库处理中(1021)','已完成(14636)','拒绝/取消(914)'];
  const customers = ['HHD','HHD','HHD','TTTX','TTTX','TTTX','TTTX','TTTX','TTTX','ZHENZ','ZNTD','TTTX','TTTX','TTTX','SXD','TTTX','ZNTD','TYGYL'];
  const numbers = ['REQ260829-0006-W01-HHD','REQ260829-0005-W01-HHD','REQ260829-0004-W01-HHD','REQ260828-0021-W01-TTTX','REQ260828-0019-W01-TTTX','REQ260828-0018-W01-TTTX','REQ260828-0017-W01-TTTX','REQ260828-0016-W01-TTTX','REQ260828-0015-W01-TTTX','REQ260828-0004-W01-ZHENZ','REQ260828-0002-W01-ZNTD','REQ260828-0011-W01-TTTX','REQ260828-0010-W01-TTTX','REQ260828-0009-W01-TTTX','REQ260828-0001-W01-SXD','REQ260828-0008-W01-TTTX','REQ260828-0001-W01-ZNTD','REQ260828-0001-W01-TYGYL'];
  const containers = ['BEAU5079284','TEMU8756807','BEAU4474772','FFAU5064470','FFAU4879776','TGBU6323963','CMAU6829354','GCXU5002101','GESU6920802','MATU5212348','BEAU6022869','CMAU7317408','ECMU6076248','ECMU6076470','EGSU1683654','ECMU5200673','FFAU3224584','MRSU5180771'];
  const amounts = [8,6,2,56,51,4,47,45,45,11,11,48,66,50,11,47,11,4];
  const arrival = ['','','','2026-09-09','2026-09-09','2026-09-10','2026-09-10','2026-09-11','2026-09-10','','','2026-09-10','2026-09-10','2026-09-10','','2026-09-10','',''];
  const expected = ['07','07','07','09','09','11','11','10','11','07','08','11','11','11','08','11','08','04'];
  const rows = customers.map((customer,i)=>({customer,number:numbers[i],container:containers[i],amount:amounts[i],dates:[arrival[i],'','','',''],expected:'2026-09-'+expected[i],system:containers[i]+'-2609'+(i<3?'07':expected[i]),status:4}));
  let selected=new Set(), activeStatus=4, filtered=rows;
  const btn=(text,cls='',action='')=>`<button class="fc-btn ${cls}" ${action?`data-action="${action}"`:''}>${text}</button>`;
  const nav=(name,icon='⌂',extra='')=>`<button class="fc-nav ${extra}" data-nav="${name}"><i>${icon}</i>${name}<b>⌄</b></button>`;
  app.innerHTML=`<aside class="fc-side"><div class="fc-brand"><span class="fc-logo">MW</span>美仓海外仓系统</div>${nav('货件管理','♙')}${nav('出运计划','☷')}${nav('入库管理','♧','open')}<div class="fc-inbound"><button class="fc-nav child active" data-nav="预报单">♧&nbsp; 预报单</button><button class="fc-nav child" data-nav="运单管理">♧&nbsp; 运单管理</button></div>${nav('库内管理','♙')}<div class="fc-sub" hidden><button class="fc-nav child" data-nav="暂存库存">暂存库存</button><button class="fc-nav child" data-nav="拦截管理">拦截管理</button></div>${nav('客户管理')}${nav('出库管理','♙')}${nav('仓库管理')}${nav('数据报表','♙')}${nav('单据管理','▣')}${nav('财务管理','▧')}${nav('系统设置','⚙')}${nav('询价报价管理','?')}${nav('报价询价','♙')}<button class="fc-side-bottom">‹</button></aside>
  <div class="fc-work"><header class="fc-top"><div class="fc-top-left"><button class="fc-icon" data-action="collapse-side">☰</button><span>◂</span><button class="fc-tab" data-nav="库存盘点">库存盘点<span>×</span></button><button class="fc-tab" data-nav="暂存库存">暂存库存<span>×</span></button><button class="fc-tab active" data-nav="预报单">预报单<span>×</span></button><button class="fc-tab" data-nav="FBA货件">FBA货件<span>×</span></button></div><div class="fc-top-right"><span>▸</span><button data-action="export-center">导出任务中心</button><button>英文</button><button class="fc-pill">上海时区⌄</button><button class="fc-pill">♧ 洛杉矶仓⌄</button><span class="fc-bell">♧<b>99+</b></span><span class="fc-avatar">♙</span><span>天朗</span></div></header>
  <main class="fc-content"><section class="fc-filters"><form id="fc-search-form"><div class="fc-fields"><label class="fc-field">关键字 <em>?</em><input name="keyword" placeholder="单个精准搜索"></label><label class="fc-field">预报单号<input name="number" placeholder="预报单号"></label><label class="fc-field">柜号<input name="container" placeholder="批量查询多个用';'号隔开"></label><label class="fc-field">入仓号<input name="inbound" placeholder="入仓号"></label></div><div class="fc-fields fc-extra" hidden><label class="fc-field">客户名称<input name="customer" placeholder="客户名称"></label><label class="fc-field">仓库<select><option>洛杉矶仓</option></select></label></div><div class="fc-filter-actions"><button class="fc-btn primary" type="submit">搜 索</button><button class="fc-btn" type="reset">重 置</button><button class="fc-btn" type="button" data-action="expand">⌄ 展开</button></div></form></section>
  <section class="fc-card"><div class="fc-statusbar"><div class="fc-status-tabs">${labels.map((label,i)=>`<button class="fc-status ${i===4?'active':''}" data-status="${i}">${label}</button>`).join('')}</div><div class="fc-actions">${['结算类型','拆柜类型','数据统计','预 警','批量操作⌄','导出⌄','导入⌄','Local⌄'].map((x,i)=>btn(x,i===3?'danger':'','tool-'+i)).join('')}</div></div><div class="fc-tabletools"><span class="fc-selected"></span>${btn('⚙','primary','settings')}</div><div class="fc-scroll"><table class="fc-table"><colgroup>${[44,48,100,180,100,90,90,90,70,90,90,115,140,160,120,140,145,135,145,100,163].map(w=>`<col style="width:${w}px">`).join('')}</colgroup><thead><tr>${['#','<input type="checkbox" aria-label="全选预报单" id="fc-all">','客户名称','预报单号','提柜地点','仓库','码头','火车站','库点数量','中转仓','集装箱类型','柜号','系统柜号','实际到港/火车站时间','预计到港时间','卸船/下火车时间','实际提柜时间','拆柜时间','还空时间','最晚还柜时间','操作'].map((x,i)=>`<th class="${i===20?'fc-operation':''}">${x}${[3,13,14].includes(i)?'<span class="fc-sort">◆</span>':''}</th>`).join('')}</tr></thead><tbody></tbody></table></div><footer class="fc-footer"><span class="fc-total">共 137 条</span><button class="fc-arrow" disabled>‹</button><button class="fc-current">1</button><button class="fc-arrow" disabled>›</button><select aria-label="每页条数"><option>500 条/页</option><option>100 条/页</option><option>20 条/页</option></select></footer></section></main></div><div class="fc-watermarks" aria-hidden="true">${Array.from({length:280},()=>'<span>天朗2026-09-09</span>').join('')}</div><div class="fc-floats" aria-hidden="true"><span>♧</span><span>㊫</span></div><dialog class="fc-dialog"></dialog>`;
  const forecastContent = app.querySelector('.fc-content');
  const forecastDialog = app.querySelector('.fc-dialog');
  app.replaceChildren(forecastContent, forecastDialog);
  document.querySelector('.workspace').append(app);
  const q=s=>app.querySelector(s); const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){q('tbody').innerHTML=filtered.map(r=>{const i=rows.indexOf(r);const edit=k=>`<span class="fc-date">${escape(r.dates[k]||'/')}<button class="fc-link" data-edit="${i},${k}">编辑</button></span>`;return `<tr><td>${i+1}</td><td><input type="checkbox" data-check="${i}" aria-label="选择${r.number}" ${selected.has(i)?'checked':''}></td><td>${r.customer}</td><td><button class="fc-link" data-detail="${i}">${r.number}</button></td><td>码头</td><td>洛杉矶仓</td><td></td><td></td><td>${r.amount}</td><td></td><td>${i===9?'40GP':'40HQ'}</td><td><button class="fc-link ${i===5?'red':''}" data-detail="${i}">${r.container}</button></td><td title="${r.system}">${r.system}</td><td>${edit(0)}</td><td>${r.expected}</td><td>${edit(1)}</td><td>${edit(2)}</td><td>${edit(3)}</td><td>${edit(4)}</td><td>${i>2?'2026-09-15':''}</td><td class="fc-operation"><button class="fc-link" data-upload="${i}">上传附件</button><button class="fc-link" data-more="${i}">更多⌄</button></td></tr>`}).join('')||'<tr><td colspan="21" class="fc-empty">暂无数据</td></tr>';q('.fc-selected').textContent=selected.size?`已选择 ${selected.size} 条`:'';q('#fc-all').checked=filtered.length>0&&filtered.every(r=>selected.has(rows.indexOf(r)));q('#fc-all').indeterminate=selected.size>0&&!q('#fc-all').checked;}
  function search(){const data=new FormData(q('form')); const terms=['keyword','number','container','inbound','customer'].map(k=>String(data.get(k)||'').trim().toLowerCase());filtered=rows.filter(r=>(activeStatus===0||r.status===activeStatus)&&terms.every((t,i)=>!t||(i===0?Object.values(r).join(' '):i===1?r.number:i===2?r.container:i===3?'':r.customer).toLowerCase().includes(t)));selected.clear();render();q('.fc-total').textContent=`共 ${terms.some(Boolean)||![0,4].includes(activeStatus)?filtered.length:activeStatus===0?16970:137} 条`;}
  function notice(text){q('.fc-notice')?.remove();const n=document.createElement('div');n.className='fc-notice';n.textContent=text;app.append(n);setTimeout(()=>n.remove(),2800);}
  function dialog(title,html,save){const d=q('dialog');d.innerHTML=`<h3>${title}</h3><div>${html}</div><footer>${btn('取消','','cancel-dialog')}${save?btn('确定','primary','save-dialog'):''}</footer>`;d.querySelector('[data-action="cancel-dialog"]').onclick=()=>d.close();if(save)d.querySelector('[data-action="save-dialog"]').onclick=()=>{save(d);d.close()};d.showModal();}
  function close(){app.hidden=true;document.body.classList.remove('forecast-visible');q('.fc-dialog')?.close();app.querySelector('.fc-detail-overlay')?.remove();document.querySelector('#navForecast')?.classList.remove('active');sessionStorage.removeItem('warehouse-page');}
  const cargoRows=[
    ['HHD26071528','Truck-Amazon','595','5196.28','39','PSP3','FBA19JZSMWYJ','4VPYF4LB'],
    ['HHD26080182','Truck-Amazon','27','383.75','1.89','PSP3','FBA19KPM617B','4TRC5YBP'],
    ['HHD26080274','Truck-Amazon','33','683.1','2.27','PSP3','FBA19KQ7X3TY','21IOU3WG'],
    ['HHD26071577','Truck-Amazon','119','1287.08','6.5','PHX7','FBA19K8MG5Z8','83H2GBGS'],
    ['HHD26071533','Truck-Amazon','60','727.5','5.23','PHX5','FBA19KQ9RTB7','3GZ9CXGQ'],
    ['HHD26080223','Truck-Amazon','12','224.4','0.24','LAX9','FBA19KG1JN7','1RK4ADIX'],
    ['HHD26080223-2','Truck-Amazon','12','224.4','0.24','LAX9','FBA19KJJ9SLC','27JQ95KX'],
    ['HHD26080223-3','Truck-Amazon','20','174','0.192','LAX9','FBA19KJ4X3W','422VFRVR'],
    ['HHD26080223-4','Truck-Amazon','20','174','0.192','LAX9','FBA19KJG3NY2','8R91SJ3B'],
    ['HHD26080223-5','Truck-Amazon','20','174','0.192','LAX9','FBA19KH5G5K7','8AL3L59Z'],
    ['HHD26080322','Truck-Amazon','121','1669.3','1.87','LAX9','FBA19KJLJ56R','7XH18PNW'],
    ['HHD26080363','Truck-Amazon','401','5306.5','6.47','LAS1','FBA19KPM2462','4W37KJSK'],
    ['HHD26080388','Truck-Amazon','55','954.1','2.78','GEU2','FBA19KPFN0HH','4MPYNMTO'],
    ['HHD26080388-2','Truck-Amazon','65','1093','3.88','GEU2','FBA19KPGNDK0','6SZCFB4J'],
    ['HHD26080388-3','Truck-Amazon','20','292','1.5','GEU2','FBA19KPML9QT','7K88Z66O']
  ];
  function showForecastDetail(r){
    q('.fc-dialog')?.close();
    app.querySelector('.fc-detail-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='fc-detail-overlay';
    const info=(label,value='')=>`<div class='fc-detail-info'><b>${label}：</b><span>${value||'-'}</span></div>`;
    overlay.innerHTML=`<aside class='fc-detail-drawer' role='dialog' aria-modal='true' aria-label='预报单详情'>
      <header class='fc-detail-header'><button type='button' class='fc-detail-close' data-detail-close aria-label='关闭'>×</button><strong>预报单详情（${escape(r.number)}）</strong></header>
      <div class='fc-detail-body'>
        <section class='fc-detail-section'>
          <h3>基本信息</h3>
          <div class='fc-detail-grid'>
            ${info('客户名称',r.customer)}${info('转运方式','拆转')}${info('预报总箱数（箱）','1580')}${info('总体积（方）','72.446')}${info('重量（千克）','18563.41')}
            ${info('重量（英磅）','40839.50')}${info('入库板数（托）','0')}${info('FBA仓库')}${info('结算类型','组合待价')}${info('预报比例')}
            ${info('类型','普单')}${info('客户备注')}${info('备注')}${info('船名')}${info('航次')}
          </div>
          <h3 class='fc-transport-title'>运输信息</h3>
          <div class='fc-detail-grid'>
            ${info('船司代码','YML')}${info('柜号',r.container)}${info('系统柜号',r.system)}${info('集装箱类型','40HQ')}${info('是否带托架','否')}
            ${info('预计开船时间','2026-08-22')}${info('预计到港时间','2026-09-07')}${info('预计提柜时间','2026-09-14')}${info('实际到港/火车站时间')}${info('卸船/下火车时间')}
            ${info('实际提柜时间')}${info('拆柜时间')}${info('还空时间')}
          </div>
        </section>
        <section class='fc-cargo-section'>
          <h3>装箱详情-${escape(r.container)}</h3>
          <div class='fc-detail-filters'>
            <label><b>关键字 <i>?</i></b><input type='text' data-cargo-keyword placeholder='支持批量搜索关键字'></label>
            <label><b>派送方式</b><select><option value=''>全部</option><option>Truck-Amazon</option></select></label>
            <label><b>FBA仓库</b><select data-cargo-destination><option value=''>全部</option><option>PSP3</option><option>PHX7</option><option>PHX5</option><option>LAX9</option><option>LAS1</option><option>GEU2</option></select></label>
            <div class='fc-detail-search-actions'><button type='button' class='fc-btn primary' data-cargo-search>搜索</button><button type='button' class='fc-btn' data-cargo-reset>重置</button></div>
          </div>
          <div class='fc-detail-toolbar'>
            <button type='button' class='fc-btn primary' data-detail-tool='remark'>修改客户备注</button>
            <button type='button' class='fc-btn primary' data-detail-tool='export'>导出</button>
            <button type='button' class='fc-btn primary' data-detail-tool='reservation'>创建预约</button>
            <button type='button' class='fc-btn primary' data-detail-tool='warehouse'>增加入仓号</button>
            <button type='button' class='fc-btn primary fc-detail-settings' data-detail-tool='settings'>⚙</button>
          </div>
          <div class='fc-detail-table-wrap'>
            <table class='fc-detail-table'>
              <thead><tr><th>#</th><th><input type='checkbox' data-cargo-all aria-label='全选'></th><th>入仓号</th><th>派送方式</th><th>箱数</th><th>重量/KG</th><th>体积/CBM</th><th>目的地</th><th>ShipmentID/IBR</th><th>ReferenceID</th><th>出库时间</th><th>中转仓配载状态</th><th>中转</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </section>
      </div>
    </aside>`;
    app.append(overlay);
    const tbody=overlay.querySelector('tbody');
    function renderCargo(){
      const keyword=overlay.querySelector('[data-cargo-keyword]').value.trim().toLowerCase();
      const destination=overlay.querySelector('[data-cargo-destination]').value;
      const visible=cargoRows.filter(row=>(!keyword||row.join(' ').toLowerCase().includes(keyword))&&(!destination||row[5]===destination));
      tbody.innerHTML=visible.map((row,index)=>`<tr><td>${index+1}</td><td><input type='checkbox' data-cargo-check aria-label='选择${escape(row[0])}'></td>${row.map(value=>`<td title='${escape(value)}'>${escape(value)}</td>`).join('')}<td></td><td>-</td><td></td><td><button type='button' class='fc-link' data-detail-tool='route' data-cargo-row='${cargoRows.indexOf(row)}'>路由</button><button type='button' class='fc-link' data-detail-tool='more' data-cargo-row='${cargoRows.indexOf(row)}'>更多⌄</button></td></tr>`).join('')||`<tr><td colspan='14' class='fc-empty'>暂无匹配的装箱明细</td></tr>`;
    }
    function showOverseasIntercept(row){
      const detail=q('.fc-dialog');
      detail.innerHTML=`<form class='fc-intercept-form' novalidate>
        <header class='fc-intercept-header'><strong>海外拦截</strong><button type='button' data-intercept-close aria-label='关闭'>×</button></header>
        <div class='fc-intercept-content'>
          <div class='fc-intercept-field'>
            <label>运单号</label>
            <div class='fc-intercept-waybill'><span>${escape(r.number)}</span><em>共 10 门</em></div>
          </div>
          <div class='fc-intercept-field fc-intercept-reason'>
            <label><i>*</i> 拦截原因</label>
            <div><textarea name='reason' maxlength='300' placeholder='请输入拦截原因' required></textarea><small>请输入拦截原因</small></div>
          </div>
          <div class='fc-intercept-field'>
            <label>附件</label>
            <div class='fc-intercept-upload'><label class='fc-upload-button'>点击上传<input type='file' multiple></label><span>未选择文件</span></div>
          </div>
        </div>
        <footer class='fc-intercept-footer'><button type='button' class='fc-btn' data-intercept-close>取消</button><button type='submit' class='fc-btn primary'>确认发起拦截</button></footer>
      </form>`;
      const form=detail.querySelector('form');
      const textarea=form.querySelector('textarea');
      const fileInput=form.querySelector('input[type=file]');
      const fileName=form.querySelector('.fc-intercept-upload span');
      form.querySelectorAll('[data-intercept-close]').forEach(button=>button.onclick=()=>detail.close());
      fileInput.onchange=()=>{fileName.textContent=fileInput.files.length?Array.from(fileInput.files).map(file=>file.name).join('、'):'未选择文件';};
      textarea.oninput=()=>textarea.closest('div').classList.remove('invalid');
      form.onsubmit=event=>{
        event.preventDefault();
        if(!textarea.value.trim()){textarea.closest('div').classList.add('invalid');textarea.focus();return;}
        detail.close();
        notice(`已发起海外拦截：${row[0]}`);
      };
      detail.showModal();
      setTimeout(()=>textarea.focus(),0);
    }
    function closeMoreMenu(){overlay.querySelector('.fc-more-menu')?.remove();}
    function openMoreMenu(button,rowIndex){
      closeMoreMenu();
      const rect=button.getBoundingClientRect();
      const menu=document.createElement('div');
      menu.className='fc-more-menu';
      menu.dataset.cargoRow=rowIndex;
      menu.innerHTML=`<button type='button' data-more-action='log'>日志</button><button type='button' data-more-action='intercept'>拦截</button><button type='button' data-more-action='edit'>修改</button><button type='button' data-more-action='boxes'>箱数修改</button><button type='button' data-more-action='delete'>删除</button><button type='button' data-more-action='attachment'>上传异常附件</button>`;
      overlay.append(menu);
      const height=menu.offsetHeight;
      menu.style.left=Math.min(rect.right-menu.offsetWidth,innerWidth-menu.offsetWidth-8)+'px';
      menu.style.top=(rect.bottom+height+8>innerHeight?rect.top-height-4:rect.bottom+4)+'px';
    }
    renderCargo();
    overlay.addEventListener('click',event=>{
      if(event.target===overlay||event.target.closest('[data-detail-close]')){overlay.remove();return;}
      const moreAction=event.target.closest('[data-more-action]');
      if(moreAction){
        const menu=moreAction.closest('.fc-more-menu');
        const row=cargoRows[+menu.dataset.cargoRow];
        const action=moreAction.dataset.moreAction;
        closeMoreMenu();
        if(action==='log'){dialog('操作日志',`<div class='fc-more-dialog-list'><p><b>创建预报单</b><span>2026-09-07 10:18</span></p><p>系统同步装箱数据，共 ${row[2]} 箱。</p><p><b>更新运输信息</b><span>2026-09-09 16:32</span></p><p>预计提柜时间更新为 2026-09-14。</p></div>`);return;}
        if(action==='intercept'){showOverseasIntercept(row);return;}
        if(action==='edit'){dialog('修改装箱信息',`<label>派送方式<input type='text' value='${escape(row[1])}'></label><label>目的地<input type='text' value='${escape(row[5])}'></label>`,detail=>{const inputs=detail.querySelectorAll('input');row[1]=inputs[0].value.trim()||row[1];row[5]=inputs[1].value.trim()||row[5];renderCargo();notice('装箱信息已修改');});return;}
        if(action==='boxes'){dialog('箱数修改',`<p>入仓号：${escape(row[0])}</p><label>箱数<input type='number' min='1' value='${escape(row[2])}'></label>`,detail=>{row[2]=String(Math.max(1,Number(detail.querySelector('input').value)||1));renderCargo();notice('箱数已修改');});return;}
        if(action==='delete'){dialog('删除装箱信息',`<p>确认删除入仓号 <b>${escape(row[0])}</b> 的装箱记录吗？</p>`,()=>{cargoRows.splice(cargoRows.indexOf(row),1);renderCargo();notice('装箱记录已删除');});return;}
        if(action==='attachment'){dialog('上传异常附件',`<p>入仓号：${escape(row[0])}</p><input type='file' multiple><p>支持上传图片或文档。</p>`,detail=>notice(`已选择 ${detail.querySelector('input').files.length} 个附件`));return;}
      }
      if(event.target.closest('[data-cargo-search]')){renderCargo();return;}
      if(event.target.closest('[data-cargo-reset]')){overlay.querySelector('[data-cargo-keyword]').value='';overlay.querySelector('[data-cargo-destination]').value='';renderCargo();return;}
      const toolTarget=event.target.closest('[data-detail-tool]');
      const tool=toolTarget?.dataset.detailTool;
      if(tool==='more'){openMoreMenu(toolTarget,toolTarget.dataset.cargoRow);return;}
      closeMoreMenu();
      if(tool==='export'){const csv='\ufeff入仓号,派送方式,箱数,重量/KG,体积/CBM,目的地,ShipmentID/IBR,ReferenceID\n'+cargoRows.map(row=>row.join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=r.container+'-装箱详情.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return;}
      if(tool)notice({remark:'客户备注编辑已打开',reservation:'已创建预约草稿',warehouse:'已新增入仓号草稿',settings:'表格设置已打开',route:'路由详情已打开'}[tool]||'操作已完成');
    });
    overlay.addEventListener('change',event=>{if(event.target.matches('[data-cargo-all]'))overlay.querySelectorAll('[data-cargo-check]').forEach(item=>item.checked=event.target.checked);});
    overlay.querySelector('.fc-detail-body').addEventListener('scroll',closeMoreMenu,true);
  }
  function open(){
    document.querySelector('#inventoryPage').hidden=true;
    document.querySelector('#interceptPage').hidden=true;
    document.querySelector('#navStagingInventory').classList.remove('active');
    document.querySelector('#navInterceptManagement').classList.remove('active');
    document.querySelector('#navForecast').classList.add('active');
    inbound.classList.add('expanded');
    sub.hidden=false;
    document.querySelector('#currentPageName').textContent='预报单';
    document.body.classList.add('forecast-visible');
    app.hidden=false;
    document.title='预报单 - 美仓海外仓系统';
    sessionStorage.setItem('warehouse-page','forecast');
  }
  q('form').onsubmit=e=>{e.preventDefault();search()};q('form').onreset=()=>setTimeout(search,0);
  app.addEventListener('change',e=>{if(e.target.matches('[data-check]')){const i=+e.target.dataset.check;e.target.checked?selected.add(i):selected.delete(i);render()}if(e.target.id==='fc-all'){filtered.forEach(r=>e.target.checked?selected.add(rows.indexOf(r)):selected.delete(rows.indexOf(r)));render()}});
  app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.status!==undefined){activeStatus=+b.dataset.status;app.querySelectorAll('.fc-status').forEach(x=>x.classList.toggle('active',x===b));search();return;}
    if(b.dataset.nav){const name=b.dataset.nav;if(['暂存库存','拦截管理'].includes(name)){close();sessionStorage.removeItem('warehouse-page');document.querySelector(name==='暂存库存'?'#navStagingInventory':'#navInterceptManagement').click()}else if(name!=='预报单')notice(`${name}暂无本地演示数据`);return;}
    if(b.dataset.edit){const [i,k]=b.dataset.edit.split(',').map(Number);dialog(['实际到港/火车站时间','卸船/下火车时间','实际提柜时间','拆柜时间','还空时间'][k],`<input type="date" value="${rows[i].dates[k]}">`,d=>{rows[i].dates[k]=d.querySelector('input').value;render()});return;}
    if(b.dataset.detail!==undefined){showForecastDetail(rows[+b.dataset.detail]);return;}
    if(b.dataset.upload!==undefined){dialog('上传附件','<input type="file" multiple><p>附件仅保留于本地演示页面。</p>',d=>notice(`已选择 ${d.querySelector('input').files.length} 个附件`));return;}
    if(b.dataset.more!==undefined){dialog('更多操作',`<button class="fc-btn" data-detail="${b.dataset.more}">查看预报单</button>`);return;}
    const action=b.dataset.action;if(action==='expand'){q('.fc-extra').hidden=!q('.fc-extra').hidden;b.textContent=q('.fc-extra').hidden?'⌄ 展开':'⌃ 收起'}
    else if(action==='collapse-side')document.querySelector('.menu-toggle').click();
    else if(action==='tool-5'){const csv='\ufeff客户名称,预报单号,柜号,库点数量,预计到港时间\n'+filtered.filter(r=>!selected.size||selected.has(rows.indexOf(r))).map(r=>[r.customer,r.number,r.container,r.amount,r.expected].join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='预报单.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
    else if(action==='tool-2')dialog('数据统计',`<p>当前演示记录：${filtered.length} 条</p><p>库点总数量：${filtered.reduce((n,r)=>n+r.amount,0)}</p><p>已勾选：${selected.size} 条</p>`);
    else if(action==='tool-4')notice(selected.size?`已选择 ${selected.size} 条预报单`:'请先选择预报单');
    else if(action==='settings')dialog('表格设置','<label><input type="checkbox" checked disabled> 固定操作列</label><label>行高 <select><option value="50">标准</option><option value="40">紧凑</option><option value="60">宽松</option></select></label>',d=>{app.querySelectorAll('tbody td').forEach(td=>td.style.height=d.querySelector('select').value+'px')});
    else if(action?.startsWith('tool-')||action==='export-center')notice('当前为截图还原的本地演示页面');
  });
  const inbound=[...document.querySelectorAll('.side-nav > .nav-item')].find(x=>x.textContent.includes('入库管理'));
  const sub=document.createElement('div');sub.className='nav-children';sub.hidden=true;sub.innerHTML='<button type="button" id="navForecast"><span>▤</span>预报单</button>';inbound.after(sub);inbound.addEventListener('click',()=>{sub.hidden=!sub.hidden;inbound.classList.toggle('expanded',!sub.hidden)});sub.querySelector('button').onclick=open;
  document.querySelector('#navStagingInventory').addEventListener('click',close);
  document.querySelector('#navInterceptManagement').addEventListener('click',close);
  render();open();
})();

