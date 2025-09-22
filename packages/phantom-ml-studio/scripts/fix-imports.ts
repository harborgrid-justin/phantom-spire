import * as ts from 'typescript';
import { glob } from 'glob';
import * as path from 'path';
import { promises as fs } from 'fs';

async function main() {
  const projectRoot = 'C:/phantom-spire/packages/phantom-ml-studio';
  const srcDir = path.join(projectRoot, 'src');
  const files = glob.sync('**/*.ts', { cwd: srcDir });

  const program = ts.createProgram(files.map(f => path.join(srcDir, f)), {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
  });

  for (const file of files) {
    if (!file) {
      continue;
    }
    const filePath = path.join(srcDir, file);
    const sourceFile = program.getSourceFile(filePath);

    if (sourceFile) {
      const newContent = ts.transform(sourceFile, [
        (context) => {
          return (node) => {
            const visitor: ts.Visitor = (node) => {
              if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = node.moduleSpecifier.getText(sourceFile);
                const importPath = moduleSpecifier.slice(1, -1);

                if (importPath.startsWith('.')) {
                  const resolvedModule = ts.resolveModuleName(
                    importPath,
                    sourceFile.fileName,
                    program.getCompilerOptions(),
                    ts.sys
                  );

                  if (!resolvedModule.resolvedModule) {
                    if (typeof importPath === 'string') {
                      const fileName = path.basename(importPath);
                      const possibleFiles = glob.sync(`**/${fileName}.*`, { cwd: srcDir });
                      if (possibleFiles.length > 0) {
                        const correctAbsolutePath = path.join(srcDir, possibleFiles[0]);
                        let correctRelativePath = path.relative(path.dirname(filePath), correctAbsolutePath).replace(/\\/g, '/');
                        if (!correctRelativePath.startsWith('.')) {
                          correctRelativePath = './' + correctRelativePath;
                        }
                        return ts.factory.updateImportDeclaration(
                          node,
                          node.decorators,
                          node.modifiers,
                          node.importClause,
                          ts.factory.createStringLiteral(correctRelativePath)
                        );
                      }
                    }
                  }
                }
              }
              return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(node, visitor);
          };
        },
      ]);
      const printer = ts.createPrinter();
      const updatedContent = printer.printFile(newContent.transformed[0]);
      await fs.writeFile(filePath, updatedContent);
    }
  }
}

main().catch(console.error);