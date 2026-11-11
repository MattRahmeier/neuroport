NEUROPORT - CREDITS AND LICENSES
================================

Neuroport is a fan-made mod. It is not affiliated with or endorsed by
CD PROJEKT RED. Thanks to everyone below; the mod would not exist without them.


REQUIRED MODS (installed separately)
------------------------------------
  Cyber Engine Tweaks (CET)   yamashi and the CET contributors          MIT
      https://github.com/maximegmd/CyberEngineTweaks
      Runs Neuroport's Lua code inside the game.
  RED4ext                     WopsS and contributors                    MIT
      https://github.com/wopss/RED4ext
  Codeware                    psiberx                                   MIT
      https://github.com/psiberx/cp2077-codeware
      Gives the mod access to the game's map markers.


RUNTIMES (installed separately)
-------------------------------
  Node.js                     OpenJS Foundation and contributors        MIT
      https://nodejs.org            Runs the Neuroport server on the PC.
  Python (optional)           Python Software Foundation                PSF License
      https://www.python.org
  Pillow (optional)           Jeffrey A. Clark and contributors         MIT-CMU
      https://python-pillow.org     Decodes the game's BC7 textures (icons, photos).


LIBRARIES USED BY THE PHONE APP (bundled in web/vendor, licenses included)
--------------------------------------------------------------------------
  three.js r170               three.js authors (mrdoob and contributors) MIT
      https://threejs.org           Map renderer, incl. the GLTFLoader and
                                    Line2 / LineMaterial add-ons.
  qrcode-generator 1.4.4      Kazuhiko Arase                            MIT
      https://github.com/kazuhikoarase/qrcode-generator
                                    QR code in the server panel.

FONTS (bundled in web/vendor/fonts, OFL texts included)
-------------------------------------------------------
  Rajdhani                    Indian Type Foundry                       SIL OFL 1.1
  Share Tech Mono             Carrois Type Design (Ralph du Carrois)    SIL OFL 1.1


MAP DATA
--------
  Open2077 / op77_map3d       Open2077 contributors                     MIT
      Map data format and the exporter that builds world.glb, buildings.bin,
      roads.bin and manifest.json from the game files. The exported data itself
      is game content (see below) and is not covered by the MIT license.
      License and notice: LICENSES\open2077-map3d-LICENSE.txt and -NOTICE.txt


REFERENCES
----------
  WolvenKit and the Cyberpunk 2077 modding community (wiki.redmodding.org):
      public documentation of the .archive and CR2W formats, used to read
      portraits, vehicle images, map icons and the ringtone from your own game
      files.
  Oodle decompression uses the game's own oo2ext DLL (RAD Game Tools / Epic
      Games), loaded from your installation. It is not redistributed.
  El Capitan vehicle contract areas: guides by GNL Magazine and GamingBolt.


GAME CONTENT
------------
  Cyberpunk 2077 (c) CD PROJEKT S.A. All rights reserved. CD PROJEKT,
  Cyberpunk and Cyberpunk 2077 are registered trademarks of CD PROJEKT S.A.
  Map geometry, map icons, contact portraits, vehicle images, message images,
  the ringtone and the Personal Link artwork on the cover belong to
  CD PROJEKT S.A. They are read from your own copy of the game (or shown as
  promotional art) under CD PROJEKT RED's fan content guidelines.


TOOLS USED TO MAKE THE MOD (not included)
-----------------------------------------
  FFmpeg (LGPL/GPL)           video captures and the preview GIFs
  Microsoft Edge (headless)   rendering the page banners
  luaparse (MIT)              Lua syntax checks
  Claude Code (Anthropic)     AI coding assistant used during development


NEUROPORT
---------
  Created by mathiasrahmeier.    Support: https://ko-fi.com/mathiasrahmeier
