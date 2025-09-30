import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/BackButton";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import "@/styles/decorations.css"; // Import des décorations
import { getEventsByDay, type Event } from "@/data/events";
import { EventFilter } from "@/components/EventFilter";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetailsNew as EventDetails } from "@/components/EventDetailsModern";
import { EventCardModern } from "@/components/EventCardModern";
import { getSavedEvents, saveEvent, removeSavedEvent } from "../services/savedEvents";
import { IMAGE_PATHS } from "../constants/imagePaths";
import { getImagePath } from "@/utils/imagePaths";

const Program = () => {
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
    <div className="min-h-screen pb-20 relative" style={{
      backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.TEXTURED_CREAM}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Touches de pinceau décoratives */}
      <div className="brush-stroke-left"></div>
      <div className="brush-stroke-left-2"></div>

      {/* Pinceaux pour expositions OU Clé de sol pour concerts en bas à droite */}
      <div 
        className="fixed bottom-14 right-0 pointer-events-none z-20 transition-all duration-500"
        style={{
          width: currentFilter === 'concert' ? '149px' : '669px',
          height: currentFilter === 'concert' ? '418px' : '862px',
          backgroundImage: currentFilter === 'concert' 
            ? `url('${getImagePath('/images/Petite Clef.png')}')`
            : `url('${getImagePath('/images/background/Pinceaux.png')}')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right'
        }}
      />
      
      {/* Tabs englobant header + contenu pour que TabsList réside dans le header */}
      <Tabs defaultValue="dimanche" className="w-full">
        {/* Header fixe en haut */}
        <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50" style={{
          backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.TEXTURED_CREAM}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <header className="mb-4 flex items-center justify-between">
              <BackButton to="/" />
              <h1 className="text-2xl font-bold text-[#1a2138]">Programme</h1>
              <ShareButton 
                title="Programme - Collectif Île Feydeau"
                text="Découvrez le programme des événements du Collectif Île Feydeau"
                url={typeof window !== 'undefined' ? window.location.href : ''}
              />
            </header>
            
            <div className="mb-3 fade-in">
              <EventFilter onFilterChange={handleFilterChange} currentFilter={currentFilter} />
            </div>
            
            {/* Onglets jours directement sous les filtres, toujours visibles */}
            <div className="mb-1">
              <div className="flex justify-center">
                <TabsList className="bg-transparent p-0 h-auto gap-2">
                  <TabsTrigger 
                    value="samedi"
                    className="bg-white/80 text-gray-700 data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white data-[state=active]:border-[#ff7a45] rounded-full px-6 py-2 border border-gray-300 font-medium text-sm min-w-[100px] shadow-sm hover:bg-white transition-all duration-200"
                  >
                    Samedi
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dimanche"
                    className="bg-white/80 text-gray-700 data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white data-[state=active]:border-[#ff7a45] rounded-full px-6 py-2 border border-gray-300 font-medium text-sm min-w-[100px] shadow-sm hover:bg-white transition-all duration-200"
                  >
                    Dimanche
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu avec padding-top pour compenser le header fixe (hauteur titre + filtres + onglets) */}
        <div className="container mx-auto px-4 max-w-4xl relative z-10" style={{ paddingTop: '200px' }}>
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
        </div>
        
        {/* Fin Tabs englobant */}
      </Tabs>
      
      <EventDetails 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        source="program"
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Program;

