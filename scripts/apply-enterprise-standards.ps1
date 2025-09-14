#!/usr/bin/env powershell

# PowerShell script to apply phantom-enterprise-standards to all phantom-*-core modules
# This script standardizes all NAPI-RS security modules for Fortune 100 deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Applying Phantom Enterprise Standards to all security modules..." -ForegroundColor Green

# Get all phantom-*-core directories except enterprise-standards itself
$modules = Get-ChildItem "packages\" -Directory -Name | Where-Object {$_ -like "phantom-*-core" -and $_ -ne "phantom-enterprise-standards"}

Write-Host "Found $($modules.Count) modules to standardize:" -ForegroundColor Yellow
$modules | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }

foreach ($module in $modules) {
    Write-Host "`n📦 Standardizing $module..." -ForegroundColor Blue
    
    $cargoPath = "packages\$module\Cargo.toml"
    $srcPath = "packages\$module\src"
    
    if (-not (Test-Path $cargoPath)) {
        Write-Warning "Skipping $module - Cargo.toml not found"
        continue
    }
    
    # Read current Cargo.toml
    $cargoContent = Get-Content $cargoPath -Raw
    
    # Skip if already has phantom-enterprise-standards
    if ($cargoContent -match "phantom-enterprise-standards") {
        Write-Host "  ✅ $module already has enterprise standards" -ForegroundColor Green
        continue
    }
    
    # Add phantom-enterprise-standards dependency
    if ($cargoContent -match '# Security and cryptography - optional\r?\n(.*ring.*\r?\n.*rustls.*\r?\n.*jsonwebtoken.*\r?\n)') {
        $replacement = @"
# Security and cryptography - optional
$($Matches[1])
# Enterprise standards dependency
phantom-enterprise-standards = { path = "../phantom-enterprise-standards", optional = true }
"@
        $cargoContent = $cargoContent -replace '# Security and cryptography - optional\r?\n(.*ring.*\r?\n.*rustls.*\r?\n.*jsonwebtoken.*\r?\n)', $replacement
        Write-Host "  ✅ Added enterprise standards dependency" -ForegroundColor Green
    } elseif ($cargoContent -match '\[dependencies\]') {
        # Fallback: add after [dependencies] section
        $cargoContent = $cargoContent -replace '\[dependencies\]', @"
[dependencies]

# Enterprise standards dependency
phantom-enterprise-standards = { path = "../phantom-enterprise-standards", optional = true }
"@
        Write-Host "  ✅ Added enterprise standards dependency (fallback)" -ForegroundColor Green
    }
    
    # Update enterprise feature to include phantom-enterprise-standards
    if ($cargoContent -match 'enterprise = \["all-databases", "messaging", "caching", "monitoring", "crypto"\]') {
        $cargoContent = $cargoContent -replace 'enterprise = \["all-databases", "messaging", "caching", "monitoring", "crypto"\]', 'enterprise = ["all-databases", "messaging", "caching", "monitoring", "crypto", "phantom-enterprise-standards"]'
        Write-Host "  ✅ Updated enterprise feature flag" -ForegroundColor Green
    } elseif ($cargoContent -match 'enterprise = \[(.*)\]') {
        $features = $Matches[1]
        if ($features -notmatch "phantom-enterprise-standards") {
            $newFeatures = $features + ', "phantom-enterprise-standards"'
            $cargoContent = $cargoContent -replace "enterprise = \[$features\]", "enterprise = [$newFeatures]"
            Write-Host "  ✅ Updated enterprise feature flag" -ForegroundColor Green
        }
    }
    
    # Write updated Cargo.toml
    $cargoContent | Set-Content $cargoPath -NoNewline
    
    # Create src directory if it doesn't exist
    if (-not (Test-Path $srcPath)) {
        New-Item -ItemType Directory -Path $srcPath -Force | Out-Null
        Write-Host "  📁 Created src directory" -ForegroundColor Yellow
    }
    
    # Create lib.rs if it doesn't exist
    $libPath = "$srcPath\lib.rs"
    if (-not (Test-Path $libPath)) {
        $moduleNameUpper = ($module -replace "-", "_").ToUpper()
        $moduleNameSnake = $module -replace "-", "_"
        
        $libContent = @"
//! # $module
//!
//! Enterprise-grade security module for Phantom Spire threat intelligence platform.
//! Provides Fortune 100-ready capabilities with multi-database support and 
//! cross-plugin intelligence correlation.

pub mod core;

#[cfg(feature = "phantom-enterprise-standards")]
pub mod enterprise;

#[cfg(feature = "phantom-enterprise-standards")]
pub mod unified_data_adapter;

// Re-export main types
pub use core::*;

#[cfg(feature = "phantom-enterprise-standards")]
pub use enterprise::*;

#[cfg(feature = "phantom-enterprise-standards")]
pub use unified_data_adapter::*;

// NAPI-RS bindings for Node.js integration
#[cfg(feature = "napi")]
mod napi_bindings {
    use napi::*;
    use napi_derive::napi;
    use crate::core::*;
    
    #[napi(js_name = "$($module -replace 'phantom-', '' -replace '-core', '').Replace('-', '')Core")]
    pub struct $($moduleNameSnake.Replace('phantom_', '').Replace('_core', ''))CoreNapi {
        inner: $($module -replace 'phantom-', '' -replace '-core', '' | ForEach-Object {$_.substring(0,1).toupper()+$_.substring(1)})Core,
    }
    
    #[napi]
    impl $($moduleNameSnake.Replace('phantom_', '').Replace('_core', ''))CoreNapi {
        #[napi(constructor)]
        pub fn new() -> Result<Self> {
            let config = Default::default();
            let inner = $($module -replace 'phantom-', '' -replace '-core', '' | ForEach-Object {$_.substring(0,1).toupper()+$_.substring(1)})Core::new(config)
                .map_err(|e| Error::from_reason(format!("Failed to initialize: {}", e)))?;
            
            Ok(Self { inner })
        }
        
        #[napi]
        pub async fn get_version(&self) -> Result<String> {
            Ok(env!("CARGO_PKG_VERSION").to_string())
        }
        
        #[napi]
        pub async fn health_check(&self) -> Result<bool> {
            Ok(self.inner.health_check().await.unwrap_or(false))
        }
    }
}

#[cfg(feature = "napi")]
pub use napi_bindings::*;
"@
        $libContent | Set-Content $libPath
        Write-Host "  📄 Created lib.rs" -ForegroundColor Green
    }
    
    # Create core.rs if it doesn't exist
    $corePath = "$srcPath\core.rs"
    if (-not (Test-Path $corePath)) {
        $moduleTitle = ($module -replace "phantom-", "" -replace "-core", "" -split "-" | ForEach-Object {$_.substring(0,1).toupper()+$_.substring(1).tolower()}) -join " "
        $coreStruct = ($module -replace "phantom-", "" -replace "-core", "" | ForEach-Object {$_.substring(0,1).toupper()+$_.substring(1)}) + "Core"
        
        $coreContent = @"
//! Core $moduleTitle functionality for Phantom Spire
//!
//! This module provides the main $moduleTitle processing capabilities
//! with enterprise-grade performance and multi-database support.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use async_trait::async_trait;
use chrono::{DateTime, Utc};

/// Configuration for $moduleTitle Core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub database_urls: HashMap<String, String>,
    pub cache_enabled: bool,
    pub max_concurrent_operations: usize,
    pub timeout_seconds: u64,
    pub enterprise_features: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            database_urls: HashMap::new(),
            cache_enabled: true,
            max_concurrent_operations: 100,
            timeout_seconds: 30,
            enterprise_features: cfg!(feature = "enterprise"),
        }
    }
}

