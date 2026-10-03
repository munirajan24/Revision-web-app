@echo off
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$project = (Get-Location).Path; $ports = 4176..4180; $processIds = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports } | Select-Object -ExpandProperty OwningProcess -Unique; $stopped = $false; foreach ($processId in $processIds) { $process = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $processId) -ErrorAction SilentlyContinue; if ($process -and $process.CommandLine -like '*vite*' -and $process.CommandLine -like ('*' + $project + '*')) { Stop-Process -Id $processId -Force; Write-Host 'Stopped the Revision App development server.'; $stopped = $true } }; if (-not $stopped) { Write-Host 'No Revision App development server was found.' }"

pause