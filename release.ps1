# Script PowerShell de Release Automatique
# Usage: .\release.ps1 [patch|minor|major]

param(
    [Parameter(Position=0)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionType
)

# Configuration
$ErrorActionPreference = "Stop"

# Couleurs pour PowerShell
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🔄 $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Blue"
}

function Write-Title {
    param([string]$Message)
    Write-ColorOutput "🚀 $Message" "Magenta"
}

# Fonction pour exécuter une commande et vérifier le résultat
function Invoke-Command {
    param(
        [string]$Command,
        [switch]$Silent,
        [switch]$IgnoreError
    )
    
    try {
        if ($Silent) {
            $result = Invoke-Expression $Command 2>$null
        } else {
            $result = Invoke-Expression $Command
        }
        return $result
    } catch {
        if (-not $IgnoreError) {
            Write-Error "Erreur lors de l'exécution: $Command"
            Write-Error $_.Exception.Message
            exit 1
        }
        return $null
    }
}

# Vérifier l'état du repository
function Test-GitStatus {
    Write-Step "Vérification de l'état du repository..."
    
    # Vérifier si on est sur la bonne branche
    $currentBranch = Invoke-Command "git branch --show-current" -Silent
    if ($currentBranch -ne "main") {
        Write-Error "Vous devez être sur la branche main. Branche actuelle: $currentBranch"
        exit 1
    }
    
    # Vérifier s'il y a des changements non commitées
    $status = Invoke-Command "git status --porcelain" -Silent
    if ($status) {
        Write-Warning "Il y a des changements non commitées:"
        Write-Host $status
        $continue = Read-Host "Voulez-vous continuer malgré les changements non commitées ? (y/N)"
        if ($continue.ToLower() -ne "y") {
            Write-Info "Release annulée"
            exit 0
        }
    }
    
    # Vérifier si on est à jour avec le remote
    Invoke-Command "git fetch" -Silent
    $behind = Invoke-Command "git rev-list --count HEAD..origin/main" -Silent -IgnoreError
    if ($behind -and [int]$behind -gt 0) {
        Write-Error "Votre branche locale est en retard de $behind commit(s). Faites un git pull d'abord."
        exit 1
    }
    
    Write-Success "Repository prêt pour la release"
}

# Vérifier le CHANGELOG
function Test-Changelog {
    Write-Step "Vérification du CHANGELOG..."
    
    if (-not (Test-Path "CHANGELOG.md")) {
        Write-Error "Fichier CHANGELOG.md non trouvé"
        return $false
    }
    
    $changelog = Get-Content "CHANGELOG.md" -Raw
    if ($changelog -match "## \[Non publié\]\s*([\s\S]*?)(?=## \[|\n---|\n## Légende|$)") {
        $content = $matches[1].Trim()
        if (-not $content -or $content -eq "" -or -not $content.Contains("- ")) {
            Write-Error "Aucun changement dans la section [Non publié] du CHANGELOG"
            Write-Info "Ajoutez vos changements avant de faire une release"
            return $false
        }
    } else {
        Write-Error "Section [Non publié] non trouvée dans le CHANGELOG"
        return $false
    }
    
    Write-Success "CHANGELOG prêt avec des changements"
    return $true
}

# Afficher les changements à publier
function Show-Changes {
    Write-Step "Changements à publier:"
    
    $changelog = Get-Content "CHANGELOG.md" -Raw
    if ($changelog -match "## \[Non publié\]\s*([\s\S]*?)(?=## \[|\n---|\n## Légende|$)") {
        Write-ColorOutput $matches[1].Trim() "Yellow"
    }
    Write-Host ""
}

