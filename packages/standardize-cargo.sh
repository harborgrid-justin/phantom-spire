#!/bin/bash

# Script to standardize all phantom-*-core Cargo.toml files

# Package configurations: name, description, domain_keyword, specialized_deps
declare -A PACKAGES=(
    ["phantom-attribution-core"]="Threat attribution and actor profiling core with advanced behavioral analysis and campaign tracking|attribution|"
    ["phantom-compliance-core"]="Compliance and regulatory framework analysis core with automated audit and reporting capabilities|compliance|"
    ["phantom-crypto-core"]="Cryptographic analysis and security assessment core with algorithm validation and key management|crypto|"
    ["phantom-cve-core"]="Advanced CVE processing core with vulnerability intelligence and threat analysis|cve|"
    ["phantom-feeds-core"]="Threat intelligence feeds processing and aggregation core with real-time data correlation|feeds|"
    ["phantom-forensics-core"]="Digital forensics and incident analysis core with evidence collection and timeline reconstruction|forensics|walkdir = \"2.4\"\nzip = \"5.1.1\"\ntar = \"0.4\"\ntempfile = \"3.0\"\nnotify = \"8.2.0\""
    ["phantom-hunting-core"]="Threat hunting and proactive defense core with behavioral analytics and anomaly detection|hunting|"
    ["phantom-incident-response-core"]="Enterprise incident response core with comprehensive capabilities|incident-response|indexmap = { version = \"2.0\", features = [\"serde\"] }\nhex = \"0.4\"\nsemver = \"1.0\"\ntoml = \"0.9.5\"\nnum_cpus = \"1.16\""
    ["phantom-intel-core"]="Advanced threat intelligence core with comprehensive intelligence gathering, analysis, and correlation engine|intel|ipnetwork = \"0.20\"\ncidr = \"0.2\"\nmaxminddb = \"0.23\"\ntrust-dns-resolver = \"0.23\"\nwhois-rust = \"1.6\"\nsimd-json = \"0.13\"\nxxhash-rust = { version = \"0.8\", features = [\"xxh3\"] }\nonce_cell = \"1.19\""
    ["phantom-ioc-core"]="Advanced IOC processing core with threat intelligence and indicator correlation|ioc|"
    ["phantom-malware-core"]="Malware analysis and classification core with dynamic and static analysis capabilities|malware|"
    ["phantom-mitre-core"]="Advanced MITRE ATT&CK framework integration and threat analysis system with comprehensive technique mapping|mitre|"
    ["phantom-reputation-core"]="IP and domain reputation analysis core with threat scoring and blacklist management|reputation|"
    ["phantom-risk-core"]="Risk assessment and vulnerability prioritization core with business impact analysis|risk|"
    ["phantom-sandbox-core"]="Automated malware sandboxing and behavioral analysis core with dynamic execution environments|sandbox|"
    ["phantom-secop-core"]="Advanced Security Operations (SecOps) engine for comprehensive incident response, automation, and security orchestration|secops|"
    ["phantom-threat-actor-core"]="Advanced threat actor intelligence and analysis system with comprehensive attribution capabilities|threat-actor|"
    ["phantom-vulnerability-core"]="Vulnerability assessment and management core with automated scanning and remediation guidance|vulnerability|"
    ["phantom-xdr-core"]="Advanced XDR (Extended Detection and Response) core with threat detection, behavioral analytics, and automated response capabilities|xdr|"
)

cd "$(dirname "$0")"

echo "🔧 Standardizing all phantom-*-core Cargo.toml files..."

for package in "${!PACKAGES[@]}"; do
    echo "📦 Updating $package..."
    
    IFS='|' read -r description domain_keyword specialized_deps <<< "${PACKAGES[$package]}"
    
    # Extract package name without prefix/suffix
    package_name=$(echo "$package" | sed 's/phantom-//' | sed 's/-core//')
    
    # Create standardized Cargo.toml from template
    sed -e "s/{PACKAGE_NAME}/$package_name/g" \
        -e "s/{DESCRIPTION}/$description/g" \
        -e "s/{DOMAIN_KEYWORD}/$domain_keyword/g" \
        Cargo-template.toml > "$package/Cargo.toml.new"
    
    # Add specialized dependencies if any
    if [ -n "$specialized_deps" ]; then
        echo "" >> "$package/Cargo.toml.new"
        echo "# Package-specific dependencies" >> "$package/Cargo.toml.new"
        echo -e "$specialized_deps" >> "$package/Cargo.toml.new"
    fi
    
    # Replace the old Cargo.toml
    mv "$package/Cargo.toml.new" "$package/Cargo.toml"
    
    echo "✅ Updated $package"
done

echo ""
echo "🎉 All Cargo.toml files have been standardized!"
echo "📋 Standardization includes:"
echo "   • Consistent dependency versions across all packages"
echo "   • Unified feature flag structure for platform integration"
echo "   • Optional dependencies for true package independence"
echo "   • Standardized metadata (license, authors, repository)"
echo "   • Common base dependencies for interoperability"
echo ""
echo "🔍 Key benefits:"
echo "   ✅ Each package can be used independently"
echo "   ✅ Packages work together seamlessly as a platform"
echo "   ✅ Consistent API surface across all packages"
echo "   ✅ Standardized feature gates for enterprise features"
echo "   ✅ Version consistency prevents dependency conflicts"