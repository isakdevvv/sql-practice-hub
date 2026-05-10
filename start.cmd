@echo off
REM SQL Sandbox - start-skript for Windows
REM Sjekker Bun, installerer avhengigheter, og starter API + web.

setlocal
cd /d "%~dp0"

if "%API_PORT%"=="" set API_PORT=3001
if "%WEB_PORT%"=="" set WEB_PORT=5173

echo.
echo ==^> Sjekker Bun
where bun >nul 2>nul
if errorlevel 1 (
  echo Bun er ikke installert.
  echo Installer det med PowerShell:
  echo   powershell -c "irm bun.sh/install.ps1 ^| iex"
  echo Eller last ned fra https://bun.sh, og kjor dette skriptet pa nytt.
  exit /b 1
)
for /f "tokens=*" %%v in ('bun --version') do echo   Bun: %%v

echo.
echo ==^> Installerer avhengigheter
call bun install
if errorlevel 1 exit /b 1

echo.
echo ==^> Starter API-server pa http://localhost:%API_PORT%
start "SQL Sandbox API" cmd /c "set PORT=%API_PORT%&& bun server/index.ts"

echo ==^> Starter web-server pa http://localhost:%WEB_PORT%
start "SQL Sandbox Web" cmd /c "bun run dev:web --port %WEB_PORT%"

echo.
echo Klar! Apne i nettleseren:
echo   Web:  http://localhost:%WEB_PORT%
echo   API:  http://localhost:%API_PORT%/api/health
echo.
echo Lukk de to terminalvinduene som apnet seg for a stoppe serverene.
endlocal
