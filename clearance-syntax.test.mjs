import fs from 'node:fs';
import vm from 'node:vm';
for(const file of ['clearance.js','clearance-model.js','clearance-import.js','clearance-fields.js','clearance-arrival.js','clearance-edit.js','clearance-edit-arrival.js']){
  new vm.SourceTextModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
}
console.log('All clearance browser modules parsed successfully.');
