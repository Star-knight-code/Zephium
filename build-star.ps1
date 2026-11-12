# Builds the Star Browser installer on Windows 10/11 x64.
# Run from the repository root in PowerShell:  .\build-star.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Need($command, $hint) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        Write-Host "Missing: $command. $hint" -ForegroundColor Red
        exit 1
    }
}
Need git   'Install Git for Windows: winget install Git.Git'
Need cargo 'Install Rust: winget install Rustlang.Rustup  (then reopen PowerShell)'
Need node  'Install Node.js 24: winget install OpenJS.NodeJS'

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$msvc = if (Test-Path $vswhere) {
    & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
}
if (-not $msvc) {
    Write-Host 'Missing: MSVC C++ Build Tools with the "Desktop development with C++" workload.' -ForegroundColor Red
    Write-Host 'Install: winget install Microsoft.VisualStudio.2022.BuildTools  then add that workload in the Visual Studio Installer.'
    exit 1
}

$wanted = (Get-Content .node-version).Trim()
$have = (node --version).TrimStart('v')
if ($have.Split('.')[0] -ne $wanted.Split('.')[0]) {
    Write-Host "Node $have found; this project needs Node $($wanted.Split('.')[0]).x." -ForegroundColor Red
    exit 1
}

# pnpm at the version package.json pins.
corepack enable
if ($LASTEXITCODE -ne 0) { Write-Host 'corepack enable failed; try an elevated PowerShell once.' -ForegroundColor Red; exit 1 }

pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location desktop
pnpm tauri build --bundles nsis --config tauri.star.conf.json
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) { exit $code }

$setup = Get-ChildItem target\release\bundle\nsis\*-setup.exe | Sort-Object LastWriteTime | Select-Object -Last 1
Write-Host "`nBuilt: $($setup.FullName)" -ForegroundColor Green
