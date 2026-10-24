import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8');

function harness() {
  const context = vm.createContext({
    formatLocalDateTime: () => '2026-10-24 12:00:00',
    escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  });
  for (const name of [
    'getInstructionProgress', 'getInstructionCount', 'renderInstructionCount', 'renderInstructionLines', 'getInstructionText',
    'parseInterceptFeeNumber', 'getInterceptFeePrice', 'getInterceptFeeQuantity', 'getInterceptFeeExchangeRate',
    'normalizeInterceptFeeRow', 'getInterceptFeeRows', 'getInterceptInstructionSummary',
    'formatInterceptInstructionFeeAmount', 'formatInterceptInstructionFeeCurrency', 'formatInterceptInstructionFee'
  ]) {
    vm.runInContext(source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))[0], context);
  }
  return context;
}

test('拦截指令数量及内容随本单指令增删、编辑和处理状态同步', () => {
  const c = harness();
  const task = { id: 1, fees: [
    { id: 'a', name: '贴标', unit: '箱', price: '5', quantity: '2', currency: 'USD', status: '待处理' },
    { id: 'b', name: '查验', price: '20', status: '已处理' }
  ] };
  const other = { id: 2, fees: [{ name: '打托', price: '10', status: '待处理' }] };
  const summary = () => c.getInterceptInstructionSummary(c.getInterceptFeeRows(task));
  assert.equal(c.getInstructionCount(summary()), '1/2');
  assert.match(c.renderInstructionLines(summary()), /待处理.*10 USD 贴标/s);
  assert.match(c.getInstructionText(summary()), /\[已处理\] 20 CNY 查验/);
  task.fees[0].status = '已处理';
  task.fees[0].completed = true;
  assert.equal(c.getInstructionCount(summary()), '2/2');
  assert.match(c.renderInstructionCount(summary()), /is-complete/);
  task.fees[0].status = '待处理';
  task.fees[0].completed = false;
  task.fees[0].name = '<换标>';
  task.fees[0].price = '8';
  assert.equal(c.getInstructionCount(summary()), '1/2');
  assert.match(c.renderInstructionLines(summary()), /16 USD &lt;换标>/);
  task.fees.push({ name: '分箱', price: '3', status: '待处理' });
  assert.equal(c.getInstructionCount(summary()), '1/3');
  task.fees.splice(1, 1);
  assert.equal(c.getInstructionCount(summary()), '0/2');
  assert.equal(c.getInstructionCount(c.getInterceptInstructionSummary(c.getInterceptFeeRows(other))), '0/1');
  task.fees = [];
  assert.equal(c.getInstructionCount(summary()), '0/0');
  assert.match(c.renderInstructionLines(summary()), /instruction-empty/);
  assert.doesNotMatch(c.renderInstructionCount(summary()), /is-complete/);
});
