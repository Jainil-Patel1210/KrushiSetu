# Mutation Testing Script for app/ folder (PowerShell)
# Ensures correct directory and runs mutatest

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Verify we're in the back directory
if (-not (Test-Path "app")) {
    Write-Host "ERROR: app folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the back/ directory" -ForegroundColor Red
    exit 1
}

Write-Host "Starting mutation testing for app/ folder..." -ForegroundColor Cyan
Write-Host ""

# Set environment variable
$env:PYTHONHASHSEED = "0"

# Run mutatest (quick test - 10 random locations)
# Note: To test all locations, use run_mutation_testing_full.ps1 instead
mutatest -s app -t "python manage.py test app --keepdb" -e "app/migrations" -e "app/__init__.py" -e "app/admin.py" -e "app/apps.py" -n 10

Write-Host ""
Write-Host "Mutation testing complete!" -ForegroundColor Green

