# Monta o pacote de lançamento (Nexus Mods) em dist\Neuroport-<versão>.zip
#
# Estrutura do zip (instalável pelo Vortex/MO2 ou extraindo na pasta do jogo):
#   bin\x64\plugins\cyber_engine_tweaks\mods\neuroport\init.lua            <- mod CET
#   bin\x64\plugins\cyber_engine_tweaks\mods\neuroport\companion\          <- servidor + app do celular
#       Start Neuroport.bat, server\, web\, tools\gamefiles\, README.txt, LICENSES\
#
# Uso: powershell -ExecutionPolicy Bypass -File tools\package.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

$lua = Get-Content (Join-Path $root 'mod\neuroport\init.lua') -Raw
if ($lua -notmatch 'local VERSION = "([^"]+)"') { throw 'VERSION não encontrada no init.lua' }
$version = $Matches[1]

$dist = Join-Path $root 'dist'
$stage = Join-Path $dist "stage-$version"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
$mod = Join-Path $stage 'bin\x64\plugins\cyber_engine_tweaks\mods\neuroport'
$comp = Join-Path $mod 'companion'
New-Item -ItemType Directory -Force $comp | Out-Null

Copy-Item (Join-Path $root 'mod\neuroport\init.lua') $mod

# servidor (sem o código de pareamento local)
New-Item -ItemType Directory -Force (Join-Path $comp 'server') | Out-Null
foreach ($f in 'server.js', 'mock.js', 'presskey.ps1') { Copy-Item (Join-Path $root "server\$f") (Join-Path $comp 'server') }

# app do celular (sem o cache de avatares deste PC)
robocopy (Join-Path $root 'web') (Join-Path $comp 'web') /E /XD avatars /NFL /NDL /NJH /NJS /NP | Out-Null
New-Item -ItemType Directory -Force (Join-Path $comp 'web\avatars') | Out-Null

# extrator de imagens do jogo (Python)
New-Item -ItemType Directory -Force (Join-Path $comp 'tools\gamefiles') | Out-Null
Get-ChildItem (Join-Path $root 'tools\gamefiles') -File | Where-Object { $_.Extension -in '.py', '.json' } |
  ForEach-Object { Copy-Item $_.FullName (Join-Path $comp 'tools\gamefiles') }

# iniciar
@"
@echo off
title Neuroport Server
cd /d "%~dp0"
where node >nul 2>nul || (echo. & echo   Node.js not found. Install the LTS version from https://nodejs.org and run this again. & echo. & pause & exit /b 1)
node server\server.js --gui %*
pause
"@ | Set-Content -Encoding ASCII (Join-Path $comp 'Start Neuroport.bat')

Copy-Item (Join-Path $root 'release\README.txt') $comp
Copy-Item (Join-Path $root 'release\CREDITS.txt') $comp
New-Item -ItemType Directory -Force (Join-Path $comp 'LICENSES') | Out-Null
Copy-Item (Join-Path $root 'tools\open77_3dmap\LICENSE') (Join-Path $comp 'LICENSES\open2077-map3d-LICENSE.txt')
Copy-Item (Join-Path $root 'tools\open77_3dmap\NOTICE') (Join-Path $comp 'LICENSES\open2077-map3d-NOTICE.txt')

$zip = Join-Path $dist "Neuroport-$version.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage 'bin') -DestinationPath $zip
Remove-Item $stage -Recurse -Force
$mb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Host "  Pacote: $zip ($mb MB)"
