# Extrai o mapa 3D do Cyberpunk 2077 (a partir da SUA instalação) e gera os
# dados que o app usa em web/map3d/: world.glb, buildings.bin, roads.bin, manifest.json.
# Usa WolvenKit CLI + o exportador do open77_3dmap (MIT).
# Uso: powershell -ExecutionPolicy Bypass -File tools\extract-map.ps1 [-Game "<pasta do jogo>"]
param(
  [string]$Game = "C:\Program Files (x86)\Steam\steamapps\common\Cyberpunk 2077"
)
$ErrorActionPreference = "Stop"
$tools = $PSScriptRoot
$wk = Join-Path $tools "wolvenkit\WolvenKit.CLI.exe"
$root = Join-Path $tools "open77_3dmap"          # o exportador lê raw/, raw-dds/, json/, json-traffic/ daqui
$content = Join-Path $Game "archive\pc\content"
$ep1 = Join-Path $Game "archive\pc\ep1"
$out = Join-Path $tools "..\web\map3d"

function Step($m) { Write-Host ""; Write-Host "== $m" -ForegroundColor Cyan }

Set-Location $root

Step "1/6 Malhas do mapa 3D (3dmap)"
& $wk uncook "$content\basegame_1_engine.archive" "$content\basegame_4_gamedata.archive" -r "(?i)3dmap" -o cooked -or raw
if ($LASTEXITCODE) { throw "uncook 3dmap falhou" }

Step "2/6 Nuvens de pontos dos prédios (16 bits)"
& $wk uncook "$content\basegame_1_engine.archive" "$content\basegame_4_gamedata.archive" -r "(?i)3dmap.*_data" --uext dds -o cooked-dds -or raw-dds
if ($LASTEXITCODE) { throw "uncook dds falhou" }

Step "3/6 Rede de tráfego (ruas)"
& $wk unbundle "$ep1\ep1_1_nightcity.archive" -r "(?i)_generated.traffic.all\.(lane_polygons|traffic_persistent|lane_connections)" -o traffic-ep1
if ($LASTEXITCODE) { throw "unbundle traffic falhou" }

Step "4/6 Convertendo para JSON"
New-Item -ItemType Directory -Force json, json-traffic | Out-Null
$ent = Get-ChildItem cooked -Recurse -Filter "3dmap_view.ent" | Select-Object -First 1
$soup = Get-ChildItem cooked -Recurse -Filter "3dmap_triangle_soup.mesh" | Select-Object -First 1
if (-not $ent -or -not $soup) { throw "3dmap_view.ent ou 3dmap_triangle_soup.mesh não encontrados" }
& $wk convert serialize $ent.FullName -o json
& $wk convert serialize $soup.FullName -o json
foreach ($f in Get-ChildItem traffic-ep1 -Recurse -File) {
  & $wk convert serialize $f.FullName -o json-traffic
}
Get-ChildItem json, json-traffic | Select-Object Name, Length | Format-Table -AutoSize

Step "5/6 Exportando (Python)"
python -m pip install --quiet numpy trimesh networkx
if ($LASTEXITCODE) { throw "pip install falhou" }
python tools\export_web.py out
if ($LASTEXITCODE) { throw "export_web falhou" }

Step "6/6 Compactando o world.glb"
Push-Location out
npx --yes @gltf-transform/cli weld world.raw.glb w.glb
npx --yes @gltf-transform/cli quantize w.glb world.glb
Pop-Location

New-Item -ItemType Directory -Force $out | Out-Null
Copy-Item out\world.glb, out\buildings.bin, out\roads.bin, out\manifest.json $out -Force
Write-Host ""
Write-Host "Mapa gerado em $((Resolve-Path $out).Path)" -ForegroundColor Green
