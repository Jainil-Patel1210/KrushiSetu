# Mutation Testing Script - FULL COVERAGE (all locations)
# This will test ALL mutation locations (takes longer but gives complete picture)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Mutation Testing - FULL COVERAGE Mode" -ForegroundColor Cyan
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "app")) {
    Write-Host "ERROR: app folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Starting FULL mutation testing for app/ folder..." -ForegroundColor Cyan
Write-Host "This will test ALL mutation locations (may take 10-30 minutes)" -ForegroundColor Yellow
Write-Host ""

$env:PYTHONHASHSEED = "0"

# Test ALL locations (use high number or calculate total)
# Total locations found: 92
# We'll test all of them by using -n with a large number
# Exclude test files from mutation (we mutate production code, not test code)
mutatest -s app `
    -t "python manage.py test app --keepdb" `
    -e "app/migrations" `
    -e "app/__init__.py" `
    -e "app/admin.py" `
    -e "app/apps.py" `
    -e "app/tests.py" `
    -e "app/tests_mutation_coverage.py" `
    -n 100 `
    -o mutation_results_full.rst

Write-Host ""
Write-Host "FULL mutation testing complete!" -ForegroundColor Green
Write-Host "Check mutation_results_full.rst for detailed results" -ForegroundColor Cyan

