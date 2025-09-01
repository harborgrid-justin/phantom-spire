#!/bin/bash

# Phantom Spire CTI Platform - Enterprise Installation Validation Script
# This script validates that the installation meets enterprise-grade standards

set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "\n${WHITE}===================================================${NC}"
    echo -e "${WHITE} $1${NC}"
    echo -e "${WHITE}===================================================${NC}\n"
}

# Validation counters
PASS_COUNT=0
FAIL_COUNT=0
WARNING_COUNT=0

# Test result tracking
test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    case "$result" in
        "PASS")
            log_success "✅ $test_name: $message"
            PASS_COUNT=$((PASS_COUNT + 1))
            ;;
        "FAIL")
            log_error "❌ $test_name: $message"
            FAIL_COUNT=$((FAIL_COUNT + 1))
            ;;
        "WARN")
            log_warning "⚠️  $test_name: $message"
            WARNING_COUNT=$((WARNING_COUNT + 1))
            ;;
    esac
}

# Validate script security patterns
validate_script_security() {
    log_header "VALIDATING INSTALLATION SCRIPT SECURITY"
    
    local scripts=("install.sh" "scripts/enhanced-install.sh")
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            log_info "Checking $script..."
            
            # Check for unsafe curl patterns
            if grep -q "curl.*|.*bash" "$script"; then
                test_result "$script" "FAIL" "Contains unsafe curl | bash pattern"
            else
                test_result "$script" "PASS" "No unsafe curl | bash patterns found"
            fi
            
            # Check for proper error handling
            if grep -q "set -euo pipefail\|set -e" "$script"; then
                test_result "$script" "PASS" "Has proper error handling"
            else
                test_result "$script" "FAIL" "Missing proper error handling"
            fi
            
            # Check for HTTPS usage (excluding localhost)
            local http_count=$(grep -c "http://[^l]" "$script" 2>/dev/null || true)
            if [[ -z "$http_count" ]] || [[ "$http_count" -eq 0 ]]; then
                test_result "$script" "PASS" "Uses HTTPS for external downloads"
            else
                test_result "$script" "WARN" "Contains $http_count HTTP references (localhost OK)"
            fi
            
            # Check for secret generation
            if grep -q "openssl rand" "$script"; then
                test_result "$script" "PASS" "Generates cryptographic secrets"
            else
                test_result "$script" "FAIL" "No cryptographic secret generation found"
            fi
            
        else
            test_result "$script" "FAIL" "Script file not found"
        fi
    done
}

# Validate configuration security
validate_configuration_security() {
    log_header "VALIDATING CONFIGURATION SECURITY"
    
    # Check if scripts generate secure configuration
    local config_patterns=(
        "JWT_SECRET.*openssl"
        "SESSION_SECRET.*openssl" 
        "BCRYPT_ROUNDS.*1[2-9]"
        "NODE_ENV=production"
        "HTTPS_ENABLED"
    )
    
    for pattern in "${config_patterns[@]}"; do
        if grep -q "$pattern" install.sh scripts/enhanced-install.sh 2>/dev/null; then
            test_result "Config Security" "PASS" "Pattern '$pattern' found in configuration"
        else
            test_result "Config Security" "WARN" "Pattern '$pattern' not found in configuration"
        fi
    done
}

# Validate systemd service security
validate_service_security() {
    log_header "VALIDATING SYSTEMD SERVICE SECURITY"
    
    local security_features=(
        "NoNewPrivileges=yes"
        "ProtectSystem=strict"
        "ProtectHome=yes"
        "PrivateTmp=yes"
        "RestrictRealtime=yes"
        "MemoryMax="
        "CPUQuota="
    )
    
    for feature in "${security_features[@]}"; do
        if grep -q "$feature" install.sh; then
            test_result "Service Security" "PASS" "Security feature '$feature' enabled"
        else
            test_result "Service Security" "FAIL" "Security feature '$feature' not found"
        fi
    done
}

# Validate enterprise features
validate_enterprise_features() {
    log_header "VALIDATING ENTERPRISE FEATURES"
    
    local enterprise_features=(
        "SSL.*certificate"
        "rate.*limiting"
        "audit.*logging"
        "log.*rotation"
        "backup"
        "monitoring"
        "health.*check"
    )
    
    for feature in "${enterprise_features[@]}"; do
        if grep -qi "$feature" install.sh scripts/enhanced-install.sh 2>/dev/null; then
            test_result "Enterprise Features" "PASS" "Feature '$feature' implemented"
        else
            test_result "Enterprise Features" "WARN" "Feature '$feature' not found"
        fi
    done
}

