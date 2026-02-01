# RAAHI - Install All Dependencies Script

Write-Host "📦 Installing dependencies for RAAHI..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install Backend dependencies
Write-Host ""
Write-Host "🔧 Installing Backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install Frontend dependencies
Write-Host ""
Write-Host "🎨 Installing Frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install AI Agent dependencies
Write-Host ""
Write-Host "🤖 Installing AI Agent dependencies..." -ForegroundColor Cyan
Set-Location ai-agent
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AI Agent installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Set up PostgreSQL database" -ForegroundColor White
Write-Host "   2. Create .env files (see SETUP.md)" -ForegroundColor White
Write-Host "   3. Run: cd backend && npx prisma migrate dev" -ForegroundColor White
Write-Host "   4. Run: cd backend && npm run prisma:seed" -ForegroundColor White
Write-Host "   5. Run: .\start-all.ps1" -ForegroundColor White
Write-Host ""
