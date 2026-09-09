import { IMAGE_PATHS } from '../constants/imagePaths';
import { cloudinaryThumb } from '@/utils/cloudinary';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ActionButton } from "../components/ui/ActionButton";
import { FilterButton } from "../components/ui/FilterButton";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { useLocation, useNavigate } from "react-router-dom";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Camera from "lucide-react/dist/esm/icons/camera";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Filter from "lucide-react/dist/esm/icons/filter";
import X from "lucide-react/dist/esm/icons/x";
import { useToast } from "../components/ui/use-toast";
import { BottomNavigation } from "../components/BottomNavigation";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

// Types
import { CommunityEntry, EntryType } from "../types/communityTypes";

// Services
import { fetchCommunityEntries } from "../services/cloudinaryService";

// Interface pour les photos historiques dans la galerie unifiée
interface HistoricalPhoto {
  id: string;
  path: string;
  type: 'historical';
  displayName: string;
  timestamp: string;
  description: string;
}

// Type unifié pour toutes les entrées de la galerie
type UnifiedGalleryEntry = CommunityEntry | HistoricalPhoto;

// Composants
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";
import { ContributionForm } from "../components/community/ContributionForm";
import { GalleryGrid } from "../components/community/GalleryGrid";
import { EntryDetail } from "../components/community/EntryDetail";

