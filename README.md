# Neuroport

**Your phone becomes V's.** A second-screen companion for Cyberpunk 2077: messages, calls, the map, your garage, the radio, shards and more, live from the game on your phone's browser over your home Wi-Fi.

<img width="718" height="360" alt="garage_summon" src="https://github.com/user-attachments/assets/f8594b6e-c6a8-4011-8c10-14d9c1b9506c" />

Players: download the ready-to-install package from Nexus Mods. This repository holds the source code.

## How it works

```
[phone browser] --Wi-Fi--> [Neuroport server (Node.js) on the PC] --files--> [CET mod in the game]
```

Cyber Engine Tweaks mods have no network access, so the mod and the server talk through files in the mod's folder:

- The mod writes the game state to `state.json` (fast data), `world.json` (map markers, journal, shop), `shards.json` and `probe.json` (diagnostics).
- The server writes commands to `inbox.txt`. The mod runs each one and acknowledges it in `state.json`.

The server serves the phone app, pushes state to it over Server-Sent Events, and runs a local control panel at `http://localhost:7077/admin`. Nothing is sent to the internet. The phone pairs with a 12-character code.

## Repository layout

| Path | What it is |
|---|---|
| `mod/neuroport/init.lua` | The CET mod (Lua). Reads the game through CET/RED4ext/Codeware and runs the phone's commands. |
| `server/server.js` | Local HTTP server: phone app, state stream, command queue, control panel, image extraction. No dependencies besides Node.js. |
| `server/mock.js` | Simulated game state, for working on the app without the game (`start-mock.bat`). |
| `server/presskey.ps1` | Sends the photo-mode key (N) to the game window; used by the phone's Camera app. |
| `web/` | The phone app (plain HTML/CSS/JS, no build step) and the control panel (`web/admin`). |
| `tools/gamefiles/` | Python scripts that read portraits, vehicle images, map icons and the ringtone from your own game archives. |
| `tools/extract-map.ps1` | Builds the city map data in `web/map3d/` from your game install (WolvenKit CLI + Open2077 exporter). |
| `tools/package.ps1` | Builds the Nexus package `dist/Neuroport-<version>.zip`. |

## Running from source

Requirements: Cyberpunk 2077 2.x on Windows, [Cyber Engine Tweaks](https://github.com/maximegmd/CyberEngineTweaks), [RED4ext](https://github.com/wopss/RED4ext), [Codeware](https://github.com/psiberx/cp2077-codeware), [Node.js LTS](https://nodejs.org). Optional: Python 3.10+ with `pip install pillow`.

1. Install the mod into the game: `powershell -ExecutionPolicy Bypass -File install.ps1`
2. Start the server: `node server\server.js --gui` (or `start.bat`). It finds the game in Steam, GOG or Epic; otherwise pass `--bridge "<game>\bin\x64\plugins\cyber_engine_tweaks\mods\neuroport"`.
3. Open the control panel that appears, scan the QR code with your phone and load a save.

Without the game, `start-mock.bat` serves the app with simulated data on port 7078 (pairing code `TEST01`).

### Game data (not in this repository)

Everything taken from the game is generated locally from your own copy and is not committed here:

- **City map** (`web/map3d/`): download the [WolvenKit](https://github.com/WolvenKit/WolvenKit) console into `tools/wolvenkit/` and the Open2077 `op77_map3d` exporter (MIT) into `tools/open77_3dmap/`, then run `powershell -ExecutionPolicy Bypass -File tools\extract-map.ps1`.
- **Map icons** (`web/mapicons/`): `python -I tools\gamefiles\extract_mapicons.py`
- **Ringtone** (`web/ringtone/`): `python -I tools\gamefiles\extract_ringtone.py`
- **Portraits and vehicle images** are extracted by the server on demand into `web/avatars/`.

## Building the release package

```
powershell -ExecutionPolicy Bypass -File tools\package.ps1
```

It reads the version from `init.lua` and writes `dist\Neuroport-<version>.zip`, laid out for Vortex/MO2 (`bin\x64\plugins\cyber_engine_tweaks\mods\neuroport\...`, with the server and app in `companion\`).

## About the scripts

The package contains a few scripts, all plain text and readable:

- `Start Neuroport.bat`: runs `node server\server.js --gui`.
- `server/presskey.ps1`: focuses the Cyberpunk 2077 window and sends the N key (photo mode) with the Windows `SendInput` API. The server only runs it when you tap Camera on the phone.
- `tools/gamefiles/*.py`: read the game's `.archive` files. Oodle-compressed data is decompressed with the game's own `oo2ext_7_win64.dll` (loaded with `ctypes` from your install, not shipped).

The server only listens on your local network and only accepts commands from a paired phone (or from the PC itself, for the panel). On disk it writes only to the mod folder (`inbox.txt`) and to its own folder (pairing code, image cache, ringtone); it reads the game's archives and the game's screenshot folder. The only programs it starts are: Python for the extractors above, `presskey.ps1` for photo mode, the browser or Explorer when you press the panel's "open" buttons, and a new copy of itself when you press "Restart server".

## Security and privacy

- **No internet.** The app, the panel, three.js, the QR code library and the fonts are all served by the local server (`web/vendor`). Nothing is requested from third-party servers and there is no telemetry.
- **Pairing code.** 12 random characters (60 bits), shown as `XXXX-XXXX-XXXX` and in the QR code. After 8 wrong codes in 10 minutes, that device's IP is blocked for 15 minutes. "New code" in the panel disconnects every phone.
- **Control panel.** Only answers requests from the PC itself, addressed to `localhost`, and write requests must carry a header that only the panel sends. Other websites open in the PC's browser can't use it (CSRF / DNS rebinding).
- **Photos.** The gallery only lists the game's own photo-mode files (`photomode_*.png`) from `Pictures\Cyberpunk 2077`, and only to a paired phone.
- **Plain HTTP on the local network.** Phones would reject a self-signed HTTPS certificate with a full-screen warning, so the connection is not encrypted. Use it on your home Wi-Fi (Windows "private network"), not on public or shared networks.

## License

Neuroport's code is under the [MIT License](LICENSE). Cyberpunk 2077 and its content are (c) CD PROJEKT S.A.; Neuroport is a fan-made mod, not affiliated with or endorsed by CD PROJEKT RED. See [CREDITS.md](CREDITS.md).
