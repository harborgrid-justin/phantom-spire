// Test with CommonJS (rename to .cjs to force CommonJS)
console.log('Testing phantom-ml-core with CommonJS...');

const phantomMl = require('@phantom-spire/ml-core');
console.log('✅ Module loaded successfully!');
console.log('Available functions:', Object.keys(phantomMl).length);

// Test system health
phantomMl.getSystemHealth().then(result => {
    const response = JSON.parse(result);
    console.log('✅ System Health:', response.status);
    console.log('✅ Platform:', response.platform);
    
    console.log('\n🎉 SUCCESS! The Phantom ML Core is working!');
    console.log(`📊 Total APIs: ${Object.keys(phantomMl).length}/44`);
    
}).catch(err => {
    console.error('❌ Error:', err.message);
});