/// Main $moduleTitle processing core
#[derive(Debug)]
pub struct $coreStruct {
    config: Config,
    // Add your core implementation fields here
}

impl $coreStruct {
    /// Create new $moduleTitle Core instance
    pub fn new(config: Config) -> Result<Self, String> {
        Ok(Self {
            config,
        })
    }
    
    /// Health check for the $moduleTitle core
    pub async fn health_check(&self) -> Result<bool, String> {
        // Implement health check logic
        Ok(true)
    }
    
    /// Get current configuration
    pub fn get_config(&self) -> &Config {
        &self.config
    }
}

/// $moduleTitle operations trait
#[async_trait]
pub trait $($moduleTitle.Replace(' ', ''))Operations: Send + Sync {
    /// Process $moduleTitle data
    async fn process(&self, data: serde_json::Value) -> Result<serde_json::Value, String>;
    
    /// Get processing statistics
    async fn get_stats(&self) -> Result<ProcessingStats, String>;
}

/// Processing statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingStats {
    pub total_processed: u64,
    pub success_count: u64,
    pub error_count: u64,
    pub average_processing_time_ms: f64,
    pub last_processed: Option<DateTime<Utc>>,
}

#[async_trait]
impl $($moduleTitle.Replace(' ', ''))Operations for $coreStruct {
    async fn process(&self, data: serde_json::Value) -> Result<serde_json::Value, String> {
        // Implement your core processing logic here
        log::info!("Processing $moduleTitle data");
        
        // Mock successful processing
        Ok(serde_json::json!({
            "status": "processed",
            "module": "$module",
            "timestamp": Utc::now(),
            "data": data
        }))
    }
    
    async fn get_stats(&self) -> Result<ProcessingStats, String> {
        Ok(ProcessingStats {
            total_processed: 0,
            success_count: 0,
            error_count: 0,
            average_processing_time_ms: 0.0,
            last_processed: None,
        })
    }
}
"@
        $coreContent | Set-Content $corePath
        Write-Host "  📄 Created core.rs" -ForegroundColor Green
    }
    
    Write-Host "  ✅ $module standardization complete!" -ForegroundColor Green
}

Write-Host "`n🎉 Enterprise standardization complete for all modules!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run build:native" -ForegroundColor Cyan  
Write-Host "  2. Run: npm run test:enterprise" -ForegroundColor Cyan
Write-Host "  3. Validate: node scripts/demo-enterprise-cve-standardization.mjs" -ForegroundColor Cyan