# Railway Setup Script
# Run this after logging in to Railway CLI: railway login

Write-Host "Setting up Railway project..." -ForegroundColor Green

# Navigate to project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Check if Railway CLI is available
$railwayCheck = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "https://docs.railway.com/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "Railway CLI found!" -ForegroundColor Green

# Check if logged in
Write-Host "Checking Railway login status..." -ForegroundColor Yellow
railway whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Railway first:" -ForegroundColor Yellow
    Write-Host "railway login" -ForegroundColor Cyan
    exit 1
}

Write-Host "Logged in to Railway!" -ForegroundColor Green

# Create new project
Write-Host "Creating Railway project..." -ForegroundColor Yellow
railway init

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Go to Railway dashboard: https://railway.app" -ForegroundColor Cyan
Write-Host "2. Connect your GitHub repository: thebucur/2026_01_WORDCLOUD" -ForegroundColor Cyan
Write-Host "3. Enable auto-deploy on push" -ForegroundColor Cyan
Write-Host "4. Generate a domain for your service" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or use the Railway web interface to create the project directly from GitHub!" -ForegroundColor Yellow
