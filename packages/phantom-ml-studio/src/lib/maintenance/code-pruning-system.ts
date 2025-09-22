/**
 * AUTOMATED CODE PRUNING SYSTEM
 * Removes unused code and maintains clean codebase (SQ.48)
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface UnusedCode {
  type: 'import' | 'export' | 'function' | 'interface' | 'class' | 'variable';
  file: string;
  line: number;
  name: string;
  reason: string;
}

export interface PruningReport {
  analysisDate: Date;
  filesAnalyzed: number;
  unusedItems: UnusedCode[];
  potentialSavings: {
    lines: number;
    files: number;
    size: number; // in bytes
  };
  recommendations: string[];
}

/**
 * Code Pruning and Analysis System
 * SQ.48: Automated detection and removal of unused code
 */
export class CodePruningSystem {
  private projectRoot: string;
  private excludePatterns: string[];
  private includePatterns: string[];

  constructor(
    projectRoot: string = process.cwd(),
    includePatterns: string[] = ['src/**/*.ts', 'src/**/*.tsx'],
    excludePatterns: string[] = ['node_modules/**', '*.test.ts', '*.spec.ts', 'dist/**']
  ) {
    this.projectRoot = projectRoot;
    this.includePatterns = includePatterns;
    this.excludePatterns = excludePatterns;
  }

