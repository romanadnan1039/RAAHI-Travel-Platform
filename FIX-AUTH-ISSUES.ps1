# RAAHI - Fix Authentication Issues Script
# This script helps resolve common authentication and booking errors

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAAHI Authentication Fix Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Reset the database with fresh data" -ForegroundColor White
Write-Host "  2. Open a browser window to clear your auth data" -ForegroundColor White
Write-Host "  3. Provide you with test credentials" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you want to continue? (Y/N)"

if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "[1/3] Resetting database..." -ForegroundColor Green

# Navigate to backend and run seed
Push-Location backend
try {
    Write-Host "Running database seed..." -ForegroundColor Yellow
    npm run prisma:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database reset successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database reset failed!" -ForegroundColor Red
        Write-Host "Please check if PostgreSQL is running and DATABASE_URL is correct." -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "❌ Error resetting database: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "[2/3] Opening browser to clear authentication data..." -ForegroundColor Green

# Open the clear data HTML file
$clearDataFile = Join-Path $PSScriptRoot "CLEAR-BROWSER-DATA.html"
if (Test-Path $clearDataFile) {
    Start-Process $clearDataFile
    Write-Host "✅ Browser window opened!" -ForegroundColor Green
    Write-Host "   Click 'Clear Browser Data' in the browser window." -ForegroundColor Yellow
} else {
    Write-Host "❌ CLEAR-BROWSER-DATA.html not found!" -ForegroundColor Red
    Write-Host "   Please manually clear localStorage in your browser." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/3] Test Credentials" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOGIN CREDENTIALS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "TOURIST LOGIN:" -ForegroundColor Yellow
Write-Host "  Email:    " -NoNewline -ForegroundColor White
Write-Host "tourist1@example.com" -ForegroundColor Green
Write-Host "  Password: " -NoNewline -ForegroundColor White
Write-Host "tourist123" -ForegroundColor Green
Write-Host ""

Write-Host "AGENCY LOGIN:" -ForegroundColor Yellow
Write-Host "  Email:    " -NoNewline -ForegroundColor White
Write-Host "hunza@travels.com" -ForegroundColor Green
Write-Host "  Password: " -NoNewline -ForegroundColor White
Write-Host "agency123" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Click 'Clear Browser Data' in the opened browser window" -ForegroundColor White
Write-Host "  2. Go to http://localhost:5173" -ForegroundColor White
Write-Host "  3. Login with credentials above" -ForegroundColor White
Write-Host "  4. Test booking functionality" -ForegroundColor White
Write-Host ""

Write-Host "Full credentials list available in: TEST-CREDENTIALS.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
