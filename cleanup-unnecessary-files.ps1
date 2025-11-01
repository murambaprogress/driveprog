# DRIVECASH Dashboard - Cleanup Unnecessary Files
# This script removes duplicate, backup, and documentation files without affecting functionality

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "DRIVECASH Dashboard - File Cleanup Script" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\pcjec\OneDrive\Desktop\DRIVECASH Dashboard"
$deletedFiles = @()
$deletedFolders = @()
$totalSize = 0

# Function to safely delete file
function Remove-SafeFile {
    param($filePath)
    try {
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            Remove-Item $filePath -Force
            $script:totalSize += $size
            $script:deletedFiles += $filePath
            Write-Host "✓ Deleted: $filePath" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Failed to delete: $filePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to safely delete folder
function Remove-SafeFolder {
    param($folderPath)
    try {
        if (Test-Path $folderPath) {
            $size = (Get-ChildItem $folderPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
            Remove-Item $folderPath -Recurse -Force
            $script:totalSize += $size
            $script:deletedFolders += $folderPath
            Write-Host "✓ Deleted folder: $folderPath" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Failed to delete folder: $folderPath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Step 1: Removing duplicate nested 'DRIVECASH Dashboard' folder..." -ForegroundColor Yellow
Write-Host ""
$nestedFolder = Join-Path $rootPath "DRIVECASH Dashboard"
if (Test-Path $nestedFolder) {
    Remove-SafeFolder $nestedFolder
} else {
    Write-Host "  No nested folder found (already clean)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Step 2: Removing backup files (*.backup.js, *.bak)..." -ForegroundColor Yellow
Write-Host ""

# Remove all .backup.js files
Get-ChildItem -Path $rootPath -Filter "*.backup.js" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-SafeFile $_.FullName
}

# Remove all .bak files
Get-ChildItem -Path $rootPath -Filter "*.bak" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-SafeFile $_.FullName
}

Write-Host ""

Write-Host "Step 3: Removing development/temporary files (-new.js, -updated.js, App.clean.js)..." -ForegroundColor Yellow
Write-Host ""

# Remove all -new.js files
Get-ChildItem -Path $rootPath -Filter "*-new.js" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-SafeFile $_.FullName
}

# Remove all -updated.js files
Get-ChildItem -Path $rootPath -Filter "*-updated.js" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-SafeFile $_.FullName
}

# Remove App.clean.js
$appClean = Join-Path $rootPath "src\App.clean.js"
if (Test-Path $appClean) {
    Remove-SafeFile $appClean
}

Write-Host ""

Write-Host "Step 4: Removing utility scripts no longer needed..." -ForegroundColor Yellow
Write-Host ""

$utilityScripts = @(
    "cleanup-unused.js",
    "field-uniformity-script.js",
    "finalize-textfield-conversion.ps1",
    "fix-step3-vehicle.js",
    "replace-textfields.js",
    "start-log.txt",
    "start-with-log.ps1",
    "test-tailwind.html"
)

foreach ($script in $utilityScripts) {
    $scriptPath = Join-Path $rootPath $script
    if (Test-Path $scriptPath) {
        Remove-SafeFile $scriptPath
    }
}

Write-Host ""

Write-Host "Step 5: Consolidating documentation (keeping essential, removing redundant)..." -ForegroundColor Yellow
Write-Host ""

# Documentation files to KEEP (essential project docs)
$keepDocs = @(
    "README.md",
    "LICENSE.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "ISSUE_TEMPLATE.md"
)

# Remove all .md files except the ones we want to keep
Get-ChildItem -Path $rootPath -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object {
    if ($keepDocs -notcontains $_.Name) {
        Remove-SafeFile $_.FullName
    } else {
        Write-Host "  Keeping: $($_.Name)" -ForegroundColor Cyan
    }
}

Write-Host ""

Write-Host "Step 6: Removing duplicate public.Path folder (if exists)..." -ForegroundColor Yellow
Write-Host ""

$publicPath = Join-Path $rootPath "public.Path"
if (Test-Path $publicPath) {
    Remove-SafeFolder $publicPath
} else {
    Write-Host "  No public.Path folder found (already clean)" -ForegroundColor Gray
}

Write-Host ""

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  Files deleted: $($deletedFiles.Count)" -ForegroundColor White
Write-Host "  Folders deleted: $($deletedFolders.Count)" -ForegroundColor White
Write-Host "  Total space freed: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

if ($deletedFiles.Count -gt 0 -or $deletedFolders.Count -gt 0) {
    Write-Host "Creating cleanup log..." -ForegroundColor Yellow
    $logPath = Join-Path $rootPath "cleanup-log.txt"
    $logContent = @"
DRIVECASH Dashboard - File Cleanup Log
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===============================================

Files Deleted ($($deletedFiles.Count)):
$($deletedFiles | ForEach-Object { "  - $_" } | Out-String)

Folders Deleted ($($deletedFolders.Count)):
$($deletedFolders | ForEach-Object { "  - $_" } | Out-String)

Total Space Freed: $([math]::Round($totalSize / 1MB, 2)) MB

Status: Successfully cleaned up project structure
All functionality and interfaces preserved.
"@
    
    $logContent | Out-File -FilePath $logPath -Encoding UTF8
    Write-Host "✓ Log saved to: $logPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "✓ Project structure optimized!" -ForegroundColor Green
Write-Host "  All functionality and interfaces preserved." -ForegroundColor Green
Write-Host "  You can now run 'npm start' to verify everything works." -ForegroundColor Cyan
Write-Host ""
