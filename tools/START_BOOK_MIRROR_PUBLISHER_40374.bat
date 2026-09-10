@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 atlas_book_mirror_publisher_40374.py
) else (
  python atlas_book_mirror_publisher_40374.py
)
pause
