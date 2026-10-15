import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./script.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
function harness() {
  const nodes = new Map(), handlers = new Map();
  const row = { applicationNo: 'APP-1', status: '待审批', instructions: [] };
  const other = { applicationNo: 'APP-2', instructions: [] };
  const context = vm.createContext({
    activeReleaseRow: row, instructionWorkflowRows: [[row, other]],
    instructionRowsByInventory: new Map([['APP-1', []]]), instructionCatalog: [],
    instructionDraftRows: [], editingInstructionCode: '', deletingInstructionCode: '',
    $: id => {
      if (!nodes.has(id)) nodes.set(id, { value: '', hidden: false, addEventListener: (event, fn) => handlers.set(`${id}:${event}`, fn) });
      return nodes.get(id);
    },
    renderInstructionList() {}, renderRows() {}, closeInstructionPicker() {},
    formatLocalDateTime: () => '2026-10-14 12:00:00',
    window: { alert: message => { throw new Error(message); } }, URL,
  });
  for (const name of ['getInstructionDetailKey', 'buildInstructionText', 'syncInstructionDetails', 'getInstructionDraftOriginalAmount', 'getInstructionDraftCnyAmount']) {
    vm.runInContext(source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))[0], context);
  }
  vm.runInContext('function getActiveInstructionRows() { return instructionRowsByInventory.get(getInstructionDetailKey(activeReleaseRow)); }', context);
  for (const [id, event] of [['instructionConfirm', 'click'], ['instructionEditForm', 'submit'], ['instructionDeleteCancel', 'click'], ['instructionDeleteConfirm', 'click']]) {
    const start = source.indexOf(`$("#${id}").addEventListener("${event}",`);
    const end = source.indexOf('\n});', start) + 4;
    vm.runInContext(source.slice(start, end), context);
  }
  return { context, row, other, nodes, fire: (id, event = 'click') => handlers.get(`#${id}:${event}`)({ preventDefault() {}, currentTarget: { reportValidity: () => true } }) };
}

test('待审批指令新增、编辑及删除同步列表且不影响其它申请', () => {
  const { context: c, row, other, nodes, fire } = harness();
  c.instructionDraftRows = [{ chargeDate: '2026-10-14T12:00', feeName: '贴标', price: '5', quantity: '2', exchangeRate: '7', currency: 'USD', unit: '箱', description: '' }];
  fire('instructionConfirm');
  let detail = c.instructionRowsByInventory.get('APP-1')[0];
  assert.equal(row.instructions.length, 1);
  assert.equal(detail.originalAmount, 10);
  assert.equal(detail.cnyAmount, 70);
  c.editingInstructionCode = detail.code;
  for (const [field, value] of Object.entries({ Name: '换标', Type: '操作费', Unit: '箱', Price: '8', Quantity: '3', Currency: 'USD' })) {
    c.$(`#editInstruction${field}`).value = value;
  }
  fire('instructionEditForm', 'submit');
  detail = c.instructionRowsByInventory.get('APP-1')[0];
  assert.equal(detail.name, '换标');
  assert.equal(detail.originalAmount, 24);
  assert.equal(detail.cnyAmount, 168);
  assert.match(row.instructions[0].text, /24 USD 换标/);
  c.deletingInstructionCode = detail.code;
  fire('instructionDeleteCancel');
  assert.equal(row.instructions.length, 1);
  c.deletingInstructionCode = detail.code;
  fire('instructionDeleteConfirm');
  assert.equal(row.instructions.length, 0);
  assert.equal(c.instructionRowsByInventory.get('APP-1').length, 0);
  assert.equal(other.instructions.length, 0);
  assert.equal(row.status, '待审批');
});
