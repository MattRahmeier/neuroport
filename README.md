# Neuroport

![Neuroport: your phone becomes V's](https://i.imgur.com/z1LaDx1.png)

**Your phone becomes V's.** A second-screen companion for Cyberpunk 2077: messages, calls, the map, your garage, the radio, shards and more, live from the game on your phone's browser over your home Wi-Fi.

## Download and install

**For the Linux version:** [Nastas95/neuroport-linux](https://github.com/Nastas95/neuroport-linux). This release is for Windows.

**[Download Neuroport 1.1 (zip, 7.9 MB)](https://github.com/MattRahmeier/neuroport/releases/latest/download/Neuroport-1.1.zip)** from the [latest release](https://github.com/MattRahmeier/neuroport/releases/latest). It will also be on Nexus Mods once it passes review.

**Install these first:**

1. [Cyber Engine Tweaks](https://www.nexusmods.com/cyberpunk2077/mods/107): extract into the game folder, start the game once and pick the overlay key.
2. [RED4ext](https://www.nexusmods.com/cyberpunk2077/mods/2380) and [Codeware](https://www.nexusmods.com/cyberpunk2077/mods/7780): extract into the game folder.
3. [Node.js LTS](https://nodejs.org): the "Windows Installer (.msi)", default options.
4. Optional: [Python 3.10+](https://www.python.org/downloads/) with "Add python.exe to PATH" ticked, then `pip install pillow` in a Command Prompt (contact portraits and vehicle photos).

**Then:**

1. Extract `Neuroport-1.1.zip` into the game folder (the one with `bin` and `archive`), or drag the zip into Vortex / Mod Organizer 2.
2. Run `bin\x64\plugins\cyber_engine_tweaks\mods\neuroport\companion\Start Neuroport.bat`. Allow Node.js on **private networks** when Windows Firewall asks.
3. The control panel opens on the PC. Scan its QR code with your phone (same Wi-Fi), and load a save.

Windows may warn that the `.bat` file came from the internet: it only runs `node server\server.js --gui` (see [About the scripts](#about-the-scripts)).

## In action


![Map route](https://i.imgur.com/2utCCV0.gif)

![Photo mode](https://i.imgur.com/7EXcKen.gif)

## Features

- **Comms and calls:** every conversation and contact, replies, old chats, gig images, notifications, calls with portraits and subtitles.
- **Map and car mode:** Night City with the game's icons, active jobs, GPS, minimap-style car mode with autodrive, radio and paint.
- **Garage:** summon any vehicle, full specs, El Capitan's contracts and the cars they unlock, Autofixer shop.
- **Quick Gig and journal:** nearest gigs and NCPD jobs, track or untrack any job.
- **Radio, shards and status:** stations and volume, a shard reader, level and attributes.
- **Immersive mode:** hide the HUD piece by piece or all at once, photo mode, wallpaper from your game photos.
- **Desktop mode:** on a PC, tablet or second monitor (1000 px or wider) the app switches to a side menu with split-screen Comms and Shards and a two-column car mode. Settings → Layout lets you force Phone or Desktop.

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

## Support

Neuroport is free. If you enjoy it, you can support development on [Ko-fi](https://ko-fi.com/mathiasrahmeier).

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/mathiasrahmeier)

## License

Neuroport's code is under the [MIT License](LICENSE). Cyberpunk 2077 and its content are (c) CD PROJEKT S.A.; Neuroport is a fan-made mod, not affiliated with or endorsed by CD PROJEKT RED. See [CREDITS.md](CREDITS.md).
