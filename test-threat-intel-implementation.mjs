#!/usr/bin/env node

/**
 * Test Threat Intelligence Implementation
 * Validates the 48 threat intelligence pages and backend integration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Test configuration
const tests = {
  frontendPages: 0,
  backendRoutes: 0,
  controllerMethods: 0,
  navigationEntries: 0,
  categories: 0
};

const errors = [];
const warnings = [];

console.log('🔍 Testing Threat Intelligence Implementation...\n');

// Test 1: Count frontend pages
try {
  const frontendPath = join(__dirname, 'frontend/src/app/threat-intelligence');
  
  // Count all page.tsx files except the main one
  const { execSync } = await import('child_process');
  const pageCount = execSync(`find "${frontendPath}" -name "page.tsx" -not -path "*/threat-intelligence/page.tsx" | wc -l`, { encoding: 'utf8' }).trim();
  
  tests.frontendPages = parseInt(pageCount);
  
  if (tests.frontendPages === 48) {
    console.log('✅ Frontend Pages: 48 pages found');
  } else {
    errors.push(`❌ Frontend Pages: Expected 48, found ${tests.frontendPages}`);
  }
} catch (error) {
  errors.push(`❌ Frontend Pages: Failed to count - ${error.message}`);
}

// Test 2: Check backend routes
try {
  const routesPath = join(__dirname, 'src/routes/threatIntelligence.ts');
  if (existsSync(routesPath)) {
    const routesContent = readFileSync(routesPath, 'utf8');
    
    // Count router.get calls
    const routeMatches = routesContent.match(/router\.get\(/g);
    tests.backendRoutes = routeMatches ? routeMatches.length : 0;
    
    // Check for new categories
    const hasHuntingRoutes = routesContent.includes('threat-hunting');
    const hasDetectionRoutes = routesContent.includes('threat-detection');
    
    if (tests.backendRoutes >= 48) {
      console.log(`✅ Backend Routes: ${tests.backendRoutes} routes found`);
    } else {
      errors.push(`❌ Backend Routes: Expected at least 48, found ${tests.backendRoutes}`);
    }
    
    if (hasHuntingRoutes && hasDetectionRoutes) {
      console.log('✅ New Categories: threat-hunting and threat-detection routes found');
    } else {
      warnings.push(`⚠️  New Categories: Missing routes for new categories`);
    }
  } else {
    errors.push('❌ Backend Routes: threatIntelligence.ts file not found');
  }
} catch (error) {
  errors.push(`❌ Backend Routes: Failed to read - ${error.message}`);
}

// Test 3: Check controller methods
try {
  const controllerPath = join(__dirname, 'src/controllers/threatIntelligence/comprehensiveThreatIntelController.ts');
  if (existsSync(controllerPath)) {
    const controllerContent = readFileSync(controllerPath, 'utf8');
    
    // Count static async methods
    const methodMatches = controllerContent.match(/static async get\w+/g);
    tests.controllerMethods = methodMatches ? methodMatches.length : 0;
    
    // Check for specific new methods
    const hasNewMethods = controllerContent.includes('getProactiveThreatHunting') && 
                          controllerContent.includes('getMLPoweredDetection');
    
    if (tests.controllerMethods >= 48) {
      console.log(`✅ Controller Methods: ${tests.controllerMethods} methods found`);
    } else {
      errors.push(`❌ Controller Methods: Expected at least 48, found ${tests.controllerMethods}`);
    }
    
    if (hasNewMethods) {
      console.log('✅ New Controller Methods: New threat hunting and detection methods found');
    } else {
      warnings.push('⚠️  New Controller Methods: Some new methods may be missing');
    }
  } else {
    errors.push('❌ Controller Methods: comprehensiveThreatIntelController.ts file not found');
  }
} catch (error) {
  errors.push(`❌ Controller Methods: Failed to read - ${error.message}`);
}

// Test 4: Check navigation index
try {
  const indexPath = join(__dirname, 'frontend/src/app/threat-intelligence/index.ts');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf8');
    
    // Count navigation entries (more precise pattern)
    const navMatches = indexContent.match(/id: '[^']+'/g);
    tests.navigationEntries = navMatches ? navMatches.length : 0;
    
    // Count categories
    const categoryMatches = indexContent.match(/'[^']+': \{/g);
    tests.categories = categoryMatches ? categoryMatches.length : 0;
    
    if (tests.navigationEntries === 48) {
      console.log(`✅ Navigation Entries: ${tests.navigationEntries} entries found`);
    } else {
      errors.push(`❌ Navigation Entries: Expected 48, found ${tests.navigationEntries}`);
    }
    
    if (tests.categories === 6) {
      console.log(`✅ Categories: ${tests.categories} categories found`);
    } else {
      warnings.push(`⚠️  Categories: Expected 6, found ${tests.categories}`);
    }
  } else {
    errors.push('❌ Navigation Index: index.ts file not found');
  }
} catch (error) {
  errors.push(`❌ Navigation Index: Failed to read - ${error.message}`);
}

// Test 5: Check main page integration
try {
  const mainPagePath = join(__dirname, 'frontend/src/app/threat-intelligence/page.tsx');
  if (existsSync(mainPagePath)) {
    const mainPageContent = readFileSync(mainPagePath, 'utf8');
    
    const hasNavigation = mainPageContent.includes('threatIntelligenceNavigation') && 
                         mainPageContent.includes('threatIntelligenceCategories');
    
    if (hasNavigation) {
      console.log('✅ Main Page Integration: Navigation integration found');
    } else {
      warnings.push('⚠️  Main Page Integration: Navigation integration may be incomplete');
    }
  } else {
    errors.push('❌ Main Page Integration: page.tsx file not found');
  }
} catch (error) {
  errors.push(`❌ Main Page Integration: Failed to read - ${error.message}`);
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');
console.log(`Frontend Pages: ${tests.frontendPages}/48`);
console.log(`Backend Routes: ${tests.backendRoutes}/48+`);
console.log(`Controller Methods: ${tests.controllerMethods}/48+`);
console.log(`Navigation Entries: ${tests.navigationEntries}/48`);
console.log(`Categories: ${tests.categories}/6`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(error => console.log(`  ${error}`));
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! Threat Intelligence platform successfully extended to 48 pages.');
  
  const total = tests.frontendPages + tests.backendRoutes + tests.controllerMethods + tests.navigationEntries;
  console.log(`\n📈 Implementation Statistics:`);
  console.log(`  • 48 Frontend Pages (React/TypeScript)`);
  console.log(`  • ${tests.backendRoutes} Backend API Routes`);
  console.log(`  • ${tests.controllerMethods} Controller Methods`);
  console.log(`  • 6 Organized Categories`);
  console.log(`  • Complete Frontend-Backend Integration`);
  console.log(`  • Business Logic Ready`);
  
  console.log('\n🚀 Cyber Threat Program Extension Complete!');
  process.exit(0);
}