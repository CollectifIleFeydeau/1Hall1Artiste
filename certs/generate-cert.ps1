# Script pour générer un certificat auto-signé pour le développement local
# Ce script crée un certificat pour localhost et 192.168.1.15

# Vérifier si OpenSSL est disponible
try {
    $null = Get-Command openssl -ErrorAction Stop
    Write-Host "OpenSSL est disponible, génération du certificat..." -ForegroundColor Green
} catch {
    Write-Host "OpenSSL n'est pas disponible dans le PATH. Veuillez installer OpenSSL ou l'ajouter au PATH." -ForegroundColor Red
    Write-Host "Vous pouvez l'installer via chocolatey: choco install openssl" -ForegroundColor Yellow
    exit 1
}

# Créer le répertoire des certificats s'il n'existe pas
$certsDir = Join-Path $PSScriptRoot "."
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

# Générer une clé privée
Write-Host "Génération de la clé privée..." -ForegroundColor Cyan
openssl genrsa -out "$certsDir/server.key" 2048

# Créer un fichier de configuration pour le certificat
$configContent = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = FR
ST = Loire-Atlantique
L = Nantes
O = Collectif Feydeau
OU = Développement
CN = localhost

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
DNS.3 = 192.168.1.15
"@

$configPath = "$certsDir/cert.conf"
$configContent | Out-File -FilePath $configPath -Encoding utf8

# Générer une demande de signature de certificat (CSR)
Write-Host "Génération de la demande de signature de certificat..." -ForegroundColor Cyan
openssl req -new -key "$certsDir/server.key" -out "$certsDir/server.csr" -config "$certsDir/cert.conf"

# Générer un certificat auto-signé
Write-Host "Génération du certificat auto-signé..." -ForegroundColor Cyan
openssl x509 -req -days 365 -in "$certsDir/server.csr" -signkey "$certsDir/server.key" -out "$certsDir/server.crt" -extensions req_ext -extfile "$certsDir/cert.conf"

# Vérifier que les fichiers ont été créés
if (Test-Path "$certsDir/server.key" -and Test-Path "$certsDir/server.crt") {
    Write-Host "Certificat généré avec succès!" -ForegroundColor Green
    Write-Host "Clé privée: $certsDir/server.key" -ForegroundColor Green
    Write-Host "Certificat: $certsDir/server.crt" -ForegroundColor Green
    
    # Créer un fichier de configuration Vite pour utiliser le certificat
    $viteConfigPath = Join-Path $PSScriptRoot ".." "vite.config.ts"
    
    if (Test-Path $viteConfigPath) {
        Write-Host "Mise à jour du fichier vite.config.ts..." -ForegroundColor Cyan
        
        # Lire le contenu actuel
        $viteConfig = Get-Content $viteConfigPath -Raw
        
        # Vérifier si la configuration HTTPS existe déjà
        if ($viteConfig -match "https\s*:") {
            Write-Host "La configuration HTTPS existe déjà dans vite.config.ts" -ForegroundColor Yellow
        } else {
            # Ajouter la configuration HTTPS
            $newConfig = $viteConfig -replace "export default defineConfig\(\{", @"
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt')),
    },
  },
"@
            
            # Écrire le nouveau contenu
            $newConfig | Out-File -FilePath $viteConfigPath -Encoding utf8
            Write-Host "Configuration HTTPS ajoutée à vite.config.ts" -ForegroundColor Green
        }
    } else {
        Write-Host "Le fichier vite.config.ts n'a pas été trouvé. Veuillez ajouter manuellement la configuration HTTPS." -ForegroundColor Yellow
    }
    
    Write-Host "Pour utiliser ce certificat, vous devrez peut-être l'ajouter aux certificats de confiance de votre navigateur." -ForegroundColor Yellow
} else {
    Write-Host "Erreur lors de la génération du certificat." -ForegroundColor Red
}

# Supprimer les fichiers temporaires
Remove-Item -Path "$certsDir/server.csr" -ErrorAction SilentlyContinue
Remove-Item -Path "$certsDir/cert.conf" -ErrorAction SilentlyContinue

Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Magenta
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
