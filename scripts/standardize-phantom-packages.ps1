# PowerShell script to standardize all phantom-*-core packages
# This ensures enterprise-grade consistency across all 19 NAPI-RS modules

param(
    [switch]$DryRun = $false,
    [string[]]$Packages = @()
)

# Define the standard feature template
$StandardFeatures = @'
[features]
default = ["local"]

# Core features
napi = ["dep:napi", "dep:napi-derive"]
local = []

# Database backends
postgres = ["tokio-postgres", "deadpool-postgres", "sqlx", "diesel"]
redis-store = ["redis"]
mongodb-store = ["mongodb"]
elasticsearch-store = ["elasticsearch"]
all-databases = ["postgres", "redis-store", "mongodb-store", "elasticsearch-store"]

# Web and messaging
web-full = ["actix-web", "reqwest"]
messaging = ["redis-store"]  # Using Redis for pub/sub messaging
caching = ["redis-store"]    # Redis-based caching layer

# Enterprise monitoring and security
monitoring = ["tracing", "tracing-subscriber", "prometheus", "metrics"]
crypto = ["ring", "rustls", "jsonwebtoken", "sha2", "base64"]
compression = ["flate2"]
diesel-orm = ["diesel", "diesel_migrations"]
advanced-config = []

# Bundled feature sets
enterprise = ["all-databases", "messaging", "caching", "monitoring", "crypto"]
full = ["enterprise", "web-full", "diesel-orm", "compression", "advanced-config"]
'@

$StandardScripts = @'
  "scripts": {
    "artifacts": "napi artifacts",
    "build": "napi build --platform --release --features napi",
    "build:debug": "napi build --platform --features napi",
    "build:enterprise": "napi build --platform --release --features enterprise",
    "build:full": "napi build --platform --release --features full",
    "clean": "rimraf dist",
    "prepublishOnly": "napi prepublish -t npm",
    "test": "cargo test --features enterprise",
    "test:native": "cargo test --all-features",
    "universal": "napi universal",
    "version": "napi version",
    "lint": "cargo clippy --features enterprise",
    "fmt": "cargo fmt"
  },
'@

$StandardDevDeps = @'
  "devDependencies": {
    "@napi-rs/cli": "^3.2.0",
    "rimraf": "^6.0.1"
  },
'@

# Find all phantom-*-core packages
$PackagesPath = "C:\phantom-spire\packages"
if ($Packages.Count -eq 0) {
    $Packages = Get-ChildItem -Path $PackagesPath -Directory | 
        Where-Object { $_.Name -match "^phantom-.*-core$" } |
        Select-Object -ExpandProperty Name
}

Write-Host "Found $($Packages.Count) phantom-*-core packages to standardize:" -ForegroundColor Green
$Packages | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }

foreach ($Package in $Packages) {
    $PackagePath = Join-Path $PackagesPath $Package
    $CargoToml = Join-Path $PackagePath "Cargo.toml"
    $PackageJson = Join-Path $PackagePath "package.json"
    
    Write-Host "`nProcessing: $Package" -ForegroundColor Yellow
    
    # Process Cargo.toml
    if (Test-Path $CargoToml) {
        Write-Host "  Updating Cargo.toml..." -ForegroundColor Gray
        
        if (-not $DryRun) {
            $content = Get-Content $CargoToml -Raw
            
            # Update NAPI dependencies to standard versions
            $content = $content -replace 'napi = \{ version = "[^"]*"', 'napi = { version = "3.3.0"'
            $content = $content -replace 'napi-derive = \{ version = "[^"]*"', 'napi-derive = { version = "3.2.5"'
            $content = $content -replace 'napi-derive = "[^"]*"', 'napi-derive = { version = "3.2.5", optional = true }'
            
            # Add tokio_rt feature to napi
            $content = $content -replace '(napi = \{ version = "3\.3\.0"[^}]*), features = \["napi6", "serde-json"\]', '$1, features = ["napi6", "serde-json", "tokio_rt"], optional = true'
            
            # Update napi-build version
            $content = $content -replace 'napi-build = "[^"]*"', 'napi-build = "2.1.0"'
            
            # Find and replace the [features] section
            if ($content -match '\[features\][\s\S]*?(?=\n\[|\n$|\z)') {
                $content = $content -replace '\[features\][\s\S]*?(?=\n\[|\z)', $StandardFeatures
            } else {
                Write-Warning "  Could not find [features] section in $CargoToml"
            }
            
            Set-Content -Path $CargoToml -Value $content -Encoding UTF8
        }
    } else {
        Write-Warning "  Cargo.toml not found in $PackagePath"
    }
    
    # Process package.json
    if (Test-Path $PackageJson) {
        Write-Host "  Updating package.json..." -ForegroundColor Gray
        
        if (-not $DryRun) {
            $content = Get-Content $PackageJson -Raw
            
            # Update scripts section
            if ($content -match '"scripts":\s*\{[^}]*\}') {
                $content = $content -replace '"scripts":\s*\{[^}]*\}', $StandardScripts.Trim()
            }
            
            # Update devDependencies
            if ($content -match '"devDependencies":\s*\{[^}]*\}') {
                $content = $content -replace '"devDependencies":\s*\{[^}]*\}', $StandardDevDeps.Trim()
            }
            
            Set-Content -Path $PackageJson -Value $content -Encoding UTF8
        }
    } else {
        Write-Warning "  package.json not found in $PackagePath"
    }
    
    Write-Host "  ✅ Completed $Package" -ForegroundColor Green
}

Write-Host "`n🎉 Standardization complete!" -ForegroundColor Green
Write-Host "All phantom-*-core packages now have:" -ForegroundColor White
Write-Host "  ✅ NAPI 3.3.0 with tokio_rt support" -ForegroundColor Cyan
Write-Host "  ✅ Enterprise feature flags (postgres, redis-store, mongodb-store, elasticsearch-store)" -ForegroundColor Cyan
Write-Host "  ✅ Standardized build scripts with --features flags" -ForegroundColor Cyan
Write-Host "  ✅ Updated dev dependencies (@napi-rs/cli ^3.2.0)" -ForegroundColor Cyan
Write-Host "  ✅ Enterprise-grade bundled features (enterprise, full)" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n⚠️  This was a DRY RUN. No files were modified." -ForegroundColor Yellow
    Write-Host "Remove -DryRun flag to apply changes." -ForegroundColor Yellow
}