@echo off
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo Node.js/npm was not found in PATH.
    echo Install Node.js LTS, then run this file again.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Dependency install failed.
        pause
        exit /b 1
    )
)

set "PORT=4176"

echo Starting Revision App on port %PORT%...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address" 2^>nul') do (
    set "LAN_IP=%%a"
    goto :continue
)
:continue
if not defined LAN_IP set "LAN_IP=127.0.0.1"
set "LAN_IP=%LAN_IP: =%"
set "LAN_URL=http://%LAN_IP%:%PORT%"
set "LOCAL_URL=http://localhost:%PORT%"

echo Access on your phone: %LAN_URL%

echo Access in browser: %LOCAL_URL%
start "" %LOCAL_URL%
call npm run dev -- --host 0.0.0.0 --port %PORT%
