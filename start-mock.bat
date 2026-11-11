@echo off
title Neuroport (simulacao)
cd /d "%~dp0"
node server\server.js --mock %*
pause
