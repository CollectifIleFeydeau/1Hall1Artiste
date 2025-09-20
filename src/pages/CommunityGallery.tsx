import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useLocation } from "react-router-dom";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Camera from "lucide-react/dist/esm/icons/camera";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Filter from "lucide-react/dist/esm/icons/filter";
import { useToast } from "../components/ui/use-toast";
import { BottomNavigation } from "../components/BottomNavigation";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

// Types
import { CommunityEntry, EntryType } from "../types/communityTypes";

// Services
import { fetchCommunityEntries } from "../services/cloudinaryService";

// Composants
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";
import { ContributionForm } from "../components/community/ContributionForm";
import { GalleryGrid } from "../components/community/GalleryGrid";
import { EntryDetail } from "../components/community/EntryDetail";
import { PullToRefresh } from "../components/community/PullToRefresh";

const CommunityGallery: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "photo" | "testimonial">("all");
  const [activeTab, setActiveTab] = useState<"gallery" | "contribute">("gallery");
  const [lastKnownCount, setLastKnownCount] = useState<number>(0);
  const [selectedEntry, setSelectedEntry] = useState<CommunityEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Vérifier si un onglet est spécifié dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'contribute') {
      setActiveTab('contribute');
      // Analytics: user landed directly on contribute tab
      analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'start', source: 'url_param' });
    }
  }, [location]);

  // Charger les entrées au chargement de la page
  const loadEntries = async (showNewNotification = false) => {
    try {
      setError(null);
      const data = await fetchCommunityEntries();
      
      // Vérifier s'il y a de nouvelles contributions
      if (showNewNotification && lastKnownCount > 0 && data.length > lastKnownCount) {
        const newCount = data.length - lastKnownCount;
        toast({
          title: "🎉 Nouvelles contributions !",
          description: `${newCount} nouvelle${newCount > 1 ? 's' : ''} contribution${newCount > 1 ? 's' : ''} ajoutée${newCount > 1 ? 's' : ''}`,
          duration: 5000
        });
      }
      
      setEntries(data);
      setLastKnownCount(data.length);
      
      
      // Analytics: successful load
      analytics.trackCommunityInteraction(EventAction.VIEW, { 
        content_type: 'gallery', 
        entries_count: data.length 
      });
    } catch (err) {
      console.error('Erreur lors du chargement des entrées:', err);
      setError('Impossible de charger les contributions. Veuillez réessayer.');
      
      // Analytics: load error
      analytics.trackCommunityInteraction(EventAction.VIEW, { 
        content_type: 'gallery', 
        error: 'load_failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
    
    // Les notifications sont maintenant gérées par BottomNavigation
    
    return () => {};
  }, []);

  // Vérification périodique des nouvelles contributions (toutes les 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "gallery") {
        console.log('[CommunityGallery] Vérification des nouvelles contributions...');
        loadEntries(true);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [activeTab, lastKnownCount]);

  // Fonction de rafraîchissement pour Pull-to-Refresh
  const handleRefresh = async () => {
    await loadEntries();
    
    // Toast de confirmation
    toast({
      title: "✅ Galerie actualisée",
      description: "Les dernières contributions ont été chargées",
      duration: 2000
    });
    
    // Analytics: manual refresh
    analytics.trackCommunityInteraction(EventAction.VIEW, { 
      content_type: 'gallery', 
      action: 'manual_refresh' 
    });
  };

  // Gérer l'ajout d'une nouvelle contribution
  const handleNewContribution = (newEntry: CommunityEntry) => {
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setActiveTab("gallery");
    
    // Toast de succès
    toast({
      title: "🎉 Contribution envoyée !",
      description: "Votre contribution sera visible dans quelques minutes",
      duration: 4000
    });
    
    // Analytics: new contribution
    analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { 
      stage: 'completed', 
      content_type: newEntry.type 
    });
  };

  // Filtrer les entrées selon le filtre actuel
  const filteredEntries = entries.filter(entry => {
    // Exclure les entrées rejetées (supprimées par l'admin)
    if (entry.moderation?.status === 'rejected') {
      return false;
    }
    
    // Filtrer par type
    if (filter === "all") return true;
    return entry.type === filter;
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Galerie Communautaire" 
        subtitle="Partagez vos moments et découvrez ceux des autres"
      />
      
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full pb-32" // Augmentation du padding-bottom pour le menu
      >
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as "gallery" | "contribute");
            if (value === 'contribute') {
              analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'start', source: 'tab_click' });
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera size={16} />
              <span>Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="contribute" className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Contribuer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="h-full">
            <PullToRefresh 
              onRefresh={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Réessayer</Button>
                </div>
              ) : (
                <>
                  {/* Filtres */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="text-sm font-medium">Filtrer:</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={filter === "all" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => { setFilter("all"); analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'all' }); }}
                      >
                        Tous
                      </Button>
                      <Button 
                        variant={filter === "photo" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => { setFilter("photo"); analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'photo' }); }}
                      >
                        Photos
                      </Button>
                      <Button 
                        variant={filter === "testimonial" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => { setFilter("testimonial"); analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'testimonial' }); }}
                      >
                        Témoignages
                      </Button>
                    </div>
                  </div>

                  {/* Grille de la galerie */}
                  {filteredEntries.length > 0 ? (
                    <GalleryGrid 
                      entries={filteredEntries} 
                      onEntryClick={(entry) => { 
                        const index = filteredEntries.findIndex(e => e.id === entry.id);
                        setSelectedIndex(index);
                        setSelectedEntry(entry);
                        analytics.trackCommunityInteraction(EventAction.VIEW, { content_type: 'entry', entry_id: entry.id });
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <p className="text-gray-500 mb-4">Aucune contribution dans cette catégorie</p>
                      <Button onClick={() => { analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'start', source: 'empty_state' }); setActiveTab("contribute"); }}>Soyez le premier à contribuer</Button>
                    </div>
                  )}
                </>
              )}
            </PullToRefresh>
          </TabsContent>

          <TabsContent value="contribute" className="h-full">
            <ContributionForm onSubmit={handleNewContribution} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal de détail d'une entrée */}
      {selectedEntry && (
        <EntryDetail 
          entry={selectedEntry}
          entries={filteredEntries}
          currentIndex={selectedIndex}
          onClose={() => setSelectedEntry(null)}
          onNavigate={(index) => {
            setSelectedIndex(index);
            setSelectedEntry(filteredEntries[index]);
          }}
        />
      )}
      
      {/* Menu de navigation du bas */}
      <BottomNavigation />
    </PageContainer>
  );
};

export default CommunityGallery;
