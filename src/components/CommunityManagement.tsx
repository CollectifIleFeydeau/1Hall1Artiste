import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLogger } from "@/utils/logger";
import { fetchCommunityEntries, deleteCommunityEntry } from "@/services/cloudinaryService";
import { CommunityEntry } from "@/types/communityTypes";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
// Import des icônes individuellement
import Loader from "lucide-react/dist/esm/icons/loader";
import Trash from "lucide-react/dist/esm/icons/trash";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Heart from "lucide-react/dist/esm/icons/heart";
import { LikesCounter } from "@/components/admin/LikesCounter";

// Créer un logger pour le composant
const logger = createLogger('CommunityManagement');

export function CommunityManagement() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Charger les contributions au chargement du composant
  useEffect(() => {
    loadEntries();
  }, []);

  // Fonction pour charger les contributions
  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await fetchCommunityEntries();
      logger.info(`${data.length} contributions chargées`);
      setEntries(data as any[]);
    } catch (error) {
      logger.error('Erreur lors du chargement des contributions', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contributions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une contribution
  const handleDelete = async (entryId: string) => {
    try {
      setDeleting(entryId);
      logger.info(`Suppression de la contribution ${entryId}`);
      
      await deleteCommunityEntry(entryId);
      
      // Mettre à jour la liste des contributions
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      toast({
        title: "Succès",
        description: "Contribution supprimée avec succès",
        variant: "default"
      });
    } catch (error) {
      logger.error(`Erreur lors de la suppression de la contribution ${entryId}`, error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la contribution",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Fonction restore supprimée - plus nécessaire avec Firebase

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Date inconnue";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-base sm:text-lg font-semibold">Gestion des contributions communautaires</h2>
        <Button 
          onClick={loadEntries} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4 flex flex-wrap justify-center gap-1 h-auto p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-1 flex-shrink-0">Toutes</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs sm:text-sm px-2 py-1 flex-shrink-0">Photos</TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs sm:text-sm px-2 py-1 flex-shrink-0">Témoignages</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm px-2 py-1 flex-shrink-0">En attente</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs sm:text-sm px-2 py-1 flex-shrink-0">Archivées</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderEntries(entries.filter(entry => entry.moderation?.status !== 'rejected'), deleting, handleDelete)}
        </TabsContent>

        <TabsContent value="photos">
          {renderEntries(entries.filter(entry => entry.type === 'photo' && entry.moderation?.status !== 'rejected'), deleting, handleDelete)}
        </TabsContent>

        <TabsContent value="testimonials">
          {renderEntries(entries.filter(entry => entry.type === 'testimonial' && entry.moderation?.status !== 'rejected'), deleting, handleDelete)}
        </TabsContent>

        <TabsContent value="pending">
          {renderEntries(
            entries.filter(entry => entry.moderation?.status === 'pending'),
            deleting,
            handleDelete
          )}
        </TabsContent>

        <TabsContent value="archived">
          <div className="text-center py-8 text-gray-500">
            Fonction de restauration supprimée avec le nouveau système Firebase
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Fonction pour afficher les contributions
  function renderEntries(entriesToRender: CommunityEntry[], deletingId: string | null, onDelete: (id: string) => void) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (entriesToRender.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          Aucune contribution trouvée
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entriesToRender.map(entry => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{entry.displayName || "Anonyme"}</p>
                  <p className="text-sm text-gray-500">
                    {entry.type === 'photo' ? 'Photo' : 'Témoignage'} • {formatDate(entry.timestamp || entry.createdAt)}
                  </p>
                  <LikesCounter entryId={entry.id} className="mt-1" />
                </div>
                <div className="flex items-center space-x-2">
                  {entry.moderation?.status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : entry.moderation?.status === 'rejected' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">En attente</div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {entry.type === 'photo' && entry.imageUrl && (
                <div className="mt-3 relative pt-[56.25%]">
                  <img 
                    src={entry.imageUrl} 
                    alt={`Contribution de ${entry.displayName}`}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const basePath = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
                        ? '/1Hall1Artiste'
                        : '';
                      e.currentTarget.src = `${basePath}/images/placeholder-image.jpg`;
                    }}
                  />
                </div>
              )}

              {entry.type === 'testimonial' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                    {(entry.content && entry.content.trim()) ? (
                    <p className="text-gray-700">{entry.content.trim()}</p>
                  ) : (entry.description && entry.description.trim()) ? (
                    <p className="text-gray-700">{entry.description.trim()}</p>
                  ) : (
                    <p className="text-gray-500 italic">Contenu non disponible</p>
                  )}
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500">
                <p>ID: {entry.id}</p>
                {entry.eventId && <p>Événement: {entry.eventId}</p>}
                {entry.locationId && <p>Lieu: {entry.locationId}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Fonction pour afficher les contributions archivées
  function renderArchivedEntries(entriesToRender: CommunityEntry[], restoringId: string | null, onRestore: (id: string) => void) {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (entriesToRender.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          Aucune contribution archivée trouvée
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entriesToRender.map(entry => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{entry.displayName || "Anonyme"}</p>
                  <p className="text-sm text-gray-500">
                    {entry.type === 'photo' ? 'Photo' : 'Témoignage'} • {formatDate(entry.timestamp || entry.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onRestore(entry.id)}
                    disabled={restoringId === entry.id}
                  >
                    {restoringId === entry.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {entry.type === 'photo' && entry.imageUrl && (
                <div className="mt-3 relative pt-[56.25%]">
                  <img 
                    src={entry.imageUrl} 
                    alt={`Contribution de ${entry.displayName}`}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const basePath = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
                        ? '/1Hall1Artiste'
                        : '';
                      e.currentTarget.src = `${basePath}/images/placeholder-image.jpg`;
                    }}
                  />
                </div>
              )}

              {entry.type === 'testimonial' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                    {(entry.content && entry.content.trim()) ? (
                    <p className="text-gray-700">{entry.content.trim()}</p>
                  ) : (entry.description && entry.description.trim()) ? (
                    <p className="text-gray-700">{entry.description.trim()}</p>
                  ) : (
                    <p className="text-gray-500 italic">Contenu non disponible</p>
                  )}
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500">
                <p>ID: {entry.id}</p>
                {entry.eventId && <p>Événement: {entry.eventId}</p>}
                {entry.locationId && <p>Lieu: {entry.locationId}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}

