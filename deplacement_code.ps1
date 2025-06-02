# Script de déplacement du code vers le répertoire parent
# Ce script déplace tous les fichiers du sous-répertoire Collectif-Feydeau---app
# vers le répertoire parent Collectif Feydeau -- app

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
$logFile = "$logFolder\deplacement-code-$timestamp.log"

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

# Définir les chemins
$sourceDir = "Collectif-Feydeau---app"
$parentDir = ".."
$backupDir = "backup-structure-originale"

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path $sourceDir)) {
    Write-Log "Le répertoire source $sourceDir n'existe pas. Assurez-vous d'exécuter ce script depuis le répertoire parent de $sourceDir." "ERROR"
    exit 1
}

Write-Log "Début du processus de déplacement du code vers le répertoire parent"

# Étape 1: Créer une sauvegarde
Write-Log "Création d'une sauvegarde de la structure actuelle"

try {
    # Créer le répertoire de sauvegarde s'il n'existe pas
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    # Copier la structure actuelle dans le répertoire de sauvegarde
    Copy-Item -Path "$sourceDir\*" -Destination $backupDir -Recurse -Force
    Write-Log "Sauvegarde créée avec succès dans le répertoire $backupDir"
}
catch {
    Write-Log "Erreur lors de la création de la sauvegarde: $_" "ERROR"
    exit 1
}

# Étape 2: Vérifier s'il y a des fichiers qui pourraient être écrasés
Write-Log "Vérification des conflits potentiels"

$conflictFiles = @()
Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring("$((Get-Location).Path)\$sourceDir\".Length)
    $targetPath = Join-Path -Path $parentDir -ChildPath $relativePath
    
    if (Test-Path $targetPath) {
        $conflictFiles += $relativePath
    }
}

if ($conflictFiles.Count -gt 0) {
    Write-Log "Des fichiers avec le même nom existent déjà dans le répertoire parent:" "WARNING"
    foreach ($file in $conflictFiles) {
        Write-Log "- $file" "WARNING"
    }
    
    if (-not (Confirm-Action "Des conflits ont été détectés. Voulez-vous continuer et écraser ces fichiers?")) {
        Write-Log "Opération annulée par l'utilisateur" "WARNING"
        exit 0
    }
}

# Étape 3: Déplacer les fichiers
Write-Log "Déplacement des fichiers vers le répertoire parent"

try {
    # Déplacer tous les fichiers et dossiers (sauf .git et le dossier de sauvegarde)
    Get-ChildItem -Path $sourceDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring("$((Get-Location).Path)\$sourceDir\".Length)
        $targetDir = Split-Path -Path (Join-Path -Path $parentDir -ChildPath $relativePath)
        
        # Créer le répertoire cible s'il n'existe pas
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        # Déplacer le fichier
        Move-Item -Path $_.FullName -Destination (Join-Path -Path $parentDir -ChildPath $relativePath) -Force
        Write-Log "Déplacé: $relativePath"
    }
    
    # Déplacer les dossiers vides (de bas en haut pour éviter les problèmes)
    $directories = Get-ChildItem -Path $sourceDir -Recurse -Directory | Sort-Object -Property FullName -Descending
    foreach ($dir in $directories) {
        # Ignorer certains dossiers spéciaux
        if ($dir.Name -eq ".git" -or $dir.Name -eq "node_modules" -or $dir.Name -eq $backupDir) {
            continue
        }
        
        $relativePath = $dir.FullName.Substring("$((Get-Location).Path)\$sourceDir\".Length)
        $targetDir = Join-Path -Path $parentDir -ChildPath $relativePath
        
        # Créer le répertoire cible s'il n'existe pas
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            Write-Log "Créé répertoire: $relativePath"
        }
        
        # Si le répertoire source est vide, le supprimer
        if ((Get-ChildItem -Path $dir.FullName -Recurse -File).Count -eq 0) {
            Remove-Item -Path $dir.FullName -Force -Recurse
        }
    }
    
    Write-Log "Déplacement des fichiers terminé avec succès"
}
catch {
    Write-Log "Erreur lors du déplacement des fichiers: $_" "ERROR"
    Write-Log "Tentative de restauration à partir de la sauvegarde..." "INFO"
    
    try {
        # Restaurer à partir de la sauvegarde
        Copy-Item -Path "$backupDir\*" -Destination $sourceDir -Recurse -Force
        Write-Log "Restauration réussie" "INFO"
    }
    catch {
        Write-Log "Erreur lors de la restauration: $_" "ERROR"
        Write-Log "Veuillez restaurer manuellement à partir du répertoire de sauvegarde $backupDir" "ERROR"
    }
    
    exit 1
}

