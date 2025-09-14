#!/usr/bin/env powershell
# Fix all phantom-*-core Cargo.toml files with consistent enterprise standards

$ErrorActionPreference = "Stop"

Write-Host "🔧 Fixing Cargo.toml configurations for all phantom-*-core modules..." -ForegroundColor Green

$modules = Get-ChildItem "packages\" -Directory -Name | Where-Object {$_ -like "phantom-*-core" -and $_ -ne "phantom-enterprise-standards"}

foreach ($module in $modules) {
    Write-Host "📦 Fixing $module..." -ForegroundColor Blue
    
    $cargoPath = "packages\$module\Cargo.toml"
    
    if (-not (Test-Path $cargoPath)) {
        Write-Warning "Skipping $module - Cargo.toml not found"
        continue
    }
    
    # Read current file
    $content = Get-Content $cargoPath -Raw
    
    # Extract the package section and basic info to preserve
    $packageSection = ""
    if ($content -match '(?s)\[package\].*?(?=\[)') {
        $packageSection = $Matches[0]
    }
    
    $libSection = ""
    if ($content -match '(?s)\[lib\].*?(?=\[)') {
        $libSection = $Matches[0]
    }
    
    # Create standardized Cargo.toml based on phantom-enterprise-standards template
    $moduleNameUnderscore = $module -replace "-", "_"
    
    $newContent = @"
$packageSection
$libSection
[dependencies]
# Core NAPI dependencies - standardized versions
napi = { version = "3.3.0", default-features = false, features = ["napi6", "serde-json", "tokio_rt"], optional = true }
napi-derive = { version = "3.2.5", optional = true }

# Core serialization and data handling - required for all packages
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.18.1", features = ["v4", "serde"] }
regex = "1.10"
thiserror = "2.0.16"

# Async runtime - standardized across platform
tokio = { version = "1.47.1", features = ["full"] }
async-trait = "0.1.89"
futures = "0.3.31"

# Common utilities for all packages
base64 = { version = "0.22.1", optional = true }
sha2 = { version = "0.10", optional = true }
url = "2.5.7"
anyhow = "1.0.99"
log = "0.4.28"
env_logger = "0.11.8"

# High-performance collections and concurrency
dashmap = "6.1.0"
parking_lot = "0.12"
rayon = "1.11.0"
once_cell = "1.19"

# Enterprise security and compliance
jsonwebtoken = { version = "9.3", optional = true }
ring = { version = "0.17", optional = true }
aes-gcm = { version = "0.10", optional = true }

# Database support - all standardized versions
tokio-postgres = { version = "0.7", features = ["with-chrono-0_4", "with-uuid-1", "with-serde_json-1"], optional = true }
deadpool-postgres = { version = "0.14.1", optional = true }
sqlx = { version = "0.8.6", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono", "json"], optional = true }
diesel = { version = "2.1", features = ["postgres", "mysql", "sqlite", "r2d2", "chrono", "uuid"], optional = true }
diesel_migrations = { version = "2.1", optional = true }
redis = { version = "0.32.5", features = ["tokio-comp", "connection-manager"], optional = true }
mongodb = { version = "3.3.0", optional = true }
elasticsearch = { version = "8.15.0-alpha.1", optional = true }

# Web frameworks - optional
actix-web = { version = "4.4", optional = true }
rocket = { version = "0.5", features = ["json"], optional = true }
reqwest = { version = "0.12.23", features = ["json", "rustls-tls"], default-features = false, optional = true }

# Monitoring and observability
tracing = { version = "0.1", optional = true }
tracing-subscriber = { version = "0.3", features = ["env-filter"], optional = true }
prometheus = { version = "0.14.0", optional = true }
metrics = { version = "0.24.2", optional = true }

# Compression and additional utilities
flate2 = { version = "1.0", optional = true }
rustls = { version = "0.23.31", optional = true }

# Enterprise standards dependency
phantom-enterprise-standards = { path = "../phantom-enterprise-standards", optional = true }

[features]
default = ["local"]

# Core features
napi = ["dep:napi", "dep:napi-derive"]
local = []

# Database backends
postgres = ["dep:tokio-postgres", "dep:deadpool-postgres", "dep:sqlx", "dep:diesel"]
redis-store = ["dep:redis"]
mongodb-store = ["dep:mongodb"]
elasticsearch-store = ["dep:elasticsearch"]
all-databases = ["postgres", "redis-store", "mongodb-store", "elasticsearch-store"]

# Enterprise monitoring and security
monitoring = ["dep:tracing", "dep:tracing-subscriber", "dep:prometheus", "dep:metrics"]
crypto = ["dep:ring", "dep:rustls", "dep:jsonwebtoken", "dep:sha2", "dep:base64"]
compression = ["dep:flate2"]

# Web and messaging
web-full = ["dep:actix-web", "dep:reqwest"]
messaging = ["redis-store"]
caching = ["redis-store"]
diesel-orm = ["dep:diesel", "dep:diesel_migrations"]
advanced-config = []

# Bundled feature sets
enterprise = ["all-databases", "messaging", "caching", "monitoring", "crypto", "phantom-enterprise-standards"]
full = ["enterprise", "web-full", "diesel-orm", "compression", "advanced-config"]

[build-dependencies]
napi-build = "2.1.0"
"@
    
    # Write the new content
    $newContent | Set-Content $cargoPath -NoNewline
    Write-Host "  ✅ Fixed $module Cargo.toml" -ForegroundColor Green
}

Write-Host "`n🎉 All Cargo.toml files have been standardized!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run packages:build" -ForegroundColor Cyan
Write-Host "  2. Run: npm run test:enterprise" -ForegroundColor Cyan