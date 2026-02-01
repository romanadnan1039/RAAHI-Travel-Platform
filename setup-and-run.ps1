# RAAHI - Complete Setup and Run Script
# This script will install dependencies, set up database, and start all services

Write-Host "🚀 RAAHI Travel Marketplace - Complete Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 1: Install Backend Dependencies
Write-Host "🔧 Step 1/6: Installing Backend dependencies..." -ForegroundColor Cyan
Set-Location backend
if (Test-Path "node_modules") {
    Write-Host "   ⏭️  Backend dependencies already installed" -ForegroundColor Gray
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend installation failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
}
Set-Location ..

# Step 2: Install Frontend Dependencies
Write-Host ""
Write-Host "🎨 Step 2/6: Installing Frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
if (Test-Path "node_modules") {
    Write-Host "   ⏭️  Frontend dependencies already installed" -ForegroundColor Gray
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
}
Set-Location ..

# Step 3: Install AI Agent Dependencies
Write-Host ""
Write-Host "🤖 Step 3/6: Installing AI Agent dependencies..." -ForegroundColor Cyan
Set-Location ai-agent
if (Test-Path "node_modules") {
    Write-Host "   ⏭️  AI Agent dependencies already installed" -ForegroundColor Gray
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ AI Agent installation failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "   ✅ AI Agent dependencies installed" -ForegroundColor Green
}
Set-Location ..

# Step 4: Setup Database
Write-Host ""
Write-Host "🗄️  Step 4/6: Setting up database..." -ForegroundColor Cyan
Set-Location backend

# Generate Prisma Client
Write-Host "   📝 Generating Prisma Client..." -ForegroundColor Gray
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Prisma generate failed - database might not be set up yet" -ForegroundColor Yellow
    Write-Host "   💡 Make sure PostgreSQL is running and DATABASE_URL in .env is correct" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Prisma Client generated" -ForegroundColor Green
}

# Run Migrations
Write-Host "   📝 Running database migrations..." -ForegroundColor Gray
npx prisma migrate dev --name init 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database migrations completed" -ForegroundColor Green
    
    # Seed Database
    Write-Host "   📝 Seeding database with Pakistani data..." -ForegroundColor Gray
    npm run prisma:seed 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Seeding failed (might already be seeded)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Migrations failed - database might already be set up or PostgreSQL not running" -ForegroundColor Yellow
    Write-Host "   💡 Check your DATABASE_URL in backend/.env" -ForegroundColor Yellow
}

Set-Location ..

# Step 5: Check Environment Files
Write-Host ""
Write-Host "⚙️  Step 5/6: Checking environment configuration..." -ForegroundColor Cyan
if (Test-Path "backend\.env") {
    Write-Host "   ✅ Backend .env found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend .env not found - using defaults" -ForegroundColor Yellow
}

if (Test-Path "frontend\.env") {
    Write-Host "   ✅ Frontend .env found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend .env not found - using defaults" -ForegroundColor Yellow
}

if (Test-Path "ai-agent\.env") {
    Write-Host "   ✅ AI Agent .env found" -ForegroundColor Green
    $aiEnv = Get-Content "ai-agent\.env" -Raw
    if ($aiEnv -match "sk-your-openai-api-key-here") {
        Write-Host "   ⚠️  Please update OPENAI_API_KEY in ai-agent/.env" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  AI Agent .env not found - AI features may not work" -ForegroundColor Yellow
}

# Step 6: Start Services
Write-Host ""
Write-Host "🚀 Step 6/6: Starting all services..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "   🔧 Starting Backend (port 5000)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server - Port 5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "   🎨 Starting Frontend (port 5173)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server - Port 5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

# Start AI Agent
Write-Host "   🤖 Starting AI Agent (port 5001)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai-agent'; Write-Host '🤖 AI Agent Server - Port 5001' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ Setup Complete! Services are starting..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Services will open in separate windows:" -ForegroundColor Yellow
Write-Host "   • Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   • AI Agent: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open your browser and go to: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Test Accounts (after seeding):" -ForegroundColor Yellow
Write-Host "   Tourist: tourist1@example.com / password123" -ForegroundColor White
Write-Host "   Agency:  ahmed@adventurepakistan.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   • Make sure PostgreSQL is running" -ForegroundColor White
Write-Host "   • Update DATABASE_URL in backend/.env if needed" -ForegroundColor White
Write-Host "   • Add your OpenAI API key to ai-agent/.env for AI features" -ForegroundColor White
Write-Host ""
Write-Host 'Press any key to exit this window (services will keep running)...' -ForegroundColor Gray
try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch { }
