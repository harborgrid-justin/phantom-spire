#!/usr/bin/env tsx
/**
 * COMPREHENSIVE FOREIGN KEY FIX SCRIPT
 * Analyzes all model files to find HasMany associations and ensures
 * corresponding foreign keys exist in the target models
 */
import fs from 'fs';
import path from 'path';

const modelsDir = path.join(__dirname, '..', 'src', 'lib', 'models');

interface Association {
  sourceModel: string;
  targetModel: string;
  foreignKey: string;
  hasMany: boolean;
  belongsTo: boolean;
}

/**
 * Extract associations from a model file content
 */
function extractAssociations(fileContent: string, fileName: string): Association[] {
  const associations: Association[] = [];
  const modelName = fileName.replace('.model.ts', '');
  
  // Find HasMany associations
  const hasManyMatches = fileContent.match(/@HasMany\(\(\)\s*=>\s*(\w+).*?\)/g);
  if (hasManyMatches) {
    for (const match of hasManyMatches) {
      const targetModelMatch = match.match(/@HasMany\(\(\)\s*=>\s*(\w+)/);
      if (targetModelMatch && targetModelMatch[1]) {
        const targetModel = targetModelMatch[1];
        const foreignKey = `${modelName.toLowerCase()}_id`;
        
        associations.push({
          sourceModel: modelName,
          targetModel,
          foreignKey,
          hasMany: true,
          belongsTo: false
        });
      }
    }
  }
  
  // Find BelongsTo associations
  const belongsToMatches = fileContent.match(/@BelongsTo\(\(\)\s*=>\s*(\w+).*?\)/g);
  if (belongsToMatches) {
    for (const match of belongsToMatches) {
      const targetModelMatch = match.match(/@BelongsTo\(\(\)\s*=>\s*(\w+)/);
      if (targetModelMatch && targetModelMatch[1]) {
        const targetModel = targetModelMatch[1];
        const foreignKey = `${targetModel.toLowerCase()}_id`;
        
        associations.push({
          sourceModel: modelName,
          targetModel,
          foreignKey,
          hasMany: false,
          belongsTo: true
        });
      }
    }
  }
  
  return associations;
}

/**
 * Check if a model has a specific foreign key
 */
function hasForeignKey(fileContent: string, foreignKey: string): boolean {
  const foreignKeyRegex = new RegExp(`@ForeignKey.*?${foreignKey}`, 'i');
  return foreignKeyRegex.test(fileContent);
}

/**
 * Check if a model has a specific field in its interface
 */
function hasInterfaceField(fileContent: string, fieldName: string): boolean {
  const interfaceRegex = new RegExp(`${fieldName}\\??:`, 'i');
  return interfaceRegex.test(fileContent);
}

/**
 * Add foreign key to model interface
 */
function addToInterface(fileContent: string, foreignKey: string, targetModel: string): string {
  const interfaceMatch = fileContent.match(/export interface (\w+)Attributes \{([^}]+)\}/s);
  if (!interfaceMatch || !interfaceMatch[1] || !interfaceMatch[2]) return fileContent;
  
  const interfaceName = interfaceMatch[1];
  const interfaceBody = interfaceMatch[2];
  
  // Add the field before the last field (usually timestamps)
  const newField = `  /** Associated ${targetModel.toLowerCase()} ID */\n  ${foreignKey}?: number;`;
  
  // Find a good place to insert (before created_at or updated_at)
  const insertionPoint = interfaceBody.lastIndexOf('created_at:') !== -1 
    ? interfaceBody.lastIndexOf('created_at:') 
    : interfaceBody.lastIndexOf('updated_at:');
  
  if (insertionPoint !== -1) {
    const beforeInsertion = interfaceBody.substring(0, insertionPoint);
    const afterInsertion = interfaceBody.substring(insertionPoint);
    const newInterfaceBody = beforeInsertion + newField + '\n  ' + afterInsertion;
    
    return fileContent.replace(interfaceMatch[0], `export interface ${interfaceName}Attributes {${newInterfaceBody}}`);
  }
  
  return fileContent;
}

/**
 * Add foreign key column to model
 */
function addForeignKeyColumn(fileContent: string, foreignKey: string, targetModel: string): string {
  // Find a good place to insert the foreign key (usually after other foreign keys or before non-foreign key columns)
  const existingForeignKeyMatch = fileContent.match(/@ForeignKey[\s\S]*?declare \w+_id\?\?: number;/g);
  
  let insertionPoint = -1;
  
  if (existingForeignKeyMatch && existingForeignKeyMatch.length > 0) {
    // Insert after the last existing foreign key
    const lastForeignKey = existingForeignKeyMatch[existingForeignKeyMatch.length - 1];
    if (lastForeignKey) {
      insertionPoint = fileContent.lastIndexOf(lastForeignKey) + lastForeignKey.length;
    }
  } else {
    // Find the first column declaration and insert before it (after the ID column)
    const firstColumnMatch = fileContent.match(/@PrimaryKey[\s\S]*?declare id: number;/);
    if (firstColumnMatch) {
      insertionPoint = fileContent.indexOf(firstColumnMatch[0]) + firstColumnMatch[0].length;
    }
  }
  
  if (insertionPoint !== -1) {
    const foreignKeyDeclaration = `\n\n  /** Associated ${targetModel.toLowerCase()} ID */\n  @ForeignKey(() => ${targetModel})\n  @AllowNull(true)\n  @Column(DataType.INTEGER)\n  declare ${foreignKey}?: number;`;
    
    return fileContent.substring(0, insertionPoint) + foreignKeyDeclaration + fileContent.substring(insertionPoint);
  }
  
  return fileContent;
}

/**
 * Add import for target model
 */
function addImport(fileContent: string, targetModel: string): string {
  // Check if import already exists
  const importRegex = new RegExp(`import.*${targetModel}.*from`, 'i');
  if (importRegex.test(fileContent)) {
    return fileContent;
  }
  
  // Find existing model imports to insert in the right place
  const importSection = fileContent.match(/import.*from '\.\/.+\.model'/g);
  
  if (importSection && importSection.length > 0) {
    const lastImport = importSection[importSection.length - 1];
    if (lastImport) {
      const insertionPoint = fileContent.indexOf(lastImport) + lastImport.length;
      const newImport = `\nimport { ${targetModel} } from './${targetModel}.model';`;
      
      return fileContent.substring(0, insertionPoint) + newImport + fileContent.substring(insertionPoint);
    }
  }
  
  return fileContent;
}

/**
 * Add BelongsTo association
 */
function addBelongsToAssociation(fileContent: string, foreignKey: string, targetModel: string): string {
  // Find existing associations section
  const associationsMatch = fileContent.match(/\/\/ Associations[\s\S]*?(?=\/\/ Instance methods|\/\/ Static methods|$)/);
  
  if (associationsMatch) {
    const associationsSection = associationsMatch[0];
    const associationDeclaration = `\n  /** Associated ${targetModel.toLowerCase()} */\n  @BelongsTo(() => ${targetModel}, {\n    foreignKey: '${foreignKey}',\n    as: '${targetModel.toLowerCase()}',\n    onDelete: 'SET NULL',\n    onUpdate: 'CASCADE'\n  })\n  declare ${targetModel.toLowerCase()}?: ${targetModel};\n`;
    
    const insertionPoint = fileContent.indexOf(associationsSection) + associationsSection.length;
    
    return fileContent.substring(0, insertionPoint - 1) + associationDeclaration + fileContent.substring(insertionPoint - 1);
  }
  
  return fileContent;
}

/**
 * Main function to analyze and fix foreign keys
 */
async function fixAllForeignKeys() {
  console.log('🔍 Analyzing model associations...');
  
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.model.ts'))
    .filter(file => file !== 'index.ts');
  
  console.log(`📊 Found ${modelFiles.length} model files to analyze`);
  
  const allAssociations: Association[] = [];
  
  // Extract all associations
  for (const file of modelFiles) {
    const filePath = path.join(modelsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const associations = extractAssociations(fileContent, file);
    allAssociations.push(...associations);
  }
  
  console.log(`🔗 Found ${allAssociations.length} associations`);
  
  // Find missing foreign keys
  const missingForeignKeys: Array<{
    targetFile: string;
    sourceModel: string;
    targetModel: string;
    foreignKey: string;
  }> = [];
  
  for (const association of allAssociations) {
    if (association.hasMany) {
      // For HasMany, the target model should have the foreign key
      const targetFile = `${association.targetModel}.model.ts`;
      const targetPath = path.join(modelsDir, targetFile);
      
      if (fs.existsSync(targetPath)) {
        const targetContent = fs.readFileSync(targetPath, 'utf8');
        
        if (!hasForeignKey(targetContent, association.foreignKey)) {
          missingForeignKeys.push({
            targetFile,
            sourceModel: association.sourceModel,
            targetModel: association.targetModel,
            foreignKey: association.foreignKey
          });
        }
      }
    }
  }
  
  console.log(`❌ Found ${missingForeignKeys.length} missing foreign keys:`);
  for (const missing of missingForeignKeys) {
    console.log(`  - ${missing.targetModel} missing ${missing.foreignKey} (from ${missing.sourceModel})`);
  }
  
  // Fix missing foreign keys
  let fixedCount = 0;
  
  for (const missing of missingForeignKeys) {
    const targetPath = path.join(modelsDir, missing.targetFile);
    let fileContent = fs.readFileSync(targetPath, 'utf8');
    
    console.log(`🔧 Fixing ${missing.targetModel}.${missing.foreignKey}...`);
    
    // Add import
    fileContent = addImport(fileContent, missing.sourceModel);
    
    // Add to interface
    if (!hasInterfaceField(fileContent, missing.foreignKey)) {
      fileContent = addToInterface(fileContent, missing.foreignKey, missing.sourceModel);
    }
    
    // Add foreign key column
    fileContent = addForeignKeyColumn(fileContent, missing.foreignKey, missing.sourceModel);
    
    // Add BelongsTo association
    fileContent = addBelongsToAssociation(fileContent, missing.foreignKey, missing.sourceModel);
    
    // Write the file
    fs.writeFileSync(targetPath, fileContent, 'utf8');
    fixedCount++;
  }
  
  console.log(`✅ Fixed ${fixedCount} missing foreign keys`);
  console.log('🎉 All foreign key issues should now be resolved!');
}

// Run if called directly
if (require.main === module) {
  fixAllForeignKeys().catch(console.error);
}

export { fixAllForeignKeys };
