#!/usr/bin/env node

/**
 * Fix Template Literal Issues in Generated TTP Components
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ttpCategories = [
  'tactics-analysis',
  'techniques-mapping', 
  'procedures-intelligence',
  'threat-actor-ttp',
  'ttp-analytics'
];

function fixTemplateFile(filePath, componentName) {
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Replace template literals with actual values
    content = content.replace(/\$\{componentName\}/g, componentName);
    content = content.replace(/\\\$\{componentName\}/g, componentName);
    content = content.replace(/\$\{category\}/g, 'ttp-category');
    content = content.replace(/\\\$\{category\}/g, 'ttp-category');
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

function fixAllComponents() {
  console.log('🔧 Fixing template literal issues in TTP components...\n');
  
  let totalFixed = 0;
  
  ttpCategories.forEach(category => {
    const categoryDir = join(__dirname, 'src', 'frontend', 'views', category);
    
    try {
      const files = readdirSync(categoryDir);
      const componentFiles = files.filter(file => file.endsWith('Component.tsx'));
      
      console.log(`📁 Processing ${category}: ${componentFiles.length} components`);
      
      componentFiles.forEach(file => {
        const componentName = file.replace('Component.tsx', '');
        const filePath = join(categoryDir, file);
        
        if (fixTemplateFile(filePath, componentName)) {
          totalFixed++;
        }
      });
      
    } catch (error) {
      console.log(`❌ Error processing category ${category}: ${error.message}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} component files!`);
  return totalFixed;
}

// Run the fix
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllComponents();
}

export { fixAllComponents };