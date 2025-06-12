import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useLocation } from "react-router-dom";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Camera from "lucide-react/dist/esm/icons/camera";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import Filter from "lucide-react/dist/esm/icons/filter";
import { useToast } from "../components/ui/use-toast";
import { BottomNavigation } from "../components/BottomNavigation";

// Types
import { CommunityEntry, EntryType } from "../types/communityTypes";

// Services
import { fetchCommunityEntries, toggleLike } from "../services/communityService";

// Composants
import { PageContainer } from "../components/PageContainer";
import { PageHeader } from "../components/PageHeader";
import { AnonymousSessionService } from "../services/anonymousSessionService";
import { ContributionForm } from "../components/community/ContributionForm";
import { GalleryGrid } from "../components/community/GalleryGrid";
import { EntryDetail } from "../components/community/EntryDetail";

const CommunityGallery: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [entries, setEntries] = useState<CommunityEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "contribute">("gallery");
  const [selectedEntry, setSelectedEntry] = useState<CommunityEntry | null>(null);
  const [filter, setFilter] = useState<EntryType | "all">("all");
  
  // Vérifier si un onglet est spécifié dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'contribute') {
      setActiveTab('contribute');
    }
  }, [location]);

  // Charger les entrées au chargement de la page
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        const data = await fetchCommunityEntries();
        setEntries(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des entrées:", err);
        setError("Impossible de charger la galerie communautaire. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Filtrer les entrées selon le type sélectionné
  const filteredEntries = entries.filter(entry => 
    filter === "all" || entry.type === filter
  );

  // Gérer les likes
  const handleLike = async (entryId: string) => {
    try {
      const sessionId = AnonymousSessionService.getOrCreateSessionId();
      const updatedEntry = await toggleLike(entryId, sessionId);
      
      // Mettre à jour l'entrée dans la liste
      setEntries(entries.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
      
      // Si une entrée est sélectionnée, la mettre à jour également
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry(updatedEntry);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du like:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre appréciation. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Gérer l'ajout d'une nouvelle contribution
  const handleNewContribution = (newEntry: CommunityEntry) => {
    setEntries([newEntry, ...entries]);
    setActiveTab("gallery");
    toast({
      title: "Contribution envoyée !",
      description: "Votre contribution a été ajoutée à la galerie communautaire.",
    });
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <PageContainer>
      <PageHeader title="Galerie Communautaire" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full pb-32" // Augmentation du padding-bottom pour le menu
      >
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "gallery" | "contribute")}
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
                      onClick={() => setFilter("all")}
                    >
                      Tous
                    </Button>
                    <Button 
                      variant={filter === "photo" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilter("photo")}
                    >
                      Photos
                    </Button>
                    <Button 
                      variant={filter === "testimonial" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilter("testimonial")}
                    >
                      Témoignages
                    </Button>
                  </div>
                </div>

                {/* Grille de la galerie */}
                {filteredEntries.length > 0 ? (
                  <GalleryGrid 
                    entries={filteredEntries} 
                    onEntryClick={setSelectedEntry}
                    onLike={handleLike}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-500 mb-4">Aucune contribution dans cette catégorie</p>
                    <Button onClick={() => setActiveTab("contribute")}>Soyez le premier à contribuer</Button>
                  </div>
                )}
              </>
            )}
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
          onClose={() => setSelectedEntry(null)}
          onLike={handleLike}
        />
      )}
      
      {/* Menu de navigation du bas */}
      <BottomNavigation />
    </PageContainer>
  );
};

export default CommunityGallery;
