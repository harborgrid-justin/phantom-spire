# PowerShell script to fix JSON syntax errors in all phantom-*-core packages
param(
    [switch]$DryRun = $false
)

$PackagesPath = "C:\phantom-spire\packages"
$PackageJsonFiles = Get-ChildItem -Path $PackagesPath -Recurse -Name "package.json" | Where-Object { $_ -notmatch "node_modules" }

Write-Host "Found $($PackageJsonFiles.Count) package.json files to check and fix:" -ForegroundColor Green

foreach ($JsonFile in $PackageJsonFiles) {
    $JsonPath = Join-Path $PackagesPath $JsonFile
    Write-Host "Processing: $JsonPath" -ForegroundColor Yellow
    
    if (Test-Path $JsonPath) {
        $content = Get-Content $JsonPath -Raw
        $originalContent = $content
        
        # Fix double commas
        $content = $content -replace '\}\,\,', '},'
        $content = $content -replace '\]\,\,', '],'
        $content = $content -replace '"\,\,', '",'
        
        # Check if changes were made
        if ($content -ne $originalContent) {
            Write-Host "  Fixed syntax errors in $JsonFile" -ForegroundColor Green
            
            if (-not $DryRun) {
                Set-Content -Path $JsonPath -Value $content -Encoding UTF8
            }
        } else {
            Write-Host "  No syntax errors found in $JsonFile" -ForegroundColor Gray
        }
        
        # Validate JSON syntax after fix
        if (-not $DryRun) {
            try {
                $null = ConvertFrom-Json $content
                Write-Host "  Valid JSON structure confirmed" -ForegroundColor Cyan
            } catch {
                Write-Host "  JSON validation failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "JSON syntax fixing complete!" -ForegroundColor Green

if ($DryRun) {
    Write-Host "This was a DRY RUN. No files were modified." -ForegroundColor Yellow
    Write-Host "Remove -DryRun flag to apply changes." -ForegroundColor Yellow
}
}