@echo off
color 0B
cls
echo ===============================================
echo    COLLECTIF FEYDEAU - DEMARRAGE APPLICATION
echo ===============================================
echo.
echo Cette commande va :
echo  1. Arreter toutes les instances precedentes
echo  2. Liberer tous les ports utilises (8080-8090)
echo  3. Demarrer l'application sur le port 8080
echo.
echo ===============================================
echo.
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-dev.ps1"
