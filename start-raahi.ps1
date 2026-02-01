# RAAHI - Start All Services
# This script starts backend, frontend, and AI agent services

Write-Host "🚀 Starting RAAHI Travel Marketplace..." -ForegroundColor Green
Write-Host ""

# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;$env:APPDATA\npm"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found in PATH!" -ForegroundColor Red
    Write-Host "Please ensure Node.js is installed and restart your terminal." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "🔧 Starting Backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'; Write-Host '🔧 Backend Server - Port 5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'; Write-Host '🎨 Frontend Server - Port 5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

# Start AI Agent
Write-Host "🤖 Starting AI Agent (port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai-agent'; `$env:Path += ';C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;`$env:APPDATA\npm'; Write-Host '🤖 AI Agent Server - Port 5001' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ All services are starting!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Services:" -ForegroundColor Yellow
Write-Host "   • Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   • AI Agent: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open your browser: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: Backend requires PostgreSQL database to be running." -ForegroundColor Yellow
Write-Host "   If you see database connection errors, make sure PostgreSQL is running" -ForegroundColor Yellow
Write-Host "   and update DATABASE_URL in backend/.env if needed." -ForegroundColor Yellow
Write-Host ""
