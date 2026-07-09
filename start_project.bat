@echo off
echo ============================
echo  Opening You and I environment
echo ============================

set FE_PATH=C:\Users\gbb1hc\Desktop\Projects\you-and-i\frontend
set BE_PATH=C:\Users\gbb1hc\Desktop\Projects\you-and-i\backend
set IDEA_PATH=C:\Users\gbb1hc\AppData\Local\Programs\IntelliJ IDEA 2026.1.2\bin\idea64.exe

echo.
echo Opening FE in VS Code...
start "" code "%FE_PATH%"


echo.
echo Opening BE in IntelliJ IDEA...
start "" "%IDEA_PATH%" "%BE_PATH%"

echo.
echo All set! Enjoy coding, Anh Nhat

exit