const Gallery: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [communityEntries, setCommunityEntries] = useState<CommunityEntry[]>([]);
  const [historicalPhotos, setHistoricalPhotos] = useState<HistoricalPhoto[]>([]);
  const [allEntries, setAllEntries] = useState<UnifiedGalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "photo" | "testimonial" | "historical">("all");
  const [activeTab, setActiveTab] = useState<"gallery" | "contribute">("gallery");
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [lastKnownCount, setLastKnownCount] = useState<number>(0);
  const [selectedEntry, setSelectedEntry] = useState<UnifiedGalleryEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [visibleHistoricalCount, setVisibleHistoricalCount] = useState<number>(151); // Charger toutes les photos d'un coup pour éviter les re-renders

  // Vérifier si un onglet est spécifié dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');

    if (tabParam === 'contribute') {
      setShowContributeModal(true);
      // Analytics: user landed directly on contribute tab
      analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'start', source: 'url_param' });
    }
  }, [location]);

  // Gérer l'ouverture d'une photo depuis un lien partagé (?entry=<id>)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const entryParam = params.get('entry');

    if (!entryParam || allEntries.length === 0) return;

    const entryIndex = allEntries.findIndex(e => e.id === entryParam);
    if (entryIndex !== -1) {
      setSelectedEntry(allEntries[entryIndex]);
      setSelectedIndex(entryIndex);
    } else {
      toast({
        title: "Photo introuvable",
        description: "Cette photo n'existe plus ou le lien est invalide.",
        variant: "destructive"
      });
    }
  }, [location.search, allEntries, toast]);

  // Fonction pour charger les photos historiques (avec limite)
  const loadHistoricalPhotos = (limit?: number): HistoricalPhoto[] => {
    const photos: HistoricalPhoto[] = [];
    const maxPhotos = limit || 151;

    // Ajouter les photos historiques (jusqu'à la limite)
    for (let i = 1; i <= maxPhotos; i++) {
      const cloudinaryUrl = `https://res.cloudinary.com/dpatqkgsc/image/upload/static/historical/photos-${i}`;
      photos.push({
        id: `historical-${i}`,
        path: cloudinaryThumb(cloudinaryUrl, 400, 400) || cloudinaryUrl,
        type: 'historical',
        displayName: 'Archives historiques',
        timestamp: '1900-01-01T00:00:00.000Z', // Date ancienne pour les trier après les nouvelles
        description: `Photo historique ${i} de l'Île Feydeau`
      });
    }

    return photos;
  };

  // Fonction pour fusionner et trier toutes les entrées
  const mergeAllEntries = (community: CommunityEntry[], historical: HistoricalPhoto[]): UnifiedGalleryEntry[] => {
    // Les nouvelles photos communautaires en premier, puis les photos historiques
    const sortedCommunity = [...community].sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
    
    return [...sortedCommunity, ...historical];
  };

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
      
      // Charger les photos historiques (avec limite progressive)
      const historical = loadHistoricalPhotos(visibleHistoricalCount);
      
      // Fusionner toutes les entrées
      const merged = mergeAllEntries(data, historical);
      
      
      setCommunityEntries(data);
      setHistoricalPhotos(historical);
      setAllEntries(merged);
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
  }, [visibleHistoricalCount]);

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

  // Lazy loading désactivé - charger toutes les photos d'un coup
  // Le lazy loading causait 6+ re-renders qui créaient le scintillement

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
    const updatedCommunity = [newEntry, ...communityEntries];
    const merged = mergeAllEntries(updatedCommunity, historicalPhotos);
    
    setCommunityEntries(updatedCommunity);
    setAllEntries(merged);
    setShowContributeModal(false); // Fermer la modal
    
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
  const filteredEntries = allEntries.filter(entry => {
    // Exclure les entrées rejetées (supprimées par l'admin) - seulement pour les entrées communautaires
    if ('moderation' in entry && entry.moderation?.status === 'rejected') {
      return false;
    }
    
    // Filtrer par type
    if (filter === "all") return true;
    if (filter === "historical") return entry.type === 'historical';
    if (filter === "photo") {
      // Seulement les photos communautaires (les historiques ont leur propre onglet)
      return entry.type === 'photo';
    }
    if (filter === "testimonial") {
      // Seulement les témoignages communautaires
      return entry.type === 'testimonial';
    }
    return entry.type === filter;
  });


  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#fbe5b7' }}>
      {/* Header fixe avec fond parchemin */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-4 border-b border-gray-200/50"
        style={{
          backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.PARCHMENT}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header avec bouton retour */}
          <header className="mb-4 flex items-center justify-between">
            <button
              aria-label="Retour"
              title="Retour"
              onClick={() => navigate("/map")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#1a2138] font-serif">Galerie</h1>
              <p className="text-sm text-amber-700 font-medium">Photos communautaires et archives historiques de l'Île Feydeau</p>
            </div>
            <div className="w-20" /> {/* Spacer pour centrer le titre */}
          </header>
          
          {/* Bouton Contribuer et Filtres */}
          <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
            {/* Bouton Contribuer */}
            <button
              onClick={() => {
                setShowContributeModal(true);
                analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'start', source: 'button_click' });
              }}
              className="h-12 border-2 border-[#1a2138] text-[#1a2138] bg-white/70 hover:bg-[#1a2138] hover:text-white rounded-full font-medium text-sm transition-colors px-6 flex items-center gap-2"
            >
              <MessageSquare size={16} />
              <span>Contribuer</span>
            </button>

            {/* Filtres */}
              <FilterButton 
                active={filter === "all"}
                onClick={() => { 
                  setFilter("all"); 
                  analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'all' }); 
                }}
              >
                Tous
              </FilterButton>
              <FilterButton 
                active={filter === "photo"}
                onClick={() => { 
                  setFilter("photo"); 
                  analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'photo' }); 
                }}
              >
                Photos
              </FilterButton>
              <FilterButton 
                active={filter === "testimonial"}
                onClick={() => { 
                  setFilter("testimonial"); 
                  analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'testimonial' }); 
                }}
              >
                Témoignages
              </FilterButton>
              <FilterButton 
                active={filter === "historical"}
                onClick={() => { 
                  setFilter("historical"); 
                  analytics.trackCommunityInteraction(EventAction.FILTER, { filter: 'historical' }); 
                }}
              >
                Historiques
              </FilterButton>
          </div>
        </div>
      </div>

      {/* Contenu scrollable avec padding-top pour compenser le header fixe */}
      <div className="max-w-4xl mx-auto px-4" style={{ paddingTop: '220px' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <div className="bg-transparent rounded-xl">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <ActionButton variant="primary" onClick={() => window.location.reload()}>Réessayer</ActionButton>
              </div>
            ) : (
              <>
                {/* Grille de la galerie */}
                  <GalleryGrid 
                    entries={filteredEntries}
                    onEntryClick={(entry) => { 
                      const index = filteredEntries.findIndex(e => e.id === entry.id);
                      setSelectedIndex(index);
                      setSelectedEntry(entry);
                      analytics.trackCommunityInteraction(EventAction.VIEW, { content_type: 'entry', entry_id: entry.id });
                    }}
                  />
              </>
            )}
          </div>
        </motion.div>

        {/* Modal de contribution */}
        {showContributeModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowContributeModal(false)}
          >
            <div 
              className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
              style={{
                backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.PARCHMENT}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'local'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-10 p-6">
                {/* Header avec titre et bouton fermer */}
                <div className="flex justify-between items-start mb-6 pb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#1a2138] font-serif mb-2">
                      Contribuer
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      Partagez vos photos et témoignages
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowContributeModal(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
                    title="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Formulaire de contribution */}
                <ContributionForm onSubmit={handleNewContribution} />
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Gallery;





