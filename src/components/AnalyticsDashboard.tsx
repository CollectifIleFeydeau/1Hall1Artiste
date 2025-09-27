import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  getAppMetadata, 
  getStoredErrors, 
  getStoredEvents, 
  clearAnalyticsData,
  ErrorEvent,
  UsageEvent,
  AppMetadata,
  ErrorCategory
} from "@/services/analyticsService";
import { createLogger } from "@/utils/logger";

// Créer un logger pour le composant
const logger = createLogger('AnalyticsDashboard');

// Couleurs pour les catégories d'erreurs
const categoryColors: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: '#e53935', // Rouge
  [ErrorCategory.UI]: '#ff7a45',      // Orange
  [ErrorCategory.DATA]: '#ffb74d',    // Jaune orangé
  [ErrorCategory.NAVIGATION]: '#4a5d94', // Bleu
  [ErrorCategory.PERMISSION]: '#9c27b0', // Violet
  [ErrorCategory.STORAGE]: '#2e7d32',  // Vert
  [ErrorCategory.UNKNOWN]: '#757575'   // Gris
};

export function AnalyticsDashboard() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  
  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);
  
  // Fonction pour charger toutes les données d'analyse
  const loadData = () => {
    try {
      const storedErrors = getStoredErrors();
      const storedEvents = getStoredEvents();
      const appMetadata = getAppMetadata();
      
      setErrors(storedErrors);
      setEvents(storedEvents);
      setMetadata(appMetadata);
      
      logger.info("Données d'analyse chargées", { 
        errorsCount: storedErrors.length,
        eventsCount: storedEvents.length
      });
    } catch (error) {
      logger.error("Erreur lors du chargement des données d'analyse", { error });
    }
  };
  
  // Fonction pour effacer toutes les données d'analyse
  const handleClearData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données d'analyse ?")) {
      clearAnalyticsData();
      loadData(); // Recharger les données (qui seront vides)
    }
  };
  
  // Fonction pour exporter les données au format JSON
  const handleExportData = () => {
    try {
      const exportData = {
        metadata,
        errors,
        events,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFilename = `feydeau-analytics-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFilename);
      linkElement.click();
      
      logger.info("Données d'analyse exportées", { filename: exportFilename });
    } catch (error) {
      logger.error("Erreur lors de l'exportation des données", { error });
    }
  };
  
  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Calculer des statistiques pour l'aperçu
  const totalErrors = errors.length;
  const totalEvents = events.length;
  
  // Regrouper les erreurs par catégorie
  const errorsByCategory = errors.reduce((acc, error) => {
    acc[error.category] = (acc[error.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Regrouper les événements par nom
  const eventsByName = events.reduce((acc, event) => {
    acc[event.eventName] = (acc[event.eventName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculer les erreurs les plus fréquentes
  const topErrors = [...errors]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#4a5d94]">Tableau de bord d'analyse</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={loadData}>
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            Exporter
          </Button>
          <Button variant="destructive" onClick={handleClearData}>
            Effacer
          </Button>
        </div>
      </div>
      
      {metadata && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informations sur l'application</CardTitle>
            <CardDescription>Métadonnées de l'application et de l'appareil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Application</h3>
                <p className="text-sm">Version: {metadata.version}</p>
                <p className="text-sm">Environnement: {metadata.environment}</p>
                <p className="text-sm">ID d'installation: {metadata.installId.substring(0, 8)}...</p>
                <p className="text-sm">ID de session: {metadata.sessionId.substring(0, 8)}...</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Appareil</h3>
                <p className="text-sm">Plateforme: {metadata.deviceInfo.platform}</p>
                <p className="text-sm">Système: {metadata.deviceInfo.osVersion || 'Inconnu'}</p>
                <p className="text-sm">Navigateur: {metadata.deviceInfo.browser} {metadata.deviceInfo.browserVersion}</p>
                <p className="text-sm">Écran: {metadata.deviceInfo.screenSize}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Statut</h3>
                <p className="text-sm">
                  Connexion: {metadata.deviceInfo.isOnline ? 
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white">En ligne</div> : 
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">Hors ligne</div>
                  }
                </p>
                <p className="text-sm">
                  Type: {metadata.deviceInfo.isMobile ? 'Mobile' : 
                    metadata.deviceInfo.isTablet ? 'Tablette' : 'Ordinateur'}
                </p>
                <p className="text-sm">Langue: {metadata.deviceInfo.language}</p>
                {metadata.deviceInfo.memoryInfo && (
                  <p className="text-sm">Mémoire: {metadata.deviceInfo.memoryInfo}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>
        
        {/* Onglet Aperçu */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Erreurs</CardTitle>
                <CardDescription>Total des erreurs suivies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalErrors}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Par catégorie</h4>
                  {Object.entries(errorsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: categoryColors[category as ErrorCategory] }}
                        ></div>
                        <span className="text-xs">{category}</span>
                      </div>
                      <span className="text-xs font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Événements</CardTitle>
                <CardDescription>Total des événements suivis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalEvents}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Top événements</h4>
                  {Object.entries(eventsByName)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center mb-1">
                        <span className="text-xs truncate max-w-[70%]">{name}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Erreurs fréquentes</CardTitle>
                <CardDescription>Erreurs les plus courantes</CardDescription>
              </CardHeader>
              <CardContent>
                {topErrors.length > 0 ? (
                  <div className="space-y-2">
                    {topErrors.map((error) => (
                      <div 
                        key={error.errorId} 
                        className="p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedError(error);
                          setActiveTab("errors");
                        }}
                      >
                        <div className="flex items-center">
                          <div 
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mr-2 text-white"
                            style={{ backgroundColor: categoryColors[error.category] }}
                          >
                            {error.count}
                          </div>
                          <span className="text-xs truncate">{error.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune erreur enregistrée</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Onglet Erreurs */}
        <TabsContent value="errors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Liste des erreurs</CardTitle>
                  <CardDescription>
                    {errors.length} erreur{errors.length !== 1 ? 's' : ''} enregistrée{errors.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {errors.length > 0 ? (
                      <div className="divide-y">
                        {errors.map((error) => (
                          <div 
                            key={error.errorId}
                            className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedError?.errorId === error.errorId ? 'bg-gray-100' : ''}`}
                            onClick={() => setSelectedError(error)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div 
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white"
                                style={{ backgroundColor: categoryColors[error.category] }}
                              >
                                {error.category}
                              </div>
                              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-transparent">
                                {error.count} {error.count > 1 ? 'occurrences' : 'occurrence'}
                              </div>
                            </div>
                            <p className="text-sm font-medium truncate">{error.message}</p>
                            <p className="text-xs text-gray-500">
                              Dernière: {formatDate(error.lastOccurrence)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Aucune erreur enregistrée
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedError ? (
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{selectedError.message}</CardTitle>
                        <CardDescription>
                          ID: {selectedError.errorId} | Empreinte: {selectedError.fingerprint}
                        </CardDescription>
                      </div>
                      <div 
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: categoryColors[selectedError.category] }}
                      >
                        {selectedError.category}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Occurrences</h3>
                        <p className="text-sm">
                          {selectedError.count} occurrence{selectedError.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm">
                          Première: {formatDate(selectedError.firstOccurrence)}
                        </p>
                        <p className="text-sm">
                          Dernière: {formatDate(selectedError.lastOccurrence)}
                        </p>
                      </div>
                      
                      {selectedError.stack && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Stack Trace</h3>
                          <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                            {selectedError.stack}
                          </pre>
                        </div>
                      )}
                      
                      {selectedError.componentStack && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Pile de composants</h3>
                          <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                            {selectedError.componentStack}
                          </pre>
                        </div>
                      )}
                      
                      {selectedError.context && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Contexte</h3>
                          <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                            {JSON.stringify(selectedError.context, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Métadonnées</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p><span className="font-medium">Version:</span> {selectedError.metadata.version}</p>
                            <p><span className="font-medium">Environnement:</span> {selectedError.metadata.environment}</p>
                            <p><span className="font-medium">Navigateur:</span> {selectedError.metadata.deviceInfo.browser} {selectedError.metadata.deviceInfo.browserVersion}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Plateforme:</span> {selectedError.metadata.deviceInfo.platform}</p>
                            <p><span className="font-medium">Système:</span> {selectedError.metadata.deviceInfo.osVersion || 'Inconnu'}</p>
                            <p><span className="font-medium">Type:</span> {
                              selectedError.metadata.deviceInfo.isMobile ? 'Mobile' : 
                              selectedError.metadata.deviceInfo.isTablet ? 'Tablette' : 'Ordinateur'
                            }</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center p-6">
                    <p className="text-gray-500">Sélectionnez une erreur pour voir les détails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Onglet Événements */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Journal des événements</CardTitle>
              <CardDescription>
                {events.length} événement{events.length !== 1 ? 's' : ''} enregistré{events.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Horodatage</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Événement</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Propriétés</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-500">Appareil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? (
                      events.map((event, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-xs">
                            {formatDate(event.timestamp)}
                          </td>
                          <td className="p-3">
                            <span className="text-sm font-medium">{event.eventName}</span>
                          </td>
                          <td className="p-3">
                            {event.properties ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer">Voir les propriétés</summary>
                                <pre className="mt-2 bg-gray-100 p-2 rounded-md overflow-x-auto">
                                  {JSON.stringify(event.properties, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-xs text-gray-500">Aucune propriété</span>
                            )}
                          </td>
                          <td className="p-3 text-xs">
                            <div>
                              {event.metadata.deviceInfo.browser} {event.metadata.deviceInfo.browserVersion}
                            </div>
                            <div className="text-gray-500">
                              {event.metadata.deviceInfo.isMobile ? 'Mobile' : 
                               event.metadata.deviceInfo.isTablet ? 'Tablette' : 'Ordinateur'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Aucun événement enregistré
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