# Fonction principale
function Start-Release {
    Write-Title "🚀 SCRIPT DE RELEASE AUTOMATIQUE 🚀"
    Write-Host ""
    
    try {
        # Vérifications préliminaires
        Test-GitStatus
        
        if (-not (Test-Changelog)) {
            Write-Error "CHANGELOG non prêt. Ajoutez vos changements et relancez le script."
            exit 1
        }
        
        # Afficher les changements
        Show-Changes
        
        # Demander le type de version si pas fourni
        if (-not $VersionType) {
            Write-Host "Types de version disponibles:"
            Write-Host "  1. 🐛 patch   - Corrections de bugs (1.3.0 → 1.3.1)"
            Write-Host "  2. ✨ minor   - Nouvelles fonctionnalités (1.3.0 → 1.4.0)"
            Write-Host "  3. 🚀 major   - Breaking changes (1.3.0 → 2.0.0)"
            Write-Host ""
            
            $choice = Read-Host "Choisissez le type de version (1/2/3)"
            
            switch ($choice) {
                "1" { $VersionType = "patch" }
                "2" { $VersionType = "minor" }
                "3" { $VersionType = "major" }
                default {
                    Write-Error "Choix invalide"
                    exit 1
                }
            }
        }
        
        # Confirmation finale
        $confirm = Read-Host "`nÊtes-vous sûr de vouloir créer une version $VersionType ? (y/N)"
        if ($confirm.ToLower() -ne "y") {
            Write-Info "Release annulée"
            exit 0
        }
        
        Write-Host ""
        Write-Title "DÉBUT DE LA RELEASE $($VersionType.ToUpper())"
        
        # 1. Incrémenter la version
        Write-Step "Incrémentation de la version ($VersionType)..."
        Invoke-Command "npm run version:$VersionType"
        
        # Récupérer la nouvelle version
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $newVersion = $packageJson.version
        Write-Success "Version incrémentée: v$newVersion"
        
        # 2. Commiter les changements
        Write-Step "Commit des changements de version..."
        Invoke-Command "git add package.json CHANGELOG.md src/components/admin/VersionInfo.tsx"
        Invoke-Command "git commit -m `"chore: bump version to v$newVersion`""
        Write-Success "Changements commitées"
        
        # 3. Créer le tag
        Write-Step "Création du tag..."
        Invoke-Command "git tag v$newVersion"
        Write-Success "Tag v$newVersion créé"
        
        # 4. Pousser vers le remote
        Write-Step "Push vers le repository..."
        Invoke-Command "git push origin main"
        Invoke-Command "git push origin --tags"
        Write-Success "Changements poussés vers le repository"
        
        # 5. Informations finales
        Write-Step "Déclenchement du déploiement automatique..."
        Write-Info "Le workflow GitHub Actions va maintenant:"
        Write-Info "  1. Builder l'application"
        Write-Info "  2. Déployer sur GitHub Pages"
        Write-Info "  3. Rendre la nouvelle version disponible"
        
        Write-Host ""
        Write-Title "🎉 RELEASE TERMINÉE AVEC SUCCÈS ! 🎉"
        Write-Host ""
        Write-Success "Version v$newVersion créée et déployée"
        Write-Info "URL de production: https://collectifilefeydeau.github.io/1Hall1Artiste/"
        Write-Info "Surveillez le workflow: https://github.com/CollectifIleFeydeau/1Hall1Artiste/actions"
        
    } catch {
        Write-Error "Erreur durant la release:"
        Write-Error $_.Exception.Message
        exit 1
    }
}

# Afficher l'aide si demandé
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Host @"
🚀 Script de Release Automatique PowerShell

Usage:
  .\release.ps1 [patch|minor|major]

Exemples:
  .\release.ps1           # Mode interactif
  .\release.ps1 patch     # Release patch directe
  .\release.ps1 minor     # Release minor directe
  .\release.ps1 major     # Release major directe

Ce script va:
  1. Vérifier l'état du repository Git
  2. Vérifier le CHANGELOG
  3. Demander le type de version (si pas fourni)
  4. Incrémenter la version
  5. Commiter et taguer
  6. Pousser vers GitHub
  7. Déclencher le déploiement automatique

Prérequis:
  - Être sur la branche main
  - Avoir des changements dans la section [Non publié] du CHANGELOG
  - Repository propre (recommandé)
"@
    exit 0
}

# Lancer le script
Start-Release
