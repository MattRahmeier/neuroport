@echo off
title Neuroport Server
cd /d "%~dp0"
node server\server.js --gui %*
pause
