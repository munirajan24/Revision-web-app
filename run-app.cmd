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

echo Starting Revision App...
start "" http://localhost:4176
call npm run dev -- --host 0.0.0.0 --port 4176
