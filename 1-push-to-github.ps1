# Step 1: Push RAAHI to GitHub
# Run this AFTER installing Git and creating your GitHub repository

Write-Host "`n🚀 RAAHI - Push to GitHub`n" -ForegroundColor Cyan

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git first: https://git-scm.com/download/win`n" -ForegroundColor Yellow
    exit 1
}

# Initialize Git repository
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository already initialized`n" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git repository initialized`n" -ForegroundColor Green
}

# Configure Git user (if not already done)
$gitUser = git config --global user.name 2>$null
if (-not $gitUser) {
    Write-Host "⚠️  Git user not configured. Please enter your details:`n" -ForegroundColor Yellow
    $userName = Read-Host "Enter your name (e.g., John Doe)"
    $userEmail = Read-Host "Enter your email (e.g., john@example.com)"
    
    git config --global user.name "$userName"
    git config --global user.email "$userEmail"
    Write-Host "✅ Git user configured`n" -ForegroundColor Green
} else {
    Write-Host "✅ Git user already configured: $gitUser`n" -ForegroundColor Green
}

# Stage all files
Write-Host "Step 2: Staging all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ All files staged`n" -ForegroundColor Green

# Commit
Write-Host "Step 3: Creating commit..." -ForegroundColor Yellow
git commit -m "RAAHI Travel Platform - FYP Project Ready for Deployment"
Write-Host "✅ Commit created`n" -ForegroundColor Green

# Check for remote
$hasRemote = git remote get-url origin 2>$null
if ($hasRemote) {
    Write-Host "✅ Remote repository already configured: $hasRemote`n" -ForegroundColor Green
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "`n✅ Code pushed to GitHub successfully!`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  No remote repository configured yet`n" -ForegroundColor Yellow
    Write-Host "🌐 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: RAAHI-Travel-Platform" -ForegroundColor White
    Write-Host "3. Make it PUBLIC ✅" -ForegroundColor White
    Write-Host "4. Don't initialize with README" -ForegroundColor White
    Write-Host "5. Click 'Create repository'`n" -ForegroundColor White
    
    Write-Host "After creating the repository, enter your GitHub username:" -ForegroundColor Cyan
    $githubUsername = Read-Host
    
    $repoUrl = "https://github.com/$githubUsername/RAAHI-Travel-Platform.git"
    
    Write-Host "`nAdding remote repository..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    git branch -M main
    
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    try {
        git push -u origin main
        Write-Host "`n✅ Code pushed to GitHub successfully!`n" -ForegroundColor Green
        Write-Host "Your repository: https://github.com/$githubUsername/RAAHI-Travel-Platform`n" -ForegroundColor Cyan
    } catch {
        Write-Host "`n⚠️  Push failed. This might be because:" -ForegroundColor Yellow
        Write-Host "  • You need to authenticate with GitHub" -ForegroundColor White
        Write-Host "  • The repository doesn't exist yet" -ForegroundColor White
        Write-Host "`nTry running this command manually:" -ForegroundColor Yellow
        Write-Host "  git push -u origin main`n" -ForegroundColor Cyan
    }
}

Write-Host "🎉 Ready for Railway & Vercel deployment!`n" -ForegroundColor Green
Write-Host "Next: Open DEPLOY-NOW.md and follow from Step 2 (Deploy to Railway)`n" -ForegroundColor Cyan
