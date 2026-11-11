# Copia o mod Neuroport para a pasta de mods do Cyber Engine Tweaks.
# Uso:  powershell -ExecutionPolicy Bypass -File install.ps1  [-Game "D:\...\Cyberpunk 2077"]
param(
  [string]$Game = "C:\Program Files (x86)\Steam\steamapps\common\Cyberpunk 2077"
)

$cet = Join-Path $Game "bin\x64\plugins\cyber_engine_tweaks"
if (-not (Test-Path $cet)) {
  Write-Host ""
  Write-Host "  Cyber Engine Tweaks nao encontrado em:" -ForegroundColor Red
  Write-Host "  $cet"
  Write-Host "  Instale o CET primeiro (veja o README) e rode este script de novo."
  exit 1
}

$src = Join-Path $PSScriptRoot "mod\neuroport"
$dst = Join-Path $cet "mods\neuroport"
$old = Join-Path $cet "mods\holophone"   # nome antigo do mod
if (Test-Path $old) { Remove-Item $old -Recurse -Force; Write-Host "  Versao antiga (holophone) removida." }
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item (Join-Path $src "init.lua") $dst -Force

Write-Host ""
Write-Host "  Mod instalado em: $dst" -ForegroundColor Cyan
Write-Host "  Agora rode start.bat e abra o jogo."
