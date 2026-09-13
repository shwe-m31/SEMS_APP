@echo off
echo Loading SEMS Simple Seed Data...
echo.

REM Connect to MySQL and load the simple seed data
mysql -u root -pSql@3306 sems_db < C:\Users\shwet\Desktop\SEMS_APP\database\simple_seed.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Seed data loaded successfully!
    echo.
    echo You can now login with:
    echo   Email: owner@freshbake.com
    echo   Password: password
    echo.
) else (
    echo.
    echo ✗ Error loading seed data
    echo Please check:
    echo   1. MySQL is running
    echo   2. Database sems_db exists
    echo   3. MySQL credentials are correct (root/Sql@3306)
    echo.
)

pause
