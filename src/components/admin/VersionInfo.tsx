import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Info } from 'lucide-react';

// Version statique (sera mise à jour par le script de versioning)
const APP_VERSION = '1.3.7';
const APP_NAME = 'Collectif Île Feydeau';

const VersionInfo: React.FC = () => {
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

  const openChangelog = () => {
    window.open('https://github.com/CollectifIleFeydeau/1Hall1Artiste/blob/main/CHANGELOG.md', '_blank');
  };

  const openRepository = () => {
    window.open('https://github.com/CollectifIleFeydeau/1Hall1Artiste', '_blank');
  };

  const isProduction = window.location.hostname !== 'localhost';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Informations Version
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version actuelle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Version actuelle</span>
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
            onClick={openChangelog}
            className="flex-1"
          >
            📝 Changelog
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openRepository}
            className="flex-1"
          >
            🔗 Repository
          </Button>
        </div>

        {/* Informations techniques */}
        <div className="pt-2 border-t">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">
              Informations techniques
            </summary>
            <div className="mt-2 space-y-1">
              <div>Nom: {APP_NAME}</div>
              <div>Framework: React + Vite + TypeScript</div>
              <div>UI: Tailwind CSS + Shadcn/ui</div>
              <div>Déploiement: GitHub Pages</div>
              <div>Hostname: {window.location.hostname}</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionInfo;
