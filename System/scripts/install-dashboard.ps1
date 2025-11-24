<#
Copies the DRIVECASH Dashboard build from the desktop attachment into the app's public folder.
Usage (PowerShell):
  .\scripts\install-dashboard.ps1 -Source "C:\Users\pcjec\OneDrive\Desktop\DRIVECASH Dashboard\build"
If Source not provided, the script will try the default path used when attaching in this session.
#>
param(
  [string]$Source = "C:\Users\pcjec\OneDrive\Desktop\DRIVECASH Dashboard\build",
  [string]$Dest = "public\\drivecash-dashboard"
)

if (-not (Test-Path $Source)) {
  Write-Error "Source path '$Source' not found. Please point to the dashboard build folder."
  exit 1
}

if (Test-Path $Dest) {
  Write-Host "Removing existing destination: $Dest"
  Remove-Item -Recurse -Force $Dest
}

Write-Host "Copying dashboard build from $Source to $Dest..."
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item -Path (Join-Path $Source '*') -Destination $Dest -Recurse -Force

Write-Host "Dashboard installed. You can now open /drivecash-dashboard/index.html in the app."
