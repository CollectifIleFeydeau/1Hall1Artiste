import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackFeatureUsage } from "../services/analytics";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import { useNavigate } from "react-router-dom";
import { events, getEventsByDay, type Event } from "@/data/events";
import { EventFilter } from "@/components/EventFilter";
import { ShareButton } from "@/components/ShareButton";
import { toast } from "@/components/ui/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetails } from "@/components/EventDetails";
import { EventCard } from "@/components/EventCard";
import { getSavedEvents, saveEvent, removeSavedEvent } from "../services/savedEvents";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Charger les événements sauvegardés depuis le service
    const savedEvents = getSavedEvents();
    // Extraire les IDs des événements sauvegardés
    const savedIds = savedEvents.map(event => event.id);
    setSavedEventIds(savedIds);
  }, []);

  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[Program] Tentative de sauvegarde de l'événement: ${event.id}`);
    
    const isEventSaved = savedEventIds.includes(event.id);
    
    if (!isEventSaved) {
      // Ajouter l'événement aux favoris en utilisant le service
      saveEvent(event);
      // Mettre à jour l'état local
      setSavedEventIds([...savedEventIds, event.id]);
      
      // toast({
      //   title: "Événement sauvegardé",
      //   description: `${event.title} a été ajouté à vos favoris.`,
      // });
      
      console.log(`[Program] Événement ${event.id} sauvegardé avec succès`);
    } else {
      // Retirer l'événement des favoris en utilisant le service
      removeSavedEvent(event.id);
      // Mettre à jour l'état local
      setSavedEventIds(savedEventIds.filter(id => id !== event.id));
      
      // toast({
      //   title: "Événement retiré",
      //   description: `${event.title} a été retiré de vos favoris.`,
      // });
      
      console.log(`[Program] Événement ${event.id} retiré avec succès`);
    }
  };
  
  const handleViewOnMap = (event: Event) => {
    // Track event view in analytics
    trackFeatureUsage.eventView(event.id, event.title);
    // Pass the event ID directly - the Map component will handle the conversion
    navigate(`/map?location=${event.id}`);
  };
  
  const filterEvents = (events: Event[], filter: string) => {
    if (filter === "all") return events;
    return events.filter(event => event.type === filter);
  };
  
  return (
    <div className="min-h-screen app-gradient pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#ff7a45]">Programme</h1>
          <div className="flex items-center space-x-2">
  <Button
    variant="ghost"
    size="icon"
    aria-label="Ajouter au calendrier"
    className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-[#4a5d94] transition-all duration-200 hover:shadow-sm"
    onClick={async () => {
      try {
        const { addToCalendar } = await import("../services/calendarService");
        const allEvents = events;
        // Ajoute tous les événements du programme au calendrier
        let successCount = 0;
        let errorCount = 0;
        for (const event of allEvents) {
          const result = await addToCalendar(event);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
        if (successCount > 0) {
          toast({
            title: "Événements ajoutés au calendrier",
            description: `${successCount} événement(s) ajouté(s) avec succès.`,
          });
        }
        if (errorCount > 0) {
          toast({
            title: "Erreur lors de l'ajout au calendrier",
            description: `${errorCount} événement(s) n'ont pas pu être ajoutés.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur inattendue",
          description: error instanceof Error ? error.message : "Impossible d'ajouter au calendrier.",
          variant: "destructive",
        });
      }
    }}
  >
    <Calendar className="h-5 w-5" />
  </Button>
</div>
        </header>
        
        {/* Event type filter */}
        <div className="mb-4 fade-in">
          <EventFilter onFilterChange={setCurrentFilter} currentFilter={currentFilter} />
        </div>
        
        <div className="text-center mb-4 text-sm text-[#ff7a45] slide-in-bottom">
        </div>
        
        <Tabs defaultValue="samedi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-[#e0ebff]">
            <TabsTrigger 
              value="samedi" 
              className="data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Samedi
            </TabsTrigger>
            <TabsTrigger 
              value="dimanche"
              className="data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Dimanche
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="samedi" className="space-y-4">
            {filterEvents(getEventsByDay("samedi"), currentFilter).map((event, index) => {
                const eventKey = `samedi-${event.id}-${index}`;
                return (
                  <div key={eventKey}>
                    <EventCard
                      event={event}
                      isSaved={savedEventIds.includes(event.id)}
                      onEventClick={() => {
                        setSelectedEvent(event);
                        trackFeatureUsage.eventView(event.id, event.title);
                      }}
                      onSaveClick={(e) => handleSaveEvent(event, e)}
                    />
                  </div>
                );
              })}
              
            {filterEvents(getEventsByDay("samedi"), currentFilter).length === 0 && (
              <div className="text-center py-8 text-[#8c9db5]">
                <p>Aucun événement ne correspond à ce filtre pour ce jour.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dimanche" className="space-y-4">
            {filterEvents(getEventsByDay("dimanche"), currentFilter).map((event, index) => {
                const eventKey = `dimanche-${event.id}-${index}`;
                return (
                  <div key={eventKey}>
                    <EventCard
                      event={event}
                      isSaved={savedEventIds.includes(event.id)}
                      onEventClick={() => {
                        setSelectedEvent(event);
                        trackFeatureUsage.eventView(event.id, event.title);
                      }}
                      onSaveClick={(e) => handleSaveEvent(event, e)}
                    />
                  </div>
                );
              })}
              
            {filterEvents(getEventsByDay("dimanche"), currentFilter).length === 0 && (
              <div className="text-center py-8 text-[#8c9db5]">
                <p>Aucun événement ne correspond à ce filtre pour ce jour.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Utiliser le composant EventDetails unifié */}
        <EventDetails 
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          source="program"
        />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Program;
