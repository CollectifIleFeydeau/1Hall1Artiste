import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/data/events";
import { useEvents, useData } from "@/hooks/useData";
import { EventForm } from "@/components/EventForm";
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/logger";

const logger = createLogger('EventManagement');

export function EventManagement() {
  const { events } = useEvents();
  const { updateEvent } = useData();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'exposition' | 'concert'>('all');
  const [dayFilter, setDayFilter] = useState<'all' | 'samedi' | 'dimanche'>('all');

  // Filtrer les événements selon les critères sélectionnés
  const filteredEvents = events.filter(event => {
    const typeMatch = filter === 'all' || event.type === filter;
    const dayMatch = dayFilter === 'all' || event.days.includes(dayFilter as 'samedi' | 'dimanche');
    return typeMatch && dayMatch;
  });

  const handleEdit = (event: Event) => {
    logger.info(`Modification de l'événement ${event.id}: ${event.title}`);
    setEditingEvent(event);
    setShowAddForm(false);
  };

  const handleDelete = (event: Event) => {
    // Note: La suppression d'événements n'est pas encore implémentée dans useData
    // Pour l'instant, on affiche juste un message
    toast({
      title: "Fonctionnalité à venir",
      description: "La suppression d'événements sera bientôt disponible.",
      variant: "default"
    });
  };

  const handleFormSuccess = () => {
    setEditingEvent(null);
    setShowAddForm(false);
    toast({
      title: "Succès",
      description: editingEvent ? "Événement modifié avec succès" : "Événement ajouté avec succès",
    });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowAddForm(false);
  };

  const getTypeColor = (type: string) => {
    return type === 'concert' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  // Si on est en mode édition ou ajout, afficher le formulaire
  if (editingEvent || showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#4a5d94]">
            {editingEvent ? "Modifier l'événement" : "Ajouter un événement"}
          </h2>
          <ActionButton
            variant="outline"
            onClick={handleCancelEdit}
            className="text-gray-600"
          >
            Annuler
          </ActionButton>
        </div>
        
        <EventForm 
          editingEvent={editingEvent || undefined}
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#4a5d94]">Gestion des événements</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} 
            {filter !== 'all' && ` (${filter})`}
            {dayFilter !== 'all' && ` - ${dayFilter}`}
          </p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Ajouter un événement
        </ActionButton>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <ActionButton
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tous
              </ActionButton>
              <ActionButton
                variant={filter === 'exposition' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('exposition')}
              >
                Expositions
              </ActionButton>
              <ActionButton
                variant={filter === 'concert' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('concert')}
              >
                Concerts
              </ActionButton>
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700">Jour:</span>
              <ActionButton
                variant={dayFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDayFilter('all')}
              >
                Tous
              </ActionButton>
              <ActionButton
                variant={dayFilter === 'samedi' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDayFilter('samedi')}
              >
                Samedi
              </ActionButton>
              <ActionButton
                variant={dayFilter === 'dimanche' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDayFilter('dimanche')}
              >
                Dimanche
              </ActionButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des événements */}
      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <p>Aucun événement trouvé avec ces filtres</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg text-[#4a5d94]">
                        {event.title}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <div className="flex gap-1">
                        {event.days.map(day => (
                          <div key={day} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {day === 'samedi' ? 'Sam' : 'Dim'}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">{event.artistName}</p>
                  </div>
                  
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ✏️ Modifier
                    </ActionButton>
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️ Supprimer
                    </ActionButton>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🕐</span>
                    <span>{event.time || "Horaires non définis"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📍</span>
                    <span className="truncate">{event.locationName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🆔</span>
                    <span>ID: {event.id}</span>
                  </div>
                </div>
                
                {event.artistName && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Artiste:</strong> {event.artistName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

