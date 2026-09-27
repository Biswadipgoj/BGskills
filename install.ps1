#Requires -Version 5.1
# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 Biswodip Goj - Biswodip Goj Unified Engineering
#
# One-command install into any project.
#
#   irm https://raw.githubusercontent.com/Biswadipgoj/BGskills/main/install.ps1 | iex
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/Biswadipgoj/BGskills/main/install.ps1))) -Target C:\path\to\project -Latest
#   .\install.ps1 -Target C:\path\to\project
#
# Installs: 8 skills + /dip commands + @dip agents, and clones the five upstream projects at their
# pinned, reviewed commits (-Latest for upstream HEAD). Nothing is added to your package.json.
# Safe under `irm | iex`: it never calls `exit` (that would close your terminal) and restores your
# $ErrorActionPreference when it finishes.
[CmdletBinding()]
param(
  [string] $Target = ".",
  [switch] $Latest,
  [switch] $Pinned,
  [switch] $WithTools,
  [switch] $Update,
  [Parameter(ValueFromRemainingArguments = $true)] [string[]] $Rest
)

function Install-Biswodip {
  $Repo = if ($env:BISWODIP_REPO) { $env:BISWODIP_REPO } else { "https://github.com/Biswadipgoj/BGskills.git" }
  $HomeDir = if ($env:BISWODIP_HOME) { $env:BISWODIP_HOME } else { Join-Path $HOME ".biswodip-goj-unified-engineering" }

  foreach ($tool in @("git", "node")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "$tool is required (git: https://git-scm.com / Node.js >= 18.17: https://nodejs.org)." }
  }
  node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>18||(a===18&&b>=17)?0:1)"
  if ($LASTEXITCODE -ne 0) { throw "Node.js >= 18.17 is required - found $(node -v)." }
  if (-not (Test-Path -LiteralPath $Target -PathType Container)) { throw "target directory not found: $Target" }

  $local = if ($PSScriptRoot) { Join-Path $PSScriptRoot "bin/biswodip.mjs" } else { $null }
  if ($local -and (Test-Path -LiteralPath $local)) {
    $Pkg = $PSScriptRoot                                           # running from a clone or an unzipped copy
  } elseif (Test-Path -LiteralPath (Join-Path $HomeDir ".git")) {
    Write-Host "> updating $HomeDir" -ForegroundColor Cyan
    git -C $HomeDir pull --quiet --ff-only
    if ($LASTEXITCODE -ne 0) { Write-Warning "could not update $HomeDir (offline or local changes) - using the copy already there" }
    $Pkg = $HomeDir
  } elseif (Test-Path -LiteralPath $HomeDir) {
    throw "$HomeDir exists but is not a git clone - move it aside or set BISWODIP_HOME to another folder."
  } else {
    Write-Host "> cloning $Repo -> $HomeDir" -ForegroundColor Cyan
    git clone --quiet --depth 1 $Repo $HomeDir
    if ($LASTEXITCODE -ne 0) { throw "could not clone $Repo - check your network, or set BISWODIP_REPO." }
    $Pkg = $HomeDir
  }

  $resolved = (Resolve-Path -LiteralPath $Target).Path
  $cliArgs = @("install", "--root", $resolved)
  if ($Latest) { $cliArgs += "--latest" }
  if ($Pinned) { $cliArgs += "--pinned" }
  if ($WithTools) { $cliArgs += "--with-tools" }
  if ($Update) { $cliArgs += "--update" }
  if ($Rest) { $cliArgs += $Rest }

  Write-Host "> installing into $resolved" -ForegroundColor Cyan
  node (Join-Path $Pkg "bin/biswodip.mjs") @cliArgs
  if ($LASTEXITCODE -ne 0) { throw "install did not finish cleanly - the INTEGRATION RECORD above says which step failed. Re-running is safe." }
  Write-Host "`nOK Ready. Open Claude Code in $resolved and run /dip <your goal> (or @dip)." -ForegroundColor Green
}

$previousPreference = $ErrorActionPreference
try {
  $ErrorActionPreference = "Stop"
  Install-Biswodip
} catch {
  Write-Host "x $($_.Exception.Message)" -ForegroundColor Red
  $global:LASTEXITCODE = 1
} finally {
  $ErrorActionPreference = $previousPreference
}
