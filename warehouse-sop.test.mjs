import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const moduleOf=file=>'data:text/javascript;base64,'+Buffer.from(fs.readFileSync(new URL(file,import.meta.url),'utf8')).toString('base64');
const C=await import(moduleOf('./clearance-model.js'));
const R=await import(moduleOf('./returns-model.js'));
const A=await import(moduleOf('./warehouse-address.js'));
const F=await import(moduleOf('./returns-fields.js'));
const DAY=86400000,HOUR=3600000;
const clear=()=>{const o=C.seed()[0];o.products=o.products.slice(0,1);return o;};
function aged(days){const o=clear();C.acceptOrder(o);o.acceptedAt=o.searchAt=new Date(Math.floor(Date.now()/1000)*1000-days*DAY).toISOString();return o;}

test('acceptance starts the clock exactly once and preserves the selected warehouse',()=>{
  const o=clear();C.editWarehouse(o,C.WAREHOUSES[1]);C.acceptOrder(o);
  assert.equal(o.acceptedAt,o.searchAt);assert.ok(Number.isFinite(Date.parse(o.acceptedAt)));
  assert.equal(o.warehouse,C.WAREHOUSES[1]);assert.equal(C.clearanceProgress(o).durationText,'0 天 0 小时');
  const before=structuredClone(o);assert.throws(()=>C.acceptOrder(o),/仅待受理/);assert.deepEqual(o,before);
});
test('the 7 and 30 day reminders have exact boundaries and never terminate an order',()=>{
  const o=aged(1),start=Date.parse(o.acceptedAt);
  assert.equal(C.clearanceProgress(o,start+7*DAY-1).feedbackDue,false);
  const seven=C.clearanceProgress(o,start+7*DAY);assert.equal(seven.feedbackDue,true);assert.equal(seven.days,7);assert.equal(seven.hours,0);
  const thirty=C.clearanceProgress(o,start+30*DAY);assert.equal(thirty.limitReached,true);assert.equal(thirty.feedbackDue,false);
  assert.equal(C.clearanceProgress(o,start+8*DAY+5*HOUR).durationText,'8 天 5 小时');
  o.acceptedAt=o.searchAt=new Date(Date.now()-31*DAY).toISOString();const before=structuredClone(o);
  C.refresh(o);assert.equal(o.status,'寻找买家中');assert.deepEqual(o,before);
  assert.equal(C.can(o,'quote'),false);assert.equal(C.can(o,'terminate'),true);
  C.recordReminder(o,'电话告知到期，等待客户回复');assert.ok(o.remindedAt);assert.equal(o.reminderCount,1);
  assert.equal(o.status,'寻找买家中');assert.match(o.logs[0].note,/31 天/);
});
test('client consent and reminders retain the original acceptance and search start',()=>{
  const o=aged(8),start=o.acceptedAt;
  C.recordReminder(o,'微信已联系，暂未回复');assert.equal(o.status,'寻找买家中');assert.equal(C.clearanceProgress(o).feedbackDue,true);
  const before=structuredClone(o);assert.throws(()=>C.extend(o,false),/同意/);assert.deepEqual(o,before);
  C.extend(o,true,'客户明确同意继续');assert.equal(o.acceptedAt,start);assert.equal(o.searchAt,start);assert.equal(o.extended,true);
  assert.equal(C.clearanceProgress(o).feedbackDue,false);assert.equal(o.consentNote,'客户明确同意继续');
  o.searchAt=o.acceptedAt=new Date(Date.now()-30*DAY).toISOString();assert.equal(C.clearanceProgress(o).limitReached,true);
  assert.throws(()=>C.extend(o,true),/当前状态/);assert.equal(o.status,'寻找买家中');
});
test('manual termination freezes duration and leaves all physical stock intact',()=>{
  const o=aged(12),p=o.products[0];p.received=50;o.receipts=[{product:p.id,quantity:50,time:'2026-10-01T09:00'}];
  const physical=structuredClone({products:o.products,receipts:o.receipts});C.terminate(o,'客户选择停止寻找');
  assert.ok(o.closedAt);assert.equal(o.status,'已终止');assert.equal(C.stock(p),50);assert.deepEqual({products:o.products,receipts:o.receipts},physical);
  const end=Date.parse(o.closedAt),clock=C.clearanceProgress(o,end);assert.equal(C.clearanceProgress(o,end+100*DAY).durationText,clock.durationText);
  assert.equal(clock.days,12);assert.equal(C.clearanceProgress(o).limitReached,false);
});
test('historical acceptance is recovered without inventing an unknown closing time',()=>{
  const o=aged(10);delete o.acceptedAt;const m=C.migrate([o])[0];assert.equal(m.acceptedAt,o.searchAt);
  assert.equal(C.migrate([m])[0].acceptedAt,o.searchAt);
  m.status='已终止';delete m.closedAt;const closed=C.migrate([m])[0];
  assert.equal(C.clearanceProgress(closed).hasMissingEndTime,true);assert.equal(C.clearanceProgress(closed).durationText,'结束时间待补录');
  const logOnly=clear();logOnly.status='寻找买家中';logOnly.logs.unshift({action:'受理申请',time:'2026-10-01 08:00:00'});
  assert.equal(C.migrate([logOnly])[0].acceptedAt,'2026-10-01 08:00:00');
});
test('warehouse corrections retain inventory, actual timestamps and instruction state',()=>{
  for(const o of [C.seed()[4],C.seed()[5],C.seed()[6]]){
    const before=structuredClone({products:o.products,receipts:o.receipts,deliveries:o.deliveries,quotes:o.quotes,status:o.status,acceptedAt:o.acceptedAt});
    C.editWarehouse(o,C.WAREHOUSES.find(w=>w!==o.warehouse));
    assert.deepEqual({products:o.products,receipts:o.receipts,deliveries:o.deliveries,quotes:o.quotes,status:o.status,acceptedAt:o.acceptedAt},before);
    assert.equal(o.logs[0].action,'修改清货仓库');
  }
  for(const o of R.seed().filter(o=>['待认领','处理中','已完成','已关闭'].includes(o.status))){
    const before=structuredClone({boxes:o.boxes,receipts:o.receipts,instructions:o.instructions,status:o.status});
    R.editWarehouse(o,R.WAREHOUSES.find(w=>w!==o.warehouse));
    assert.deepEqual({boxes:o.boxes,receipts:o.receipts,instructions:o.instructions,status:o.status},before);
  }
});
test('warehouse address selection reads persistent shared data and clears stale addresses',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  A.saveWarehouseAddress(C.WAREHOUSES[0],'  123 Test Ave\nCA 90000  ',storage);
  A.saveWarehouseAddress(R.WAREHOUSES[1],'456 Sample St, IL',storage);
  assert.equal(A.warehouseAddress(C.WAREHOUSES[0],storage),'123 Test Ave\nCA 90000');
  assert.equal(A.warehouseAddress(R.WAREHOUSES[1],storage),'456 Sample St, IL');
  const form={elements:{warehouse:{value:C.WAREHOUSES[0]},warehouseAddress:{value:'旧地址'}}};A.syncWarehouseAddress(form,storage);
  assert.equal(form.elements.warehouseAddress.value,'123 Test Ave\nCA 90000');form.elements.warehouse.value=C.WAREHOUSES[2];A.syncWarehouseAddress(form,storage);assert.equal(form.elements.warehouseAddress.value,'');
  assert.throws(()=>A.saveWarehouseAddress('','地址',storage),/选择仓库/);assert.throws(()=>A.saveWarehouseAddress(C.WAREHOUSES[0],'',storage),/填写仓库地址/);
  assert.throws(()=>A.saveWarehouseAddress(C.WAREHOUSES[0],'A'.repeat(501),storage),/500/);
});
test('unforecasted goods register directly as unclaimed real boxes with private photos',()=>{
  const o=R.registerUnclaimedReturn({warehouse:R.WAREHOUSES[0],time:'2026-10-08T10:30',boxes:3,confirmed:true,description:'外箱标签无法识别',tracking:'',image:'data:image/png;base64,PRIVATE'});
  assert.equal(o.status,'待认领');assert.equal(o.registrationType,'unforecasted');assert.equal(o.customer,'');
  assert.equal(o.packages[0].forecast,null);assert.equal(o.packages[0].tracking,'');assert.equal(o.products.length,0);
  assert.deepEqual([R.totals(o).inStock,R.totals(o).available,R.totals(o).receivedUnknown],[3,0,true]);
  assert.ok(o.boxes.every(b=>b.receivedAt==='2026-10-08 10:30:00'&&!b.claimed&&!b.counted&&!b.outboundAt));
  assert.equal(o.receipts[0].imageVisibility,'warehouse');assert.equal(R.receiptImage(o.receipts[0]),'');assert.equal(R.receiptImage(o.receipts[0],'customer'),'');assert.equal(R.receiptImage(o.receipts[0],'warehouse'),o.receipts[0].image);
  const grid=F.exportProductGrid([o]);assert.ok(!JSON.stringify(grid).includes('PRIVATE'));
  assert.equal(grid[1][grid[0].indexOf('到仓时间')],'2026-10-08 10:30:00');assert.equal(grid[1][grid[0].indexOf('预报产品数量(个)')],'未预报');
  assert.throws(()=>R.registerUnclaimedReturn({warehouse:R.WAREHOUSES[0],time:'2026-10-08T10:30',boxes:3,confirmed:false}),/实际到达/);
  const c=R.CLIENTS[0];R.claim(o,{boxIds:o.boxes.map(b=>b.id),customer:c.name,customerCode:c.code});assert.equal(o.status,'待指令');assert.equal(R.totals(o).available,3);
});
test('only real physical outbound adds departure time and invalid backfill is atomic',()=>{
  const o=R.seed().find(o=>o.id.endsWith('0009')),first=o.boxes[0],second=structuredClone(o.boxes[1]);
  const i=R.instruct(o,{type:'发货计划',boxIds:[first.id],note:'寄回'});R.syncInstruction(o,i.id,'指令处理完成、待出库');
  assert.equal(first.outboundAt,'');assert.equal(R.totals(o).inStock,2);
  const before=structuredClone(o);assert.throws(()=>R.syncInstruction(o,i.id,'已出库',{outboundAt:'2026-10-07T10:00'}),/早于/);assert.deepEqual(o,before);
  R.syncInstruction(o,i.id,'已出库',{outboundAt:'2026-10-09T12:00'});assert.equal(first.outboundAt,'2026-10-09 12:00:00');assert.equal(i.outboundAt,first.outboundAt);assert.deepEqual(o.boxes[1],second);
  const out=structuredClone(o);assert.throws(()=>R.updateOutboundTime(o,i.id,'2026-10-07T12:00'),/早于/);assert.deepEqual(o,out);
  R.updateOutboundTime(o,i.id,'2026-10-10T13:00');assert.equal(first.outboundAt,'2026-10-10 13:00:00');assert.equal(R.totals(o).inStock,1);
  const s=R.instruct(o,{type:'库内增值服务',boxIds:[o.boxes[1].id],note:'换标'});R.syncInstruction(o,s.id,'指令处理完成');assert.equal(o.boxes[1].outboundAt,'');assert.equal(R.totals(o).inStock,1);
  assert.throws(()=>R.updateOutboundTime(o,s.id,'2026-10-10T13:00'),/已实际/);
  const grid=F.exportProductGrid([o]);assert.equal(grid[0].at(-1),'出仓时间');assert.equal(grid[1].at(-1),'2026-10-10 13:00:00');
});
