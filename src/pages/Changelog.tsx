import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Info } from 'lucide-react';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useNavigate } from 'react-router-dom';

// Version statique (sera mise à jour par le script de versioning)
const APP_VERSION = '1.4.1';
const APP_NAME = 'Collectif Île Feydeau';

const Changelog: React.FC = () => {
  const navigate = useNavigate();
  const [changelogContent, setChangelogContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Charger le contenu du changelog
  useEffect(() => {
    const loadChangelog = async () => {
      try {
        setLoading(true);
        // Essayer de charger le changelog depuis GitHub
        const response = await fetch('https://raw.githubusercontent.com/CollectifIleFeydeau/1Hall1Artiste/main/CHANGELOG.md');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const content = await response.text();
        setChangelogContent(content);
      } catch (err) {
        console.error('Erreur lors du chargement du changelog:', err);
        setError('Impossible de charger le changelog. Veuillez réessayer plus tard.');
        
        // Fallback avec contenu statique
        setChangelogContent(`# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [${APP_VERSION}] - ${new Date().toLocaleDateString('fr-FR')}

### Ajouté
- 🎵 **Audio Guide complet** : Système d'audio guide intégré dans la carte interactive
- 📊 **Système de likes** : Les utilisateurs peuvent liker les contributions communautaires
- 🏛️ **Interface admin** : Gestion complète des événements et statistiques

### Modifié
- 🎨 **Interface utilisateur** : Améliorations de l'expérience utilisateur
- 📱 **Responsive design** : Optimisations pour mobile et tablette

### Corrigé
- 🔧 **Erreurs critiques** : Corrections des erreurs DOM et audio
- 🛡️ **Robustesse** : Gestion d'erreurs améliorée

Pour voir l'historique complet, visitez le [changelog sur GitHub](https://github.com/CollectifIleFeydeau/1Hall1Artiste/blob/main/CHANGELOG.md).`);
      } finally {
        setLoading(false);
      }
    };

    loadChangelog();
  }, []);

  // Convertir le markdown en HTML simple (basique)
  const parseMarkdown = (content: string): string => {
    return content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      // Liens
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1 <ExternalLink class="inline h-3 w-3" /></a>')
      // Gras
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italique
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Listes
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      // Paragraphes
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Retours à la ligne
      .replace(/\n/g, '<br />');
  };

  const version = APP_VERSION;
  
  // Déterminer le type de version basé sur le numéro
  const getVersionType = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    
    if (patch > 0) return { type: 'patch', color: 'bg-blue-500 text-white', icon: '🐛' };
    if (minor > 0) return { type: 'minor', color: 'bg-green-500 text-white', icon: '✨' };
    if (major > 0) return { type: 'major', color: 'bg-red-500 text-white', icon: '🚀' };
    
    return { type: 'initial', color: 'bg-gray-500 text-white', icon: '🎉' };
  };

  const versionInfo = getVersionType(version);
  
  // Date de build (approximative basée sur la date actuelle)
  const buildDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const openRepository = () => {
    window.open('https://github.com/CollectifIleFeydeau/1Hall1Artiste', '_blank');
  };

  const isProduction = window.location.hostname !== 'localhost';

  return (
    <div className="min-h-screen app-gradient pb-20 px-4 pt-4 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}> 
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94]">Changelog</h1>
          <div className="w-16" /> {/* Spacer pour centrer le titre */}
        </header>

        {/* Informations de version */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Version Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Version actuelle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Version</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${versionInfo.color}`}>
                {versionInfo.icon} v{version}
              </div>
            </div>

            {/* Type de version */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Type</span>
              <span className="text-sm capitalize">{versionInfo.type}</span>
            </div>

            {/* Date de build */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Dernière mise à jour</span>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {buildDate}
              </div>
            </div>

            {/* Environnement */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Environnement</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${isProduction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isProduction ? '🌐 Production' : '🔧 Développement'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openRepository}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Repository GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenu du changelog */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Journal des modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Chargement du changelog...</span>
              </div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: `<div class="mb-3">${parseMarkdown(changelogContent)}</div>` 
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer hover:text-gray-800 font-medium">
                Informations techniques
              </summary>
              <div className="mt-3 space-y-2 text-xs">
                <div><strong>Nom:</strong> {APP_NAME}</div>
                <div><strong>Framework:</strong> React + Vite + TypeScript</div>
                <div><strong>UI:</strong> Tailwind CSS + Shadcn/ui</div>
                <div><strong>Déploiement:</strong> GitHub Pages</div>
                <div><strong>Hostname:</strong> {window.location.hostname}</div>
                <div><strong>URL:</strong> {window.location.origin}</div>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Changelog;
