# Script pour démarrer l'application complète avec Netlify Dev
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   COLLECTIF FEYDEAU - DEMARRAGE COMPLET" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Nettoyage des instances précédentes..." -ForegroundColor Yellow

# Tuer TOUS les processus Node.js
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "🔴 Arrêt du processus Node.js (PID: $($_.Id))..." -ForegroundColor Gray
            $_ | Stop-Process -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✅ Tous les processus Node.js ont été arrêtés." -ForegroundColor Green
    } else {
        Write-Host "✅ Aucun processus Node.js en cours d'exécution." -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des processus: $_" -ForegroundColor Yellow
}

# Libérer les ports spécifiques
$portsToFree = @(8080, 8081, 8888, 3000, 5173)
foreach ($port in $portsToFree) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "🔄 Libération du port $port..." -ForegroundColor Yellow
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process -and $process.Id -gt 4) {
                    try {
                        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                        Write-Host "🔴 Processus $($process.ProcessName) (PID: $($process.Id)) arrêté" -ForegroundColor Gray
                    } catch {
                        # Ignore les erreurs de processus déjà arrêtés
                    }
                }
            }
        }
    } catch {
        # Port pas utilisé, c'est normal
    }
}

Write-Host ""
Write-Host "🧹 Nettoyage du cache Netlify..." -ForegroundColor Yellow
# Supprimer le cache Netlify
try {
    Set-Location -Path $PSScriptRoot
    if (Test-Path ".netlify") {
        Remove-Item -Recurse -Force ".netlify" -ErrorAction SilentlyContinue
        Write-Host "✅ Cache Netlify supprimé" -ForegroundColor Green
    }
    if (Test-Path "node_modules/.cache") {
        Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
        Write-Host "✅ Cache Node.js supprimé" -ForegroundColor Green  
    }
} catch {
    Write-Host "⚠️ Erreur lors du nettoyage du cache: $_" -ForegroundColor Yellow
}

# Attendre un peu pour s'assurer que tous les ports sont libérés
Write-Host "⏳ Attente de la libération des ports..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🧪 Tests rapides des données..." -ForegroundColor Cyan
try {
    # Tests rapides seulement
    $env:NODE_ENV = "test"
    npm run test -- --run --reporter=basic src/data/ 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tests de données réussis!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Tests ignorés (continuons quand même)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Tests ignorés, continuons..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Vérification de l'environnement..." -ForegroundColor Cyan

# Vérifier que .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "📁 Création du fichier .env.local..." -ForegroundColor Yellow
    "VITE_USE_API=true" | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
} else {
    Write-Host "✅ Fichier .env.local existe" -ForegroundColor Green
}

# Vérifier les fonctions .cjs
$cjsFiles = Get-ChildItem -Path "netlify/functions" -Filter "*.cjs" -ErrorAction SilentlyContinue
if ($cjsFiles.Count -gt 0) {
    Write-Host "✅ Fonctions .cjs détectées: $($cjsFiles.Count) fichiers" -ForegroundColor Green
    $cjsFiles | ForEach-Object { Write-Host "   📄 $($_.Name)" -ForegroundColor Gray }
} else {
    Write-Host "⚠️ Aucune fonction .cjs trouvée!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Démarrage de l'application complète..." -ForegroundColor Cyan
Write-Host "   📡 Netlify Dev: http://localhost:8888" -ForegroundColor Magenta
Write-Host "   🎨 Interface: http://localhost:8888" -ForegroundColor Magenta  
Write-Host "   🔧 API Functions: http://localhost:8888/api/*" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚡ Attendez le message 'Local dev server ready' avant d'ouvrir le navigateur" -ForegroundColor Yellow
Write-Host ""

try {
    # Supprimer les variables d'environnement de test
    Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
    
    # Démarrer Netlify Dev (qui inclut Vite automatiquement)
    npx netlify dev
    
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors du démarrage: $_" -ForegroundColor Red
    Write-Host "🔍 Conseils de dépannage:" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que les ports 8080 et 8888 sont libres" -ForegroundColor Gray
    Write-Host "   2. Essayez de redémarrer en tant qu'administrateur" -ForegroundColor Gray  
    Write-Host "   3. Vérifiez les logs ci-dessus pour plus de détails" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Magenta
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 