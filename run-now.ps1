# RAAHI - Simple Run Script
Write-Host "Starting RAAHI Travel Marketplace..." -ForegroundColor Green
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js NOT FOUND!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download and install LTS version" -ForegroundColor White
    Write-Host "3. RESTART your terminal" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch { }
    exit 1
}

Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server - Port 5000' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Start Frontend  
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server - Port 5173' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Start AI Agent
Write-Host "Starting AI Agent Server..." -ForegroundColor Cyan
$aiAgentPath = Join-Path $PSScriptRoot "ai-agent"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aiAgentPath'; Write-Host 'AI Agent Server - Port 5001' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "All services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser and go to: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit (services will keep running)..."
try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch { }
