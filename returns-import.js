import {TEMPLATE_FIELDS} from './returns-fields.js';
export {TEMPLATE_FIELDS};
export const TEMPLATE_URL='./退换货导入模板.xlsx?v=20261009-1';
const MAX_ROWS=500;
let loader;
const text=cell=>String(cell&&typeof cell==='object'&&'v' in cell?cell.v??'':cell??'').trim();
const value=cell=>cell&&typeof cell==='object'&&'v' in cell?cell.v:cell;
const normalize=s=>String(s).replace(/[\s*＊()（）]/g,'').toLowerCase();
const aliases=[['客户名称'],['产品名称'],['SKU'],['预报产品图片'],['预报产品数量','预报产品数量个'],['预报产品重量单个产品KG','预报产品重量','预报产品重量单个KG'],['外箱尺寸cm','外箱尺寸'],['装箱数量'],['追踪单号'],['退仓时间'],['入库时间'],['入库个数单位：个','入库个数单位:个','入库个数个','入库个数'],['入库件数单位：箱','入库件数单位:箱','入库件数箱','入库件数'],['操作要求'],['货物目前所在地']].map((list,i)=>[...list,TEMPLATE_FIELDS[i].label].map(normalize));
const empty=row=>row.every(cell=>text(cell)==='');
function number(cell,label,errors,{required=false,integer=false,positive=false}={}){
  const raw=text(cell);if(!raw){if(required)errors.push(label+'不能为空');return null;}
  const n=Number(raw);if(!Number.isFinite(n)||n<0||(positive&&n<=0)||(integer&&!Number.isSafeInteger(n)))errors.push(label+'须为'+(positive?'正':'非负')+(integer?'整数':'数字'));
  return Number.isFinite(n)?n:null;
}
function date(cell,label,errors){
  let raw=value(cell);if(raw===undefined||raw===null||raw==='')return '';
  if(typeof raw==='number')raw=new Date(Math.round((raw-25569)*86400000));
  if(Object.prototype.toString.call(raw)==='[object Date]'){
    if(!Number.isFinite(raw.getTime())){errors.push(label+'不是有效日期');return '';}
    raw=raw.toISOString().slice(0,19).replace('T',' ');
  }
  raw=String(raw).trim().replace(/\//g,'-').replace('T',' ');
  const m=/^(\d{4})-(\d{1,2})-(\d{1,2})(?: (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(raw);
  if(!m){errors.push(label+'须为有效日期，如 2026-10-09 或 2026-10-09 14:30:00');return '';}
  const parts=m.slice(1).map(v=>Number(v||0)),[y,mo,d,h,mi,s]=parts,check=new Date(Date.UTC(y,mo-1,d,h,mi,s));
  if(check.getUTCFullYear()!==y||check.getUTCMonth()!==mo-1||check.getUTCDate()!==d||h>23||mi>59||s>59){errors.push(label+'不是有效日期');return '';}
  const pad=n=>String(n).padStart(2,'0');return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
}
function image(cell,errors){
  const raw=text(cell);if(!raw)return '';
  if(/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-z\d+/=]+$/i.test(raw))return raw;
  try{const url=new URL(raw);if(!['http:','https:'].includes(url.protocol))throw Error();}catch{errors.push('预报产品图片请填写 http/https 图片链接');}
  return raw;
}
export function validateRows(grid){
  if(!Array.isArray(grid)||!grid.length)throw Error('文件为空，请填写退换货模板');
  const headerIndex=grid.findIndex((row,i)=>i<20&&aliases.every((list,col)=>list.includes(normalize(text(row[col])))));
  if(headerIndex<0)throw Error('未找到退换货模板的 15 列表头，请使用最新退换货模板，保留字段顺序');
  const rows=[];let customer='';
  for(let index=headerIndex+1;index<grid.length;index++){
    const raw=grid[index]||[];if(empty(raw))continue;
    if(/^注意[：:]/.test(text(raw[0])))break;
    if(rows.length>=MAX_ROWS)throw Error('一次最多导入 500 行产品');
    const errors=[];
    raw.forEach((cell,col)=>{if(cell&&typeof cell==='object'&&cell.f)errors.push((TEMPLATE_FIELDS[col]?.label||'额外列')+'含公式，请粘贴为值');});
    if(raw.slice(15).some(cell=>text(cell)))errors.push('存在模板之外的列');
    if(text(raw[0]))customer=text(raw[0]);
    const name=text(raw[1]),sku=text(raw[2]);if(!name)errors.push('产品名称不能为空');if(!sku)errors.push('SKU 不能为空');
    const quantity=number(raw[4],'预报产品数量',errors,{required:true,integer:true,positive:true});
    const weight=number(raw[5],'预报产品重量',errors)??0;
    const dim=text(raw[6]),dimensions=dim?dim.split(/[xX×*＊]/).map(s=>Number(s.trim())):[0,0,0];
    if(dim&&(dimensions.length!==3||dimensions.some(n=>!Number.isFinite(n)||n<0)))errors.push('外箱尺寸请填写长×宽×高，如 18×12×6');
    const product={id:`P-IMPORT-${index}-${globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)}`,name,sku,image:image(raw[3],errors),quantity,weight,dimensions,packing:number(raw[7],'装箱数量',errors,{integer:true})??0,tracking:text(raw[8]),returnedAt:date(raw[9],'退仓时间',errors),reportedReceivedAt:date(raw[10],'入库时间',errors),reportedReceived:number(raw[11],'入库个数',errors,{integer:true}),reportedBoxes:number(raw[12],'入库件数',errors,{integer:true}),requirement:text(raw[13]),location:text(raw[14])};
    rows.push({line:index+1,customer,product,errors});
  }
  if(!rows.length)throw Error('未找到产品数据，请在表头下一行开始填写，每行一个产品');
  const skus=new Map();for(const row of rows){const key=row.product.sku.toUpperCase();if(!key)continue;if(!skus.has(key))skus.set(key,[]);skus.get(key).push(row);}
  for(const group of skus.values())if(group.length>1)for(const row of group)row.errors.push('SKU 重复，请每个产品保留一行，并在追踪单号中填写多个包裹号');
  const errorCount=rows.filter(row=>row.errors.length).length;return {rows,total:rows.length,validCount:rows.length-errorCount,errorCount};
}
export function buildOrderDraft(result,base){
  if(!result?.total||result.errorCount)throw Error('请先通过全部产品行的校验');
  if(base.source==='客户预报'&&(!base.customer||!base.customerCode))throw Error('请选择归属客户');
  if(Boolean(base.customer)!==Boolean(base.customerCode))throw Error('客户名称与编码须一致');
  const mismatch=result.rows.filter(row=>row.customer&&row.customer!==base.customer);
  if(mismatch.length)throw Error(`第 ${mismatch.map(row=>row.line).join('、')} 行客户名称与页面选择不一致，请修改模板或客户选择`);
  const products=result.rows.map(row=>structuredClone(row.product)),packages=[];
  for(const p of products){
    const tracking=[...new Set(p.tracking.split(/[;；,，\n]+/).map(s=>s.trim()).filter(Boolean))];
    // A product total cannot be repeated as the forecast of every package.
    if(tracking.length>1)continue;
    for(const number of tracking){let pack=packages.find(k=>k.tracking.toLowerCase()===number.toLowerCase());if(!pack){pack={tracking:number,carrier:'其他',items:[],forecast:0,returnedAt:p.returnedAt,shipped:'',eta:'',logistics:'未发运',note:''};packages.push(pack);}pack.forecast+=p.quantity;pack.items.push({productId:p.id,quantity:p.quantity});}
  }
  return {...base,products,packages};
}
export function parseCsv(text){
  const grid=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"'){if(cell)throw Error('CSV 引号格式错误');quoted=true;}else if(c===','){row.push(cell);cell='';}else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);grid.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw Error('CSV 引号未闭合');if(cell||row.length){row.push(cell);grid.push(row);}return grid;
}
async function loadXlsx(){
  if(globalThis.XLSX)return globalThis.XLSX;
  if(!loader)loader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/xlsx.full.min.js',import.meta.url).href;script.onload=()=>globalThis.XLSX?resolve(globalThis.XLSX):reject(Error('Excel 解析器加载失败'));script.onerror=()=>{loader=null;script.remove();reject(Error('Excel 解析器加载失败，请重试'));};document.head.appendChild(script);});
  return loader;
}
export async function readImportFile(file){
  if(!file||typeof file.arrayBuffer!=='function')throw Error('请选择退换货文件');
  const ext=String(file.name).toLowerCase().split('.').pop();if(!['xlsx','csv'].includes(ext))throw Error('请上传 .xlsx 或 .csv 文件');if(file.size>10*1024*1024)throw Error('文件不能超过 10 MB');
  const buffer=await file.arrayBuffer();if(ext==='csv'){let contents;try{contents=new TextDecoder('utf-8',{fatal:true}).decode(buffer);}catch{contents=new TextDecoder('gb18030',{fatal:true}).decode(buffer);}return validateRows(parseCsv(contents.replace(/^\uFEFF/,'')));}
  const XLSX=await loadXlsx();let workbook;try{workbook=XLSX.read(buffer,{type:'array',cellDates:true,cellFormula:true});}catch{throw Error('无法读取 Excel，请确认文件有效且未加密');}
  for(const name of workbook.SheetNames.filter(name=>!/清货/.test(name))){
    const sheet=workbook.Sheets[name];if(!sheet['!ref'])continue;const range=XLSX.utils.decode_range(sheet['!ref']);if(range.e.r>20000||range.e.c>50)throw Error('工作表范围过大，请仅保留模板与有效产品行');
    const grid=[];for(let r=0;r<=range.e.r;r++){const row=[];for(let c=0;c<=Math.max(range.e.c,14);c++)row.push(sheet[XLSX.utils.encode_cell({r,c})]||'');grid.push(row);}
    try{return validateRows(grid);}catch(error){if(!error.message.startsWith('未找到退换货模板'))throw error;}
  }
  throw Error('未找到退换货预报工作表，请使用最新退换货模板');
}
