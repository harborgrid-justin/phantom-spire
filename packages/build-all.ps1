$phantomCoreProjects = @(
    "phantom-core-hunting",
    "phantom-core-incident-response", 
    "phantom-core-intel",
    "phantom-core-ioc",
    "phantom-core-malware",
    "phantom-core-mitre",
    "phantom-core-ml",
    "phantom-core-reputation",
    "phantom-core-risk",
    "phantom-core-sandbox",
    "phantom-core-secop",
    "phantom-core-studio",
    "phantom-core-threat-actor",
    "phantom-core-vulnerability",
    "phantom-core-xdr"
)

foreach ($project in $phantomCoreProjects) {
    Write-Host "Building $project..." -ForegroundColor Green
    $projectPath = "c:\phantom-spire\packages\$project"
    if (Test-Path $projectPath) {
        Push-Location $projectPath
        try {
            napi build --platform --release --features napi
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ $project built successfully" -ForegroundColor Green
            } else {
                Write-Host "✗ $project build failed" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ $project build failed with exception: $_" -ForegroundColor Red
        }
        Pop-Location
    } else {
        Write-Host "✗ $project directory not found" -ForegroundColor Red
    }
    Write-Host ""
}
