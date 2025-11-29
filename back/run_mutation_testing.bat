@echo off
REM Mutation Testing Script for app/ folder
REM Ensures correct directory and runs mutatest

cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Verify we're in the back directory
if not exist "app" (
    echo ERROR: app folder not found!
    echo Please run this script from the back/ directory
    pause
    exit /b 1
)

echo Starting mutation testing for app/ folder...
echo.

set PYTHONHASHSEED=0
mutatest -s app -t "python manage.py test app --keepdb" -e "app/migrations" -e "app/__init__.py" -e "app/admin.py" -e "app/apps.py"

echo.
echo Mutation testing complete!
pause

