import React, { useState, useEffect } from 'react';
import { getFirebaseAnalytics } from '@/services/firebaseConfig';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EventCategory, EventAction } from '@/services/firebaseAnalytics';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Download from 'lucide-react/dist/esm/icons/download';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';
import LineChart from 'lucide-react/dist/esm/icons/line-chart';
import Activity from 'lucide-react/dist/esm/icons/activity';

/**
 * Page d'administration pour visualiser les statistiques d'utilisation
 * Cette page affiche les données collectées par Firebase Analytics
 */
export default function Analytics() {
  const analytics = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Suivre la vue de la page analytics
  useEffect(() => {
    analytics.trackFeatureUse('analytics_dashboard', {
      tab: activeTab
    });
  }, [activeTab, analytics]);

  // Simuler le chargement des données d'analytics
  // Dans une implémentation réelle, vous utiliseriez l'API Firebase Analytics
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données simulées pour la démonstration
        setAnalyticsData({
          overview: {
            totalUsers: 1245,
            activeUsers: 328,
            sessionsToday: 156,
            averageSessionDuration: '3m 42s',
            bounceRate: '24%'
          },
          events: [
            { name: 'onboarding_onboarding_start', count: 523, users: 523 },
            { name: 'onboarding_onboarding_complete', count: 412, users: 412 },
            { name: 'onboarding_onboarding_skip', count: 111, users: 111 },
            { name: 'interaction_swipe', count: 2456, users: 387 },
            { name: 'navigation_page_view', count: 5678, users: 523 },
            { name: 'media_play', count: 345, users: 289 },
            { name: 'media_complete', count: 198, users: 198 },
            { name: 'feature_feature_use', count: 1234, users: 456 }
          ],
          topPages: [
            { path: '/map', views: 1245, users: 423 },
            { path: '/program', views: 987, users: 356 },
            { path: '/community', views: 756, users: 289 },
            { path: '/about', views: 543, users: 234 },
            { path: '/saved', views: 432, users: 198 }
          ],
          userRetention: {
            day1: '76%',
            day7: '45%',
            day30: '28%'
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  // Fonction pour exporter les données au format JSON
  const handleExportData = () => {
    if (!analyticsData) return;

    analytics.trackFeatureUse('analytics_export', {
      format: 'json'
    });

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistiques d'utilisation</h1>
        <Button 
          variant="outline" 
          onClick={handleExportData}
          disabled={isLoading || !analyticsData}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : analyticsData ? (
          <>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Utilisateurs totaux</p>
                      <h3 className="text-2xl font-bold">{analyticsData.overview.totalUsers}</h3>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Utilisateurs actifs</p>
                      <h3 className="text-2xl font-bold">{analyticsData.overview.activeUsers}</h3>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Sessions aujourd'hui</p>
                      <h3 className="text-2xl font-bold">{analyticsData.overview.sessionsToday}</h3>
                    </div>
                    <LineChart className="h-8 w-8 text-purple-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Durée moyenne de session</p>
                      <h3 className="text-2xl font-bold">{analyticsData.overview.averageSessionDuration}</h3>
                    </div>
                    <PieChart className="h-8 w-8 text-orange-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Taux de rebond</p>
                      <h3 className="text-2xl font-bold">{analyticsData.overview.bounceRate}</h3>
                    </div>
                    <Activity className="h-8 w-8 text-red-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Rétention J+30</p>
                      <h3 className="text-2xl font-bold">{analyticsData.userRetention.day30}</h3>
                    </div>
                    <BarChart3 className="h-8 w-8 text-indigo-500" />
                  </div>
                </Card>
              </div>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Rétention des utilisateurs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Jour 1</p>
                    <p className="text-xl font-bold">{analyticsData.userRetention.day1}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Jour 7</p>
                    <p className="text-xl font-bold">{analyticsData.userRetention.day7}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Jour 30</p>
                    <p className="text-xl font-bold">{analyticsData.userRetention.day30}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Événements les plus fréquents</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Événement</th>
                        <th className="text-right py-2">Nombre</th>
                        <th className="text-right py-2">Utilisateurs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.events.map((event: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{event.name}</td>
                          <td className="text-right py-2">{event.count}</td>
                          <td className="text-right py-2">{event.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="pages" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Pages les plus visitées</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Page</th>
                        <th className="text-right py-2">Vues</th>
                        <th className="text-right py-2">Utilisateurs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topPages.map((page: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{page.path}</td>
                          <td className="text-right py-2">{page.views}</td>
                          <td className="text-right py-2">{page.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Nouveaux vs. Récurrents</h3>
                  <div className="flex justify-center items-center h-48">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold">68%</div>
                        <div className="text-sm text-gray-500">Nouveaux</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">32%</div>
                        <div className="text-sm text-gray-500">Récurrents</div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Engagement</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Onboarding complété</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Vidéos visionnées</span>
                        <span className="text-sm font-medium">57%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Interactions carte</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Parcours utilisateur</h3>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Onboarding
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Carte
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Programme
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    Détails événement
                  </div>
                </div>
              </Card>
            </TabsContent>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Impossible de charger les données d'analytics</p>
          </div>
        )}
      </Tabs>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Note: Ces données sont simulées à des fins de démonstration. Dans une implémentation réelle, vous utiliseriez l'API Firebase Analytics pour récupérer les données réelles.</p>
        <p className="mt-1">Pour accéder aux données réelles, consultez la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">console Firebase</a>.</p>
      </div>
    </div>
  );
}