  /**
   * Analyze entire codebase for unused code
   */
  async analyzeCodebase(): Promise<PruningReport> {
    console.log('🔍 Analyzing codebase for unused code...');
    
    const files = await this.getSourceFiles();
    const unusedItems: UnusedCode[] = [];
    let totalLines = 0;
    let totalSize = 0;

    // Build dependency graph
    const dependencyGraph = await this.buildDependencyGraph(files);
    
    // Analyze each file
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const stats = await fs.stat(file);
        totalSize += stats.size;
        totalLines += content.split('\n').length;

        // Find unused imports
        const unusedImports = await this.findUnusedImports(file, content, dependencyGraph);
        unusedItems.push(...unusedImports);

        // Find unused exports
        const unusedExports = await this.findUnusedExports(file, content, dependencyGraph);
        unusedItems.push(...unusedExports);

        // Find unused functions/classes
        const unusedDefinitions = await this.findUnusedDefinitions(file, content, dependencyGraph);
        unusedItems.push(...unusedDefinitions);

        // Find unused variables
        const unusedVariables = await this.findUnusedVariables(file, content);
        unusedItems.push(...unusedVariables);

      } catch (error) {
        console.warn(`⚠️  Could not analyze ${file}:`, error);
      }
    }

    // Calculate potential savings
    const potentialSavings = {
      lines: unusedItems.length * 2, // Estimate 2 lines per unused item
      files: new Set(unusedItems.map(item => item.file)).size,
      size: Math.floor(totalSize * 0.05) // Estimate 5% size reduction
    };

    const recommendations = this.generateRecommendations(unusedItems, files.length);

    console.log(`✅ Analysis complete: Found ${unusedItems.length} unused items in ${files.length} files`);

    return {
      analysisDate: new Date(),
      filesAnalyzed: files.length,
      unusedItems,
      potentialSavings,
      recommendations
    };
  }

  /**
   * Get all source files matching patterns
   */
  private async getSourceFiles(): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of this.includePatterns) {
      const files = await glob(pattern, {
        cwd: this.projectRoot,
        absolute: true,
        ignore: this.excludePatterns
      });
      allFiles.push(...files);
    }
    
    return [...new Set(allFiles)].sort();
  }

  /**
   * Build dependency graph of the entire codebase
   */
  private async buildDependencyGraph(files: string[]): Promise<Map<string, Set<string>>> {
    const graph = new Map<string, Set<string>>();
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const dependencies = this.extractDependencies(content, file);
        graph.set(file, dependencies);
      } catch (error) {
        graph.set(file, new Set());
      }
    }
    
    return graph;
  }

  /**
   * Extract dependencies from file content
   */
  private extractDependencies(content: string, currentFile: string): Set<string> {
    const dependencies = new Set<string>();
    
    // Extract imports
    const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Resolve relative imports to absolute paths
      if (importPath.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(currentFile), importPath);
        dependencies.add(resolvedPath + '.ts'); // Assume .ts extension
      } else {
        dependencies.add(importPath);
      }
    }
    
    // Extract dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }
    
    return dependencies;
  }

  /**
   * Find unused imports in a file
   */
  private async findUnusedImports(file: string, content: string, graph: Map<string, Set<string>>): Promise<UnusedCode[]> {
    const unused: UnusedCode[] = [];
    const lines = content.split('\n');
    
    // Extract all imports
    const importRegex = /^import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"];?/gm;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const namedImports = match[1];
      const defaultImport = match[2];
      const namespaceImport = match[3];
      const fromModule = match[4];
      
      if (namedImports) {
        // Check named imports
        const imports = namedImports.split(',').map(imp => imp.trim());
        for (const importName of imports) {
          if (!this.isIdentifierUsed(content, importName)) {
            unused.push({
              type: 'import',
              file,
              line: lineNumber,
              name: importName,
              reason: `Named import '${importName}' from '${fromModule}' is never used`
            });
          }
        }
      }
      
      if (defaultImport && !this.isIdentifierUsed(content, defaultImport)) {
        unused.push({
          type: 'import',
          file,
          line: lineNumber,
          name: defaultImport,
          reason: `Default import '${defaultImport}' from '${fromModule}' is never used`
        });
      }
      
      if (namespaceImport && !this.isIdentifierUsed(content, namespaceImport)) {
        unused.push({
          type: 'import',
          file,
          line: lineNumber,
          name: namespaceImport,
          reason: `Namespace import '${namespaceImport}' from '${fromModule}' is never used`
        });
      }
    }
    
    return unused;
  }

  /**
   * Find unused exports in a file
   */
  private async findUnusedExports(file: string, content: string, graph: Map<string, Set<string>>): Promise<UnusedCode[]> {
    const unused: UnusedCode[] = [];
    
    // Find all exports
    const exportRegex = /^export\s+(?:(?:const|let|var|function|class|interface|type)\s+)?(\w+)/gm;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const exportName = match[1];
      
      // Check if this export is imported anywhere
      const isUsed = this.isExportUsed(file, exportName, graph);
      
      if (!isUsed) {
        unused.push({
          type: 'export',
          file,
          line: lineNumber,
          name: exportName,
          reason: `Export '${exportName}' is never imported by other files`
        });
      }
    }
    
    return unused;
  }

  /**
   * Find unused function and class definitions
   */
  private async findUnusedDefinitions(file: string, content: string, graph: Map<string, Set<string>>): Promise<UnusedCode[]> {
    const unused: UnusedCode[] = [];
    
    // Find functions
    const functionRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const functionName = match[1];
      
      if (!this.isIdentifierUsed(content, functionName) && !this.isExportUsed(file, functionName, graph)) {
        unused.push({
          type: 'function',
          file,
          line: lineNumber,
          name: functionName,
          reason: `Function '${functionName}' is defined but never used`
        });
      }
    }
    
    // Find classes
    const classRegex = /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/gm;
    while ((match = classRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const className = match[1];
      
      if (!this.isIdentifierUsed(content, className) && !this.isExportUsed(file, className, graph)) {
        unused.push({
          type: 'class',
          file,
          line: lineNumber,
          name: className,
          reason: `Class '${className}' is defined but never used`
        });
      }
    }
    
    // Find interfaces
    const interfaceRegex = /^(?:export\s+)?interface\s+(\w+)/gm;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const interfaceName = match[1];
      
      if (!this.isIdentifierUsed(content, interfaceName) && !this.isExportUsed(file, interfaceName, graph)) {
        unused.push({
          type: 'interface',
          file,
          line: lineNumber,
          name: interfaceName,
          reason: `Interface '${interfaceName}' is defined but never used`
        });
      }
    }
    
    return unused;
  }

  /**
   * Find unused variables
   */
  private async findUnusedVariables(file: string, content: string): Promise<UnusedCode[]> {
    const unused: UnusedCode[] = [];
    
    // Find variable declarations
    const varRegex = /^(?:const|let|var)\s+(\w+)/gm;
    let match;
    
    while ((match = varRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const varName = match[1];
      
      // Count occurrences (should be more than 1 if used)
      const occurrences = (content.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      
      if (occurrences === 1) {
        unused.push({
          type: 'variable',
          file,
          line: lineNumber,
          name: varName,
          reason: `Variable '${varName}' is declared but never used`
        });
      }
    }
    
    return unused;
  }

  /**
   * Check if an identifier is used in the content
   */
  private isIdentifierUsed(content: string, identifier: string): boolean {
    // Remove the import/export line itself from consideration
    const withoutImportExport = content.replace(
      new RegExp(`^(?:import|export).*?${identifier}.*?$`, 'gm'),
      ''
    );
    
    // Check for usage
    const regex = new RegExp(`\\b${identifier}\\b`, 'g');
    const matches = withoutImportExport.match(regex);
    
    return matches && matches.length > 0;
  }

  /**
   * Check if an export is used by other files
   */
  private isExportUsed(exportingFile: string, exportName: string, graph: Map<string, Set<string>>): boolean {
    for (const [file, dependencies] of graph) {
      if (file === exportingFile) continue;
      
      // Check if this file imports the exporting file
      const importsExportingFile = Array.from(dependencies).some(dep => 
        dep.includes(path.basename(exportingFile, '.ts'))
      );
      
      if (importsExportingFile) {
        // Check file content for usage of the export
        try {
          const content = require('fs').readFileSync(file, 'utf-8');
          if (this.isIdentifierUsed(content, exportName)) {
            return true;
          }
        } catch (error) {
          // Ignore file read errors
        }
      }
    }
    
    return false;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(unusedItems: UnusedCode[], totalFiles: number): string[] {
    const recommendations: string[] = [];
    
    const importCount = unusedItems.filter(item => item.type === 'import').length;
    const exportCount = unusedItems.filter(item => item.type === 'export').length;
    const functionCount = unusedItems.filter(item => item.type === 'function').length;
    const classCount = unusedItems.filter(item => item.type === 'class').length;
    const interfaceCount = unusedItems.filter(item => item.type === 'interface').length;
    const variableCount = unusedItems.filter(item => item.type === 'variable').length;
    
    if (importCount > 0) {
      recommendations.push(`Remove ${importCount} unused imports to reduce bundle size`);
    }
    
    if (exportCount > 5) {
      recommendations.push(`Consider removing ${exportCount} unused exports or check if they should be internal-only`);
    }
    
    if (functionCount > 0) {
      recommendations.push(`Remove ${functionCount} unused functions to reduce code complexity`);
    }
    
    if (classCount > 0) {
      recommendations.push(`Remove ${classCount} unused classes to improve maintainability`);
    }
    
    if (interfaceCount > 0) {
      recommendations.push(`Remove ${interfaceCount} unused interfaces to clean up type definitions`);
    }
    
    if (variableCount > 10) {
      recommendations.push(`Remove ${variableCount} unused variables (some may be false positives in complex scopes)`);
    }
    
    if (unusedItems.length === 0) {
      recommendations.push('Excellent! No unused code detected in the analyzed files');
    } else if (unusedItems.length < totalFiles * 0.1) {
      recommendations.push('Good code hygiene! Only minor cleanup needed');
    } else {
      recommendations.push('Consider implementing regular code reviews to prevent unused code accumulation');
    }
    
    return recommendations;
  }

  /**
   * Automatically prune safe-to-remove unused code
   */
  async autoPrune(dryRun: boolean = true): Promise<{ removed: UnusedCode[]; skipped: UnusedCode[] }> {
    const report = await this.analyzeCodebase();
    const removed: UnusedCode[] = [];
    const skipped: UnusedCode[] = [];
    
    console.log(`🧹 ${dryRun ? 'Simulating' : 'Executing'} automatic code pruning...`);
    
    for (const item of report.unusedItems) {
      // Only auto-remove safe items
      if (this.isSafeToAutoRemove(item)) {
        if (!dryRun) {
          await this.removeUnusedCode(item);
        }
        removed.push(item);
      } else {
        skipped.push(item);
      }
    }
    
    console.log(`✅ Auto-pruning complete: ${removed.length} items ${dryRun ? 'would be' : ''} removed, ${skipped.length} skipped`);
    
    return { removed, skipped };
  }

  /**
   * Check if an unused code item is safe to auto-remove
   */
  private isSafeToAutoRemove(item: UnusedCode): boolean {
    // Only auto-remove unused imports and variables
    // Exports, functions, classes, and interfaces require manual review
    return item.type === 'import' || item.type === 'variable';
  }

  /**
   * Remove unused code item from file
   */
  private async removeUnusedCode(item: UnusedCode): Promise<void> {
    try {
      const content = await fs.readFile(item.file, 'utf-8');
      const lines = content.split('\n');
      
      if (item.type === 'import') {
        // Remove entire import line
        lines.splice(item.line - 1, 1);
      } else if (item.type === 'variable') {
        // Remove variable declaration line
        lines.splice(item.line - 1, 1);
      }
      
      await fs.writeFile(item.file, lines.join('\n'));
      console.log(`✅ Removed unused ${item.type} '${item.name}' from ${path.basename(item.file)}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${item.type} '${item.name}' from ${item.file}:`, error);
    }
  }

  /**
   * Generate detailed pruning report
   */
  async generateReport(outputPath?: string): Promise<string> {
    const report = await this.analyzeCodebase();
    
    const reportContent = `# Code Pruning Analysis Report
Generated: ${report.analysisDate.toISOString()}

## Summary
- **Files Analyzed**: ${report.filesAnalyzed}
- **Unused Items Found**: ${report.unusedItems.length}
- **Potential Savings**: ${report.potentialSavings.lines} lines, ${(report.potentialSavings.size / 1024).toFixed(1)}KB

## Breakdown by Type
${this.generateBreakdownTable(report.unusedItems)}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Detailed Findings

${report.unusedItems.map(item => `### ${item.type.toUpperCase()}: ${item.name}
- **File**: ${path.relative(this.projectRoot, item.file)}
- **Line**: ${item.line}
- **Reason**: ${item.reason}
`).join('\n')}

## Files with Most Issues
${this.getFilesWithMostIssues(report.unusedItems)}
`;

    if (outputPath) {
      await fs.writeFile(outputPath, reportContent);
      console.log(`📊 Report saved to ${outputPath}`);
    }
    
    return reportContent;
  }

  private generateBreakdownTable(items: UnusedCode[]): string {
    const breakdown = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .map(([type, count]) => `| ${type.charAt(0).toUpperCase() + type.slice(1)} | ${count} |`)
      .join('\n');
  }

  private getFilesWithMostIssues(items: UnusedCode[]): string {
    const fileIssues = items.reduce((acc, item) => {
      const file = path.relative(this.projectRoot, item.file);
      acc[file] = (acc[file] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(fileIssues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([file, count]) => `- **${file}**: ${count} issues`)
      .join('\n');
  }
}

/**
 * Code Pruning CLI
 */
export class CodePruningCLI {
  private system: CodePruningSystem;

  constructor(projectRoot?: string) {
    this.system = new CodePruningSystem(projectRoot);
  }

  async analyze(): Promise<void> {
    const report = await this.system.analyzeCodebase();
    console.log(`\n📊 Code Analysis Results:`);
    console.log(`Files analyzed: ${report.filesAnalyzed}`);
    console.log(`Unused items: ${report.unusedItems.length}`);
    console.log(`Potential savings: ${report.potentialSavings.lines} lines, ${(report.potentialSavings.size / 1024).toFixed(1)}KB`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  async prune(dryRun: boolean = true): Promise<void> {
    const result = await this.system.autoPrune(dryRun);
    console.log(`\n🧹 Pruning Results:`);
    console.log(`Items ${dryRun ? 'to be' : ''} removed: ${result.removed.length}`);
    console.log(`Items requiring manual review: ${result.skipped.length}`);
  }

  async report(outputPath: string): Promise<void> {
    await this.system.generateReport(outputPath);
    console.log(`📊 Detailed report generated: ${outputPath}`);
  }
}

// Export singleton
export const codePruningSystem = new CodePruningSystem();
export const codePruningCLI = new CodePruningCLI();
