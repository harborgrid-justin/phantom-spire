#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of packages to update (excluding phantom-ml-core)
const packages = [
    "phantom-attribution-core",
    "phantom-compliance-core",
    "phantom-crypto-core",
    "phantom-cve-core",
    "phantom-feeds-core",
    "phantom-forensics-core",
    "phantom-hunting-core",
    "phantom-incident-response-core",
    "phantom-intel-core",
    "phantom-ioc-core",
    "phantom-malware-core",
    "phantom-mitre-core",
    "phantom-reputation-core",
    "phantom-risk-core",
    "phantom-sandbox-core",
    "phantom-secop-core",
    "phantom-threat-actor-core",
    "phantom-vulnerability-core",
    "phantom-xdr-core"
];

// Base directory for packages
const baseDir = "/c/phantom-spire/packages";

// Dependency to add
const dependency = {
    "@phantom-spire/ml-core": "file:../phantom-ml-core/nextgen"
};

let updatedCount = 0;
let errors = [];

packages.forEach(packageName => {
    const packageJsonPath = path.join(baseDir, packageName, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        try {
            // Read current package.json
            const data = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Add dependencies section if it doesn't exist
            if (!data.dependencies) {
                data.dependencies = {};
            }

            // Add the ml-core dependency
            Object.assign(data.dependencies, dependency);

            // Write updated package.json with proper formatting
            fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

            console.log(`✓ Updated ${packageName}/package.json`);
            updatedCount++;

        } catch (error) {
            const errorMsg = `✗ Error updating ${packageName}: ${error.message}`;
            console.log(errorMsg);
            errors.push(errorMsg);
        }
    } else {
        const errorMsg = `✗ package.json not found for ${packageName}`;
        console.log(errorMsg);
        errors.push(errorMsg);
    }
});

console.log(`\nSummary:`);
console.log(`Successfully updated: ${updatedCount} packages`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
    console.log('\nErrors encountered:');
    errors.forEach(error => console.log(error));
}