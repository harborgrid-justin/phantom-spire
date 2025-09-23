#!/usr/bin/env tsx
/**
 * ARRAY DEFAULTS FIX SCRIPT
 * Fixes all @Default('[]') to @Default([]) in model files
 */
import fs from 'fs';
import path from 'path';

const modelsDir = path.join(__dirname, '..', 'src', 'lib', 'models');

function fixArrayDefaults(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace @Default('[]') with @Default([])
  const fixedContent = content.replace(/@Default\('\[\]'\)/g, '@Default([])');
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed array defaults in: ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔧 Fixing array default values in model files...');
  
  const files = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.model.ts'))
    .map(file => path.join(modelsDir, file));
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixArrayDefaults(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed array defaults in ${fixedCount} model files`);
  console.log('✅ All array fields now use proper array defaults instead of string defaults');
}

if (require.main === module) {
  main();
}
