@echo off
REM SQL Sandbox - start-skript for Windows
REM Sjekker Bun, installerer avhengigheter, og starter API + web.

setlocal
cd /d "%~dp0"

if "%API_PORT%"=="" set API_PORT=3001
if "%WEB_PORT%"=="" set WEB_PORT=5173

REM Auto-oppdatering: hent siste versjon fra GitHub for start.
REM Sett SKIP_UPDATE=1 for a hoppe over.
if "%SKIP_UPDATE%"=="1" goto skip_update
where git >nul 2>nul
if errorlevel 1 goto skip_update
if not exist ".git" goto skip_update

echo.
echo ==^> Sjekker etter oppdateringer
git diff --quiet HEAD >nul 2>nul
if errorlevel 1 (
  echo   ! Du har lokale endringer - hopper over auto-oppdatering.
  goto skip_update
)
git fetch --quiet origin >nul 2>nul
if errorlevel 1 (
  echo   ! Ingen nettverk - bruker eksisterende versjon.
  goto skip_update
)
for /f %%a in ('git rev-parse @ 2^>nul') do set LOCAL_SHA=%%a
for /f %%a in ('git rev-parse @{u} 2^>nul') do set REMOTE_SHA=%%a
if "%LOCAL_SHA%"=="%REMOTE_SHA%" (
  echo   Allerede oppdatert.
) else (
  echo   Ny versjon tilgjengelig - oppdaterer...
  git pull --ff-only --quiet
  if errorlevel 1 echo   ! Kunne ikke fast-forwarde. Kjor "git pull" manuelt.
)
:skip_update

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
