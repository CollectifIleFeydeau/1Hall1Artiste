import { createContext, useContext, useEffect, useState } from "react";
import { SavedEvent, checkNotifications, markNotificationAsRead } from "@/services/savedEvents";
import Bell from "lucide-react/dist/esm/icons/bell";
import { useToast } from "@/components/ui/use-toast";

interface NotificationsContextType {
  notifications: SavedEvent[];
  markAsRead: (eventId: string) => void;
  hasUnreadNotifications: boolean;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  markAsRead: () => {},
  hasUnreadNotifications: false
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: any }) {
  const [notifications, setNotifications] = useState<SavedEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier les notifications au chargement
    const pendingNotifications = checkNotifications();
    setNotifications(pendingNotifications);
    
    // Vérifier les notifications toutes les minutes
    const interval = setInterval(() => {
      const newNotifications = checkNotifications();
      
      // Si de nouvelles notifications sont disponibles
      if (newNotifications.length > 0 && newNotifications.length !== notifications.length) {
        setNotifications(newNotifications);
        
        // Afficher une notification pour chaque nouvel événement
        newNotifications.forEach(event => {
          if (!notifications.some(n => n.id === event.id)) {
            toast({
              title: "Rappel d'événement",
              description: `${event.title} - ${event.days.map(day => day === "samedi" ? "Samedi" : "Dimanche").join(" et ")}, ${event.time}`,
              action: (
                <button
                  onClick={() => markAsRead(event.id)}
                  className="bg-[#4a5d94] text-white px-3 py-1 rounded-md text-xs"
                >
                  OK
                </button>
              ),
            });
          }
        });
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [notifications.length]);

  const markAsRead = (eventId: string) => {
    const updatedNotifications = markNotificationAsRead(eventId);
    setNotifications(updatedNotifications);
  };

  const hasUnreadNotifications = notifications.length > 0;

  return (
    <NotificationsContext.Provider value={{ notifications, markAsRead, hasUnreadNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