# Validate installation script completeness
validate_completeness() {
    log_header "VALIDATING INSTALLATION COMPLETENESS"
    
    local required_functions=(
        "install_nodejs"
        "generate_config"
        "create_service"
        "verify_installation"
        "handle_error"
    )
    
    for func in "${required_functions[@]}"; do
        if grep -q "^$func()" install.sh scripts/enhanced-install.sh 2>/dev/null; then
            test_result "Completeness" "PASS" "Function '$func' implemented"
        else
            test_result "Completeness" "FAIL" "Function '$func' not found"
        fi
    done
}

# Check documentation quality
validate_documentation() {
    log_header "VALIDATING DOCUMENTATION QUALITY"
    
    # Check for comprehensive help text
    if grep -q "ENTERPRISE\|enterprise" install.sh; then
        test_result "Documentation" "PASS" "Enterprise branding present"
    else
        test_result "Documentation" "WARN" "Enterprise branding could be improved"
    fi
    
    # Check for post-install instructions
    if grep -q "POST-INSTALLATION\|NEXT STEPS" install.sh; then
        test_result "Documentation" "PASS" "Post-installation guidance provided"
    else
        test_result "Documentation" "FAIL" "No post-installation guidance found"
    fi
    
    # Check for security warnings
    if grep -q "WARNING\|SECURITY" install.sh; then
        test_result "Documentation" "PASS" "Security warnings included"
    else
        test_result "Documentation" "WARN" "Security warnings could be improved"
    fi
}

# Generate final report
generate_report() {
    log_header "ENTERPRISE INSTALLATION VALIDATION REPORT"
    
    local total_tests=$((PASS_COUNT + FAIL_COUNT + WARNING_COUNT))
    local pass_percentage=0
    
    if [[ $total_tests -gt 0 ]]; then
        pass_percentage=$(( (PASS_COUNT * 100) / total_tests ))
    fi
    
    echo -e "${WHITE}📊 VALIDATION RESULTS:${NC}"
    echo -e "   ✅ Passed: ${GREEN}$PASS_COUNT${NC} tests"
    echo -e "   ❌ Failed: ${RED}$FAIL_COUNT${NC} tests"
    echo -e "   ⚠️  Warnings: ${YELLOW}$WARNING_COUNT${NC} tests"
    echo -e "   📈 Success Rate: ${CYAN}$pass_percentage%${NC}"
    echo ""
    
    # Determine overall grade
    if [[ $FAIL_COUNT -eq 0 ]] && [[ $pass_percentage -ge 90 ]]; then
        echo -e "🏆 ${GREEN}GRADE: ENTERPRISE READY${NC}"
        echo -e "   Installation scripts meet enterprise-grade standards!"
    elif [[ $FAIL_COUNT -eq 0 ]] && [[ $pass_percentage -ge 75 ]]; then
        echo -e "🥈 ${YELLOW}GRADE: PRODUCTION READY${NC}"
        echo -e "   Installation scripts are production-ready with minor improvements needed."
    elif [[ $FAIL_COUNT -le 3 ]] && [[ $pass_percentage -ge 60 ]]; then
        echo -e "🥉 ${YELLOW}GRADE: NEEDS IMPROVEMENT${NC}"
        echo -e "   Installation scripts need security and reliability improvements."
    else
        echo -e "⚠️  ${RED}GRADE: NOT READY${NC}"
        echo -e "   Installation scripts have critical issues that must be fixed."
    fi
    
    echo ""
    echo -e "${WHITE}📋 RECOMMENDATIONS:${NC}"
    
    if [[ $FAIL_COUNT -gt 0 ]]; then
        echo -e "   🚨 Address all failed tests immediately"
    fi
    
    if [[ $WARNING_COUNT -gt 3 ]]; then
        echo -e "   ⚠️  Review warnings for potential improvements"
    fi
    
    if [[ $pass_percentage -lt 90 ]]; then
        echo -e "   📈 Aim for 90%+ pass rate for enterprise deployment"
    fi
    
    echo ""
}

# Main validation function
main() {
    echo -e "${PURPLE}🔍 Phantom Spire Enterprise Installation Validator${NC}"
    echo -e "${PURPLE}Validating installation scripts for enterprise-grade deployment...${NC}\n"
    
    validate_script_security
    validate_configuration_security
    validate_service_security
    validate_enterprise_features
    validate_completeness
    validate_documentation
    
    generate_report
}

# Run validation
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi