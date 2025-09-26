import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analytics, EventAction, trackInteraction } from "@/services/firebaseAnalytics";
import "@/styles/decorations.css"; // Import des décorations
import { useNavigate } from "react-router-dom";
import { events, getEventsByDay, type Event } from "@/data/events";
import { EventFilter } from "@/components/EventFilter";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetails } from "@/components/EventDetails";
import { EventCardModern } from "@/components/EventCardModern";
import { getSavedEvents, saveEvent, removeSavedEvent } from "../services/savedEvents";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("exposition");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  
  useEffect(() => {
    analytics.trackPageView('/program', 'Programme');
    const saved = getSavedEvents();
    setSavedEventIds(saved.map(e => e.id));
  }, []);

  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = savedEventIds.includes(event.id);
    if (isCurrentlySaved) {
      removeSavedEvent(event.id);
      setSavedEventIds(savedEventIds.filter(id => id !== event.id));
      analytics.trackContentInteraction(EventAction.UNSAVE, 'event', event.id, { event_title: event.title, source: 'program' });
    } else {
      saveEvent(event);
      setSavedEventIds([...savedEventIds, event.id]);
      analytics.trackContentInteraction(EventAction.SAVE, 'event', event.id, { event_title: event.title, source: 'program' });
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    analytics.trackProgramInteraction(EventAction.FILTER, { filter });
  };
  
  const filterEvents = (events: Event[], filter: string) => {
    if (filter === "all") return events; // Gardé pour la logique, même si le bouton est retiré
    return events.filter(event => event.type === filter);
  };
  
  const startMinutes = (timeRange: string): number => {
    const match = timeRange.match(/(\d{1,2})h(\d{2})/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return h * 60 + m;
  };

  const sortByStartTime = (items: Event[]): Event[] => {
    return [...items].sort((a, b) => startMinutes(a.time) - startMinutes(b.time));
  };
  
  return (
    <div className="min-h-screen bg-textured-cream pb-20 relative">
      {/* Touches de pinceau décoratives */}
      <div className="brush-stroke-left"></div>
      <div className="brush-stroke-left-2"></div>

      {/* Pinceaux en bas à droite, au-dessus du menu (agrandis) */}
      <div 
        className="fixed bottom-14 right-[-120px] w-[360px] h-[360px] opacity-90 pointer-events-none z-20"
        style={{
          backgroundImage: 'url(/images/background/Pinceaux.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(20deg)'
        }}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        <header className="mb-6 flex items-center justify-between">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate("/")}
            className="bg-[#1a2138] hover:bg-[#2a3148] text-white rounded-full px-6 py-2 font-medium"
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-[#1a2138]">Programme</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <ShareButton 
                title="Programme - Collectif Île Feydeau"
                text="Découvrez le programme des événements du Collectif Île Feydeau"
                url={typeof window !== 'undefined' ? window.location.href : ''}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </header>
        
        <div className="mb-4 fade-in">
          <EventFilter onFilterChange={handleFilterChange} currentFilter={currentFilter} />
        </div>
        
        <Tabs defaultValue="dimanche" className="w-full">
          <div className="flex justify-center gap-2 mb-4">
            <TabsList className="bg-transparent p-0 h-auto gap-2">
              <TabsTrigger 
                value="samedi"
                className="bg-transparent text-gray-700 data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white data-[state=active]:border-[#ff7a45] rounded-full px-4 py-2 border border-gray-300"
              >
                Samedi
              </TabsTrigger>
              <TabsTrigger 
                value="dimanche"
                className="bg-transparent text-gray-700 data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white data-[state=active]:border-[#ff7a45] rounded-full px-4 py-2 border border-gray-300"
              >
                Dimanche
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="samedi" className="space-y-4">
            {sortByStartTime(filterEvents(getEventsByDay("samedi"), currentFilter)).map((event, index) => (
              <div key={`samedi-${event.id}`}>
                <EventCardModern
                  event={event}
                  isSaved={savedEventIds.includes(event.id)}
                  cardIndex={index}
                  onEventClick={() => setSelectedEvent(event)}
                  onSaveClick={(e) => handleSaveEvent(event, e)}
                />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="dimanche" className="space-y-4">
            {sortByStartTime(filterEvents(getEventsByDay("dimanche"), currentFilter)).map((event, index) => (
              <div key={`dimanche-${event.id}`}>
                <EventCardModern
                  event={event}
                  isSaved={savedEventIds.includes(event.id)}
                  cardIndex={index}
                  onEventClick={() => setSelectedEvent(event)}
                  onSaveClick={(e) => handleSaveEvent(event, e)}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <EventDetails 
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          source="program"
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Program;
