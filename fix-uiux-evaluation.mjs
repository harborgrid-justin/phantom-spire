#!/usr/bin/env node

/**
 * Fix addUIUXEvaluation calls in data management pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataManagementDir = path.join(__dirname, 'src', 'frontend', 'views', 'data-management');

// Find all .tsx files recursively
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix the addUIUXEvaluation call
function fixUIUXEvaluationCall(content, componentName, category, pageName) {
  const oldPattern = /addUIUXEvaluation\(\{[\s\S]*?\}\);/;
  const newCall = `addUIUXEvaluation('${category}-${pageName}', {
      position: 'bottom-right',
      autoStart: true,
      showScore: true
    });`;
  
  return content.replace(oldPattern, newCall);
}

// Get component info from path
function getComponentInfo(filePath) {
  const relativePath = path.relative(dataManagementDir, filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts.length === 3) { // category/ComponentName.tsx
    const category = parts[0];
    const filename = parts[1];
    const componentName = filename.replace('.tsx', '');
    const pageName = componentName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
    return { category, componentName, pageName };
  } else if (parts[0].endsWith('.tsx')) { // ComponentName.tsx
    const filename = parts[0];
    const componentName = filename.replace('.tsx', '');
    return { category: 'main', componentName, pageName: componentName.toLowerCase() };
  }
  
  return null;
}

// Process all files
const tsxFiles = findTsxFiles(dataManagementDir);
let fixedCount = 0;

for (const filePath of tsxFiles) {
  try {
    const componentInfo = getComponentInfo(filePath);
    if (!componentInfo) continue;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Only fix if it contains the problematic pattern
    if (content.includes('addUIUXEvaluation({')) {
      const fixedContent = fixUIUXEvaluationCall(
        content, 
        componentInfo.componentName, 
        componentInfo.category, 
        componentInfo.pageName
      );
      
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files!`);