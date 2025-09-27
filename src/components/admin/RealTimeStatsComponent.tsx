import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Eye from 'lucide-react/dist/esm/icons/eye';
import MousePointer from 'lucide-react/dist/esm/icons/mouse-pointer';
import Clock from 'lucide-react/dist/esm/icons/clock';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Play from 'lucide-react/dist/esm/icons/play';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';

export const RealTimeStatsComponent: React.FC = () => {
  const { stats, loading, error, sendTestEvent, refresh } = useRealTimeStats();

  const handleTestEvent = async () => {
    try {
      const testId = await sendTestEvent();
      console.log(`📊 Événement de test envoyé (ID: ${testId})`);
    } catch (error) {
      console.error('📊 Erreur test événement:', error);
    }
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Statistiques Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement des statistiques...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Activity className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec boutons d'action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
          Statistiques Temps Réel
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleTestEvent} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Test Événement
          </Button>
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Utilisateurs actifs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages vues */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pages vues</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.pageViews || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Événements */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Événements</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.events || 0}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pages les plus visitées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{page.page}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{page.views} vues</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Informations Techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <p><strong>Service :</strong> Direct Analytics (sans SDK)</p>
              <p><strong>Mise à jour :</strong> Temps réel (10s)</p>
            </div>
            <div className="space-y-2">
              <p><strong>Dernière MAJ :</strong> {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'N/A'}</p>
              <p><strong>Mode :</strong> {import.meta.env.DEV ? 'Développement' : 'Production'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

