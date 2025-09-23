#!/usr/bin/env ts-node

/**
 * Import Path Migration Script
 * Automatically converts relative imports to centralized path aliases
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================================
// MIGRATION RULES
// ============================================================================

const MIGRATION_RULES = [
  // Core business logic imports
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/core['"`]/g,
    replacement: "from '@/core'"
  },
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/core-logic\/types\/business-logic\.types['"`]/g,
    replacement: "from '@/core'"
  },

  // Phantom ML Core
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/phantom-ml-core['"`]/g,
    replacement: "from '@/lib/phantom-ml-core'"
  },
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/core-logic\/phantom-ml-core['"`]/g,
    replacement: "from '@/lib/phantom-ml-core'"
  },

  // API clients
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/api\/([^'"`]+)['"`]/g,
    replacement: "from '@/api/$1'"
  },

  // Monitoring services
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/monitoring\/([^'"`]+)['"`]/g,
    replacement: "from '@/monitoring/$1'"
  },

  // Caching services
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/caching\/([^'"`]+)['"`]/g,
    replacement: "from '@/caching/$1'"
  },

  // Analytics services
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/analytics\/([^'"`]+)['"`]/g,
    replacement: "from '@/analytics/$1'"
  },

  // Security services
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/security\/([^'"`]+)['"`]/g,
    replacement: "from '@/security/$1'"
  },

  // Models
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/models\/([^'"`]+)['"`]/g,
    replacement: "from '@/models/$1'"
  },

  // Type definitions
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/([^\/]+)\.types['"`]/g,
    replacement: "from '@/lib/$1.types'"
  },

  // Model builder types
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/lib\/model-builder\/([^'"`]+)['"`]/g,
    replacement: "from '@/lib/model-builder/$1'"
  },

  // Component imports (for main directory)
  {
    pattern: /from ['"`]\.\.\/\.\.\/\.\.\/components\/dashboards\/([^'"`]+)['"`]/g,
    replacement: "from '@/components/dashboards/$1'"
  },

  // Theme imports
  {
    pattern: /from ['"`]\.\.\/src\/theme\/theme['"`]/g,
    replacement: "from '@/theme/theme'"
  },

  // Two-level relative imports
  {
    pattern: /from ['"`]\.\.\/\.\.\/lib\/([^'"`]+)['"`]/g,
    replacement: "from '@/lib/$1'"
  },

  // One-level relative imports to lib
  {
    pattern: /from ['"`]\.\.\/lib\/([^'"`]+)['"`]/g,
    replacement: "from '@/lib/$1'"
  }
];

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Process a single file to migrate its imports
 */
function processFile(filePath: string): { changed: boolean; migrations: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  const migrations: string[] = [];

  MIGRATION_RULES.forEach(rule => {
    const matches = content.match(rule.pattern);
    if (matches) {
      matches.forEach(match => {
        migrations.push(`${match} -> ${match.replace(rule.pattern, rule.replacement)}`);
      });
      newContent = newContent.replace(rule.pattern, rule.replacement);
    }
  });

  const changed = content !== newContent;

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return { changed, migrations };
}

/**
 * Get all TypeScript/JavaScript files to process
 */
async function getFilesToProcess(): Promise<string[]> {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx',
    '!src/**/*.d.ts'
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
    });
    files.push(...matches);
  }

  return [...new Set(files)]; // Remove duplicates
}

// ============================================================================
// REPORTING
// ============================================================================

interface MigrationReport {
  totalFiles: number;
  changedFiles: number;
  totalMigrations: number;
  fileResults: Array<{
    file: string;
    changed: boolean;
    migrationCount: number;
    migrations: string[];
  }>;
}

/**
 * Generate a detailed migration report
 */
function generateReport(results: Array<{ file: string; changed: boolean; migrations: string[] }>): MigrationReport {
  const report: MigrationReport = {
    totalFiles: results.length,
    changedFiles: results.filter(r => r.changed).length,
    totalMigrations: results.reduce((sum, r) => sum + r.migrations.length, 0),
    fileResults: results.map(r => ({
      file: r.file,
      changed: r.changed,
      migrationCount: r.migrations.length,
      migrations: r.migrations
    }))
  };

  return report;
}

/**
 * Print the migration report
 */
function printReport(report: MigrationReport): void {
  console.log('\n🔄 Import Migration Report');
  console.log('='.repeat(50));
  console.log(`📁 Total files processed: ${report.totalFiles}`);
  console.log(`✅ Files changed: ${report.changedFiles}`);
  console.log(`🔀 Total migrations: ${report.totalMigrations}`);

  if (report.changedFiles > 0) {
    console.log('\n📋 Changed Files:');
    report.fileResults
      .filter(r => r.changed)
      .forEach(result => {
        console.log(`\n📄 ${result.file} (${result.migrationCount} migrations)`);
        result.migrations.forEach(migration => {
          console.log(`   ${migration}`);
        });
      });
  }

  if (report.totalMigrations === 0) {
    console.log('\n🎉 No migrations needed - all imports are already using centralized paths!');
  } else {
    console.log(`\n✨ Successfully migrated ${report.totalMigrations} imports to use centralized paths!`);
  }
}

// ============================================================================
// DRY RUN FUNCTIONALITY
// ============================================================================

/**
 * Run migration in dry-run mode (preview only)
 */
async function dryRun(): Promise<MigrationReport> {
  const files = await getFilesToProcess();
  const results: Array<{ file: string; changed: boolean; migrations: string[] }> = [];

  console.log('🔍 Running dry-run migration...');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let hasChanges = false;
    const migrations: string[] = [];

    MIGRATION_RULES.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        hasChanges = true;
        matches.forEach(match => {
          migrations.push(`${match} -> ${match.replace(rule.pattern, rule.replacement)}`);
        });
      }
    });

    results.push({
      file,
      changed: hasChanges,
      migrations
    });
  }

  return generateReport(results);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');

  console.log('🚀 Import Path Migration Tool');
  console.log('==============================');

  if (isDryRun) {
    console.log('🔍 Running in DRY-RUN mode (no files will be changed)');
    const report = await dryRun();
    printReport(report);
    return;
  }

  console.log('⚠️  This will modify your files. Make sure you have committed your changes!');
  console.log('💡 Use --dry-run to preview changes first.\n');

  const files = await getFilesToProcess();
  const results: Array<{ file: string; changed: boolean; migrations: string[] }> = [];

  console.log(`📁 Processing ${files.length} files...`);

  for (const file of files) {
    try {
      const result = processFile(file);
      results.push({
        file,
        changed: result.changed,
        migrations: result.migrations
      });

      if (result.changed) {
        console.log(`✅ ${file} (${result.migrations.length} migrations)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  const report = generateReport(results);
  printReport(report);
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { processFile, getFilesToProcess, generateReport, dryRun, MIGRATION_RULES };