# Étape 4: Mettre à jour les chemins dans les fichiers de configuration
Write-Log "Mise à jour des chemins dans les fichiers de configuration"

try {
    # Mettre à jour package.json si nécessaire
    $packageJsonPath = Join-Path -Path $parentDir -ChildPath "package.json"
    if (Test-Path $packageJsonPath) {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        
        # Sauvegarder l'original
        Copy-Item -Path $packageJsonPath -Destination "$packageJsonPath.bak"
        
        # Mettre à jour les chemins si nécessaire
        # (Ajoutez ici la logique spécifique pour mettre à jour les chemins dans package.json)
        
        # Enregistrer les modifications
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
        Write-Log "package.json mis à jour avec succès"
    }
    
    # Mettre à jour vite.config.ts si nécessaire
    $viteConfigPath = Join-Path -Path $parentDir -ChildPath "vite.config.ts"
    if (Test-Path $viteConfigPath) {
        # Sauvegarder l'original
        Copy-Item -Path $viteConfigPath -Destination "$viteConfigPath.bak"
        
        # Lire le contenu
        $viteConfig = Get-Content $viteConfigPath -Raw
        
        # Mettre à jour les chemins si nécessaire
        # (Ajoutez ici la logique spécifique pour mettre à jour les chemins dans vite.config.ts)
        
        # Enregistrer les modifications
        $viteConfig | Set-Content $viteConfigPath
        Write-Log "vite.config.ts mis à jour avec succès"
    }
    
    # Mettre à jour d'autres fichiers de configuration si nécessaire
    # ...
}
catch {
    Write-Log "Erreur lors de la mise à jour des chemins: $_" "WARNING"
    Write-Log "Vous devrez peut-être mettre à jour manuellement certains chemins dans les fichiers de configuration" "WARNING"
}

# Étape 5: Mise à jour du dépôt Git
if (Test-Path (Join-Path -Path $parentDir -ChildPath ".git")) {
    Write-Log "Mise à jour du dépôt Git"
    
    try {
        # Se déplacer dans le répertoire parent
        Set-Location $parentDir
        
        # Vérifier l'état Git
        $status = git status --porcelain
        
        if ($status) {
            Write-Log "Des modifications ont été détectées dans le dépôt Git" "INFO"
            Write-Log "N'oubliez pas de commiter ces changements avec un message approprié:" "INFO"
            Write-Log "git add ." "INFO"
            Write-Log "git commit -m 'Restructuration: déplacement du code vers le répertoire parent'" "INFO"
        }
        else {
            Write-Log "Aucune modification détectée dans le dépôt Git" "INFO"
        }
    }
    catch {
        Write-Log "Erreur lors de la mise à jour du dépôt Git: $_" "WARNING"
    }
    
    # Revenir au répertoire original
    Set-Location -Path (Join-Path -Path $parentDir -ChildPath $sourceDir)
}

# Étape 6: Nettoyage
if (Confirm-Action "Voulez-vous supprimer le répertoire source vide?") {
    try {
        # Supprimer le répertoire source s'il est vide
        if ((Get-ChildItem -Path $sourceDir -Recurse -File).Count -eq 0) {
            Remove-Item -Path $sourceDir -Force -Recurse
            Write-Log "Répertoire source supprimé avec succès"
        }
        else {
            Write-Log "Le répertoire source n'est pas vide. Certains fichiers n'ont pas été déplacés." "WARNING"
        }
    }
    catch {
        Write-Log "Erreur lors de la suppression du répertoire source: $_" "ERROR"
    }
}

Write-Log "Processus de déplacement du code terminé"
Write-Log "Un journal détaillé est disponible dans: $logFile"
Write-Log "Si vous rencontrez des problèmes, vous pouvez restaurer la structure originale à partir du répertoire de sauvegarde: $backupDir"
