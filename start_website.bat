@echo off
title ZenSpace Local Server
echo ==============================================
echo Starting ZenSpace Next.js Server...
echo ==============================================

:: Check if node_modules exists, if not, install dependencies
IF NOT EXIST "node_modules\" (
    echo First time setup: Installing dependencies...
    echo This might take a few minutes...
    call npm install
)

:: Open the browser after a 10-second delay to allow the server to start
start cmd /c "timeout /t 10 >nul && start http://localhost:3000"

:: Start the Next.js development server in this window
npm run dev

pause
