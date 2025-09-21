@echo off
setlocal enabledelayedexpansion

:: Script Batch de Release Automatique
:: Usage: release.bat [patch|minor|major]

echo.
echo 🚀 SCRIPT DE RELEASE AUTOMATIQUE 🚀
echo.

:: Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

:: Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

:: Vérifier si on est dans un repository Git
if not exist ".git" (
    echo ❌ Ce dossier n'est pas un repository Git
    pause
    exit /b 1
)

:: Vérifier si le script Node.js existe
if not exist "scripts\release.js" (
    echo ❌ Le script scripts\release.js n'existe pas
    pause
    exit /b 1
)

:: Si un argument est fourni, l'utiliser
if not "%1"=="" (
    set "version_type=%1"
    goto :run_script
)

:: Sinon, mode interactif
echo Choisissez le type de release:
echo   1. 🐛 patch   - Corrections de bugs
echo   2. ✨ minor   - Nouvelles fonctionnalités  
echo   3. 🚀 major   - Breaking changes
echo   4. ❌ Annuler
echo.

set /p choice="Votre choix (1-4): "

if "%choice%"=="1" set "version_type=patch"
if "%choice%"=="2" set "version_type=minor"
if "%choice%"=="3" set "version_type=major"
if "%choice%"=="4" (
    echo Release annulée
    pause
    exit /b 0
)

if "%version_type%"=="" (
    echo ❌ Choix invalide
    pause
    exit /b 1
)

:run_script
echo.
echo 🔄 Lancement de la release %version_type%...
echo.

:: Lancer le script Node.js avec le type de version
node scripts\release.js

:: Vérifier le code de sortie
if errorlevel 1 (
    echo.
    echo ❌ Erreur durant la release
    exit /b 1
) else (
    echo.
    echo ✅ Release terminée avec succès !
    echo.
    echo 🌐 URL de production: https://collectifilefeydeau.github.io/1Hall1Artiste/
    echo 📊 Actions GitHub: https://github.com/CollectifIleFeydeau/1Hall1Artiste/actions
    echo.
    pause
)
