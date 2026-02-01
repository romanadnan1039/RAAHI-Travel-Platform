# RAAHI Deployment Preparation Script
# This script helps prepare your code for deployment

Write-Host "`n🚀 RAAHI Deployment Preparation`n" -ForegroundColor Cyan

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installing, restart PowerShell and run this script again.`n" -ForegroundColor Yellow
    exit 1
}

# Check if repository is initialized
Write-Host "`nChecking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
    
    # Check if remote is set
    try {
        $remote = git remote get-url origin 2>$null
        Write-Host "✅ Remote repository: $remote" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  No remote repository set yet" -ForegroundColor Yellow
        Write-Host "You'll need to create a GitHub repo and add it as remote" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Git repository not initialized yet" -ForegroundColor Yellow
    Write-Host "`nDo you want to initialize Git now? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "`nInitializing Git repository..." -ForegroundColor Yellow
        git init
        Write-Host "✅ Git repository initialized" -ForegroundColor Green
    }
}

# Check if node_modules exist (they shouldn't be committed)
Write-Host "`nChecking for large files..." -ForegroundColor Yellow
$nodeModulesSize = 0
if (Test-Path "node_modules") {
    $nodeModulesSize += (Get-ChildItem "node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
if (Test-Path "backend/node_modules") {
    $nodeModulesSize += (Get-ChildItem "backend/node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
if (Test-Path "frontend/node_modules") {
    $nodeModulesSize += (Get-ChildItem "frontend/node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}
if (Test-Path "ai-agent/node_modules") {
    $nodeModulesSize += (Get-ChildItem "ai-agent/node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
}

if ($nodeModulesSize -gt 0) {
    $sizeMB = [math]::Round($nodeModulesSize / 1MB, 2)
    Write-Host "✅ node_modules found ($sizeMB MB) - Will be ignored by Git" -ForegroundColor Green
}

# Check .gitignore
Write-Host "`nChecking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore not found - creating one..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Uploads
uploads/
temp/

# Prisma
prisma/migrations/

# Testing
coverage/
.nyc_output/
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "✅ .gitignore created" -ForegroundColor Green
}

# Show deployment files
Write-Host "`n📁 Deployment Configuration Files:" -ForegroundColor Cyan
$deploymentFiles = @(
    "vercel.json",
    "backend/railway.json",
    "backend/env.production.template",
    "frontend/env.production.template",
    "DEPLOYMENT_GUIDE.md",
    "DEPLOY-NOW.md"
)

foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create a GitHub account (if you don't have one): https://github.com/signup" -ForegroundColor White
Write-Host "2. Create a new repository on GitHub: https://github.com/new" -ForegroundColor White
Write-Host "   - Name it: RAAHI-Travel-Platform" -ForegroundColor White
Write-Host "   - Make it PUBLIC" -ForegroundColor White
Write-Host "   - Don't initialize with README" -ForegroundColor White
Write-Host "3. Follow the instructions in DEPLOY-NOW.md" -ForegroundColor White
Write-Host "4. Or run these commands to push to GitHub:" -ForegroundColor White
Write-Host ""
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host "   git commit -m 'RAAHI Travel Platform - Ready for deployment'" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/RAAHI-Travel-Platform.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ After pushing to GitHub, follow DEPLOY-NOW.md for the rest! ✨`n" -ForegroundColor Magenta

# Open deployment guide
Write-Host "Would you like to open the deployment guide now? (Y/N)" -ForegroundColor Cyan
$openGuide = Read-Host
if ($openGuide -eq "Y" -or $openGuide -eq "y") {
    Start-Process "DEPLOY-NOW.md"
}
