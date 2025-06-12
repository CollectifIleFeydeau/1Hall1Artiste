@echo off
color 0B
cls
echo ===============================================
echo    COLLECTIF FEYDEAU - DEMARRAGE COMPLET
echo ===============================================
echo.
echo Cette commande va :
echo  1. Arreter toutes les instances precedentes
echo  2. Nettoyer le cache Netlify
echo  3. Demarrer Netlify Dev + Vite sur le port 8888
echo  4. Gerer les fonctions serverless (.cjs)
echo.
echo ===============================================
echo.

REM Tuer tous les processus Node.js
echo 🔄 Nettoyage des processus Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Processus Node.js arretes
) else (
    echo ✅ Aucun processus Node.js en cours
)

REM Supprimer le cache Netlify
echo 🧹 Nettoyage du cache...
if exist ".netlify" (
    rmdir /s /q ".netlify" >nul 2>&1
    echo ✅ Cache Netlify supprime
)

REM Créer .env.local si nécessaire
if not exist ".env.local" (
    echo 📁 Creation du fichier .env.local...
    echo VITE_USE_API=true > .env.local
    echo ✅ Fichier .env.local cree
)

REM Attendre un peu
echo ⏳ Attente de 2 secondes...
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Demarrage de l'application complete...
echo    📡 Netlify Dev: http://localhost:8888
echo    🎨 Interface: http://localhost:8888
echo    🔧 API: http://localhost:8888/api/*
echo.
echo ⚡ Attendez le message "Local dev server ready"
echo.

REM Démarrer Netlify Dev
netlify dev

pause
