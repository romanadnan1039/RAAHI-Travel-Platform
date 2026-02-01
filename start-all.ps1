# RAAHI - Start All Services Script
# Run this script to start all three services

Write-Host "🚀 Starting RAAHI Travel Marketplace..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running (optional check)
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow

# Start Backend
Write-Host ""
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend Server' -ForegroundColor Green; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start AI Agent
Write-Host "🤖 Starting AI Agent Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai-agent'; Write-Host 'AI Agent Server' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Services will open in separate windows:" -ForegroundColor Yellow
Write-Host "   - Backend: http://localhost:5000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - AI Agent: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open http://localhost:5173 in your browser!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Make sure you have:" -ForegroundColor Yellow
Write-Host "   1. Installed dependencies (npm install in each folder)" -ForegroundColor White
Write-Host "   2. Set up PostgreSQL database" -ForegroundColor White
Write-Host "   3. Created .env files with correct configuration" -ForegroundColor White
Write-Host "   4. Run database migrations and seed" -ForegroundColor White
Write-Host ""
