import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Heart from 'lucide-react/dist/esm/icons/heart';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Users from 'lucide-react/dist/esm/icons/users';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import { getLikeStats } from '@/services/likesService';
import { fetchCommunityEntries } from '@/services/cloudinaryService';
import { CommunityEntry } from '@/types/communityTypes';

interface ContributionWithLikes extends CommunityEntry {
  likesCount: number;
}

interface LikesStats {
  totalLikes: number;
  totalContributions: number;
  averageLikes: number;
  topContributions: ContributionWithLikes[];
}

export const LikesStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<LikesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques globales
      const globalStats = await getLikeStats();
      
      // Récupérer toutes les contributions
      const contributions = await fetchCommunityEntries();
      
      // Pour chaque contribution, récupérer le nombre de likes
      const contributionsWithLikes: ContributionWithLikes[] = [];
      let totalLikes = 0;

      for (const contribution of contributions) {
        try {
          // Simuler la récupération des likes pour chaque contribution
          // En production, on pourrait optimiser avec une requête batch
          const response = await fetch(
            `https://collectif-feydeau-default-rtdb.europe-west1.firebasedatabase.app/likes-data/${contribution.id}.json`
          );
          
          if (response.ok) {
            const likeData = await response.json();
            const likesCount = likeData?.likes || 0;
            
            contributionsWithLikes.push({
              ...contribution,
              likesCount
            });
            
            totalLikes += likesCount;
          } else {
            contributionsWithLikes.push({
              ...contribution,
              likesCount: 0
            });
          }
        } catch (err) {
          console.warn(`Erreur lors de la récupération des likes pour ${contribution.id}:`, err);
          contributionsWithLikes.push({
            ...contribution,
            likesCount: 0
          });
        }
      }

      // Trier par nombre de likes décroissant et prendre le top 5
      const topContributions = contributionsWithLikes
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, 5);

      const averageLikes = contributions.length > 0 ? totalLikes / contributions.length : 0;

      setStats({
        totalLikes,
        totalContributions: contributions.length,
        averageLikes: Math.round(averageLikes * 10) / 10,
        topContributions
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Setup polling pour mise à jour temps réel (toutes les 10 secondes)
    const interval = setInterval(() => {
      console.log('🔄 Mise à jour automatique des statistiques likes');
      loadStats();
    }, 10000); // 10 secondes pour les stats (moins fréquent que les likes individuels)
    
    return () => {
      console.log('🔇 Arrêt polling statistiques likes');
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques des Likes
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
            <BarChart3 className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStats} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
          Statistiques des Likes
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {lastUpdate && (
            <span className="text-xs sm:text-sm text-gray-500">
              Mis à jour : {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={loadStats} variant="outline" size="sm">
            🔄 Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des Likes</p>
                <p className="text-3xl font-bold text-red-500">{stats?.totalLikes || 0}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contributions</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalContributions || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moyenne par contribution</p>
                <p className="text-3xl font-bold text-green-600">{stats?.averageLikes || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 des contributions les plus likées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 des Contributions les Plus Likées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topContributions && stats.topContributions.length > 0 ? (
            <div className="space-y-4">
              {stats.topContributions.map((contribution, index) => (
                <div key={contribution.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{contribution.displayName}</p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {contribution.description || contribution.content || 'Sans description'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {contribution.type === 'photo' ? '📷 Photo' : '💬 Témoignage'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-red-500 font-bold self-end sm:self-center">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="text-lg">{contribution.likesCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucune contribution avec des likes pour le moment
            </p>
          )}
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <p><strong>Base de données :</strong> Firebase Realtime Database</p>
              <p><strong>Synchronisation :</strong> Temps réel (likes: 5s, stats: 10s)</p>
            </div>
            <div className="space-y-2">
              <p><strong>Prévention spam :</strong> 1 like par session utilisateur</p>
              <p><strong>Persistance :</strong> Données sauvegardées automatiquement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

