@echo off
setlocal
cd /d "%~dp0"

echo [Ethereal] Checking system environment...

:: Check if Node is installed
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install it from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for node_modules
if not exist "node_modules\" (
    echo [Ethereal] Initializing dependencies...
    call npm install
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo [Ethereal] Starting dev server...
echo [INFO] Please open http://localhost:3000 in your browser.
echo.

:: Try to open browser, but don't fail if it doesn't work
start "" "http://localhost:3000"

:: Start Vite
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server crashed.
    pause
)
