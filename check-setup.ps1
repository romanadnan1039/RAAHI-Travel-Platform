# Check if everything is ready to run

Write-Host "🔍 Checking RAAHI Setup..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ NOT FOUND" -ForegroundColor Red
    Write-Host "   Install from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ $npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ NOT FOUND" -ForegroundColor Red
    $allGood = $false
}

# Check PostgreSQL (basic check)
Write-Host "Checking PostgreSQL..." -NoNewline
try {
    $pgVersion = psql --version 2>&1
    if ($pgVersion -match "psql") {
        Write-Host " ✅ Found" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  May not be in PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ⚠️  Not found in PATH (may still be installed)" -ForegroundColor Yellow
}

# Check dependencies
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan

if (Test-Path "backend\node_modules") {
    Write-Host "  Backend: ✅ Installed" -ForegroundColor Green
} else {
    Write-Host "  Backend: ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "frontend\node_modules") {
    Write-Host "  Frontend: ✅ Installed" -ForegroundColor Green
} else {
    Write-Host "  Frontend: ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "ai-agent\node_modules") {
    Write-Host "  AI Agent: ✅ Installed" -ForegroundColor Green
} else {
    Write-Host "  AI Agent: ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check env files
Write-Host ""
Write-Host "Checking configuration files..." -ForegroundColor Cyan

if (Test-Path "backend\.env") {
    Write-Host "  Backend .env: ✅ Found" -ForegroundColor Green
} else {
    Write-Host "  Backend .env: ⚠️  Not found (will use defaults)" -ForegroundColor Yellow
}

if (Test-Path "frontend\.env") {
    Write-Host "  Frontend .env: ✅ Found" -ForegroundColor Green
} else {
    Write-Host "  Frontend .env: ⚠️  Not found (will use defaults)" -ForegroundColor Yellow
}

if (Test-Path "ai-agent\.env") {
    Write-Host "  AI Agent .env: ✅ Found" -ForegroundColor Green
} else {
    Write-Host "  AI Agent .env: ⚠️  Not found (AI features may not work)" -ForegroundColor Yellow
}

# Check database
Write-Host ""
Write-Host "Checking database setup..." -ForegroundColor Cyan
if (Test-Path "backend\prisma\schema.prisma") {
    Write-Host "  Prisma schema: ✅ Found" -ForegroundColor Green
} else {
    Write-Host "  Prisma schema: ❌ Not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "✅ Setup looks good! You can run: .\setup-and-run.ps1" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some issues found. Please fix them before running." -ForegroundColor Yellow
    Write-Host ""
    Write-Host 'Quick fixes:' -ForegroundColor Cyan
    Write-Host '  1. Install Node.js: https://nodejs.org/' -ForegroundColor White
    Write-Host '  2. Install dependencies: .\install-dependencies.ps1' -ForegroundColor White
    Write-Host '  3. Create .env files (see RUN.md)' -ForegroundColor White
}

Write-Host ""
