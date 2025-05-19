# Script pour tuer les instances précédentes et démarrer l'application
Write-Host "Arrêt des instances Node.js précédentes..." -ForegroundColor Yellow

# Tuer tous les processus Node.js en cours d'exécution
try {
    # Rechercher les processus Node.js qui exécutent Vite
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
    
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "Arrêt du processus Node.js (PID: $($_.Id))..." -ForegroundColor Gray
            $_ | Stop-Process -Force
        }
        Write-Host "Tous les processus Vite ont été arrêtés." -ForegroundColor Green
    } else {
        Write-Host "Aucun processus Vite en cours d'exécution." -ForegroundColor Green
    }
    
    # Vérifier si des ports sont encore utilisés
    $usedPorts = @(8080..8090)
    foreach ($port in $usedPorts) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "Libération du port $port..." -ForegroundColor Yellow
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process -and $process.ProcessName -ne "Idle" -and $process.Id -ne 0 -and $process.Id -ne 4) {
                    Write-Host "Arrêt du processus $($process.ProcessName) (PID: $($process.Id)) utilisant le port $port" -ForegroundColor Gray
                    try {
                        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    } catch {
                        Write-Host "Impossible d'arrêter le processus $($process.ProcessName) (PID: $($process.Id)): $_" -ForegroundColor Yellow
                    }
                }
            }
        }
    }
} catch {
    Write-Host "Erreur lors de l'arrêt des processus: $_" -ForegroundColor Red
}

# Attendre un peu pour s'assurer que tous les ports sont libérés
Write-Host "Attente de la libération des ports..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Démarrer l'application
Write-Host "Démarrage de l'application..." -ForegroundColor Cyan
try {
    # Changer de répertoire vers le dossier du projet
    Set-Location -Path $PSScriptRoot
    
    # Démarrer l'application avec npm
    npm run dev
} catch {
    Write-Host "Erreur lors du démarrage de l'application: $_" -ForegroundColor Red
    Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Magenta
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
