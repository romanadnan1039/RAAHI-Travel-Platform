# RAAHI - Complete Startup Script
# This script will start all services for you

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAAHI TRAVEL MARKETPLACE" -ForegroundColor Green
Write-Host "  Complete Startup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;$env:APPDATA\npm"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Kill any existing Node processes on our ports
Write-Host "[INFO] Checking for existing services..." -ForegroundColor Yellow
$ports = @(5000, 5001, 5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Write-Host "[INFO] Stopping process on port $port..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[INFO] Starting all services..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/3] Starting Backend Server (port 5000)..." -ForegroundColor Yellow
$backendScript = @"
cd '$scriptDir\backend'
`$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  BACKEND SERVER - Port 5000' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
Start-Sleep -Seconds 4

# Start Frontend
Write-Host "[2/3] Starting Frontend Server (port 5173)..." -ForegroundColor Yellow
$frontendScript = @"
cd '$scriptDir\frontend'
`$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  FRONTEND SERVER - Port 5173' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
Start-Sleep -Seconds 3

# Start AI Agent
Write-Host "[3/3] Starting AI Agent Server (port 5001)..." -ForegroundColor Yellow
$aiScript = @"
cd '$scriptDir\ai-agent'
`$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  AI AGENT SERVER - Port 5001' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $aiScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are starting in separate windows..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Wait 10-15 seconds for services to start, then:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open your browser and go to:" -ForegroundColor White
Write-Host "  http://localhost:5173" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  AI Agent: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "  1. If backend shows database errors, PostgreSQL needs to be set up" -ForegroundColor White
Write-Host "  2. Check the backend window for any error messages" -ForegroundColor White
Write-Host "  3. The frontend should work even if backend has database issues" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window (services will keep running)..." -ForegroundColor Gray
try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch { }
