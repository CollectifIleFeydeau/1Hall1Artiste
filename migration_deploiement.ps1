# Script de migration vers un déploiement unique
# Ce script automatise les étapes de sauvegarde et de migration pour le déploiement unique
# de l'application Collectif Feydeau vers le dépôt CollectifIleFeydeau/1Hall1Artiste

# Fonction pour afficher les messages avec couleur
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Créer un dossier de logs
$logFolder = "migration-logs"
if (-not (Test-Path $logFolder)) {
    New-Item -ItemType Directory -Path $logFolder | Out-Null
}

# Définir le fichier de log
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logFolder\migration-$timestamp.log"

# Fonction pour écrire dans le log
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
    Add-Content -Path $logFile -Value $logEntry
    
    switch ($Level) {
        "INFO" { Write-ColorOutput Green $Message }
        "WARNING" { Write-ColorOutput Yellow $Message }
        "ERROR" { Write-ColorOutput Red $Message }
        default { Write-Output $Message }
    }
}

# Fonction pour demander confirmation
function Confirm-Action {
    param (
        [string]$Message
    )
    
    $confirmation = Read-Host "$Message (O/N)"
    return $confirmation -eq "O"
}

# Étape 1: Sauvegarde préalable
Write-Log "Début du processus de migration vers un déploiement unique"
Write-Log "Étape 1: Création des sauvegardes"

# Créer une archive ZIP du code actuel
$backupFileName = "backup-avant-migration-$(Get-Date -Format 'yyyyMMdd').zip"
$sourcePath = "."
$destinationPath = "..\$backupFileName"

try {
    Write-Log "Création de l'archive du code: $backupFileName"
    Compress-Archive -Path $sourcePath -DestinationPath $destinationPath -Force
    Write-Log "Archive créée avec succès: $destinationPath"
} 
catch {
    Write-Log "Erreur lors de la création de l'archive: $_" "ERROR"
    exit 1
}

# Sauvegarder les fichiers de build actuels
try {
    Write-Log "Construction de l'application pour sauvegarde"
    npm run build
    
    $distBackupFolder = "dist-backup-$(Get-Date -Format 'yyyyMMdd')"
    Write-Log "Copie des fichiers de build vers $distBackupFolder"
    
    if (Test-Path "dist") {
        Copy-Item -Path "dist" -Destination $distBackupFolder -Recurse
        Write-Log "Sauvegarde des fichiers de build terminée"
    } else {
        Write-Log "Le dossier dist n'existe pas après la construction" "WARNING"
    }
}
catch {
    Write-Log "Erreur lors de la sauvegarde des fichiers de build: $_" "ERROR"
    exit 1
}

# Étape 2: Créer une branche de sauvegarde Git
Write-Log "Création d'une branche de sauvegarde Git"

try {
    # Vérifier si des modifications sont en attente
    $status = git status --porcelain
    if ($status) {
        Write-Log "Des modifications non commitées sont présentes. Veuillez les commiter avant de continuer." "WARNING"
        if (-not (Confirm-Action "Voulez-vous continuer quand même?")) {
            Write-Log "Opération annulée par l'utilisateur" "WARNING"
            exit 0
        }
    }
    
    # Créer et pousser la branche de sauvegarde
    git checkout -b backup-avant-migration-unique
    git push origin backup-avant-migration-unique
    Write-Log "Branche de sauvegarde créée et poussée avec succès"
}
catch {
    Write-Log "Erreur lors de la création de la branche de sauvegarde: $_" "ERROR"
    Write-Log "Continuez manuellement ou restaurez à partir de l'archive ZIP" "INFO"
}

# Étape 3: Modifier la configuration
if (Confirm-Action "Voulez-vous procéder à la modification des fichiers de configuration?") {
    Write-Log "Étape 3: Modification des fichiers de configuration"
    
    # Mettre à jour package.json
    try {
        Write-Log "Mise à jour de package.json"
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        # Sauvegarder l'original
        Copy-Item -Path "package.json" -Destination "package.json.bak"
        
        # Modifier les propriétés
        $packageJson.homepage = "https://collectifilefeydeau.github.io/1Hall1Artiste/"
        
        # Modifier les scripts
        $deployScript = $packageJson.scripts.deploy
        $packageJson.scripts.deploy = "gh-pages -d dist -r https://github.com/CollectifIleFeydeau/1Hall1Artiste.git -b gh-pages"
        
        # Supprimer les scripts qui ne sont plus nécessaires
        if ($packageJson.scripts.PSObject.Properties["deploy-collectif"]) {
            $packageJson.scripts.PSObject.Properties.Remove("deploy-collectif")
        }
        if ($packageJson.scripts.PSObject.Properties["deploy-all"]) {
            $packageJson.scripts.PSObject.Properties.Remove("deploy-all")
        }
        
        # Enregistrer les modifications
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
        Write-Log "package.json mis à jour avec succès"
    }
    catch {
        Write-Log "Erreur lors de la mise à jour de package.json: $_" "ERROR"
        Write-Log "Restauration de la sauvegarde de package.json" "INFO"
        Copy-Item -Path "package.json.bak" -Destination "package.json" -Force
    }
    
    # Mettre à jour vite.config.ts
    try {
        Write-Log "Mise à jour de vite.config.ts"
        
        # Sauvegarder l'original
        Copy-Item -Path "vite.config.ts" -Destination "vite.config.ts.bak"
        
        # Lire le contenu
        $viteConfig = Get-Content "vite.config.ts" -Raw
        
        # Remplacer la ligne de base
        $viteConfig = $viteConfig -replace "base: `".+`",", "base: `"/1Hall1Artiste/`","
        
        # Enregistrer les modifications
        $viteConfig | Set-Content "vite.config.ts"
        Write-Log "vite.config.ts mis à jour avec succès"
    }
    catch {
        Write-Log "Erreur lors de la mise à jour de vite.config.ts: $_" "ERROR"
        Write-Log "Restauration de la sauvegarde de vite.config.ts" "INFO"
        Copy-Item -Path "vite.config.ts.bak" -Destination "vite.config.ts" -Force
    }
}

# Étape 4: Tester localement
if (Confirm-Action "Voulez-vous nettoyer les caches et reconstruire l'application?") {
    Write-Log "Étape 4: Nettoyage des caches et reconstruction"
    
    try {
        Write-Log "Nettoyage du cache npm"
        npm cache clean --force
        
        Write-Log "Suppression de node_modules"
        if (Test-Path "node_modules") {
            Remove-Item -Path "node_modules" -Recurse -Force
        }
        
        Write-Log "Suppression de dist"
        if (Test-Path "dist") {
            Remove-Item -Path "dist" -Recurse -Force
        }
        
        Write-Log "Réinstallation des dépendances"
        npm install
        
        Write-Log "Construction de l'application avec la nouvelle configuration"
        npm run build
        
        Write-Log "Démarrage de la prévisualisation"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run preview"
        
        Write-Log "L'application est en cours de prévisualisation. Vérifiez qu'elle fonctionne correctement."
        Write-Log "URL de prévisualisation: http://localhost:4173"
    }
    catch {
        Write-Log "Erreur lors du test local: $_" "ERROR"
    }
}

# Étape 5: Déployer vers le dépôt unique
if (Confirm-Action "Voulez-vous déployer l'application vers le dépôt unique?") {
    Write-Log "Étape 5: Déploiement vers le dépôt unique"
    
    try {
        Write-Log "Déploiement de l'application"
        npm run deploy
        
        Write-Log "Déploiement terminé. Vérifiez l'application à l'adresse:"
        Write-Log "https://collectifilefeydeau.github.io/1Hall1Artiste/"
    }
    catch {
        Write-Log "Erreur lors du déploiement: $_" "ERROR"
        Write-Log "Consultez le plan de restauration dans plan-migration-deploiement.md" "INFO"
    }
}

Write-Log "Processus de migration terminé"
Write-Log "Un journal détaillé est disponible dans: $logFile"
Write-Log "Consultez plan-migration-deploiement.md pour les étapes de vérification et de restauration si nécessaire"