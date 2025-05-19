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
    try {
      // Vérifier les notifications au chargement
      const pendingNotifications = checkNotifications();
      setNotifications(pendingNotifications || []);
      
      // Vérifier les notifications toutes les minutes
      const interval = setInterval(() => {
        try {
          const newNotifications = checkNotifications();
          
          // Si de nouvelles notifications sont disponibles et valides
          if (newNotifications && newNotifications.length > 0 && newNotifications.length !== notifications.length) {
            setNotifications(newNotifications);
            
            // Afficher une notification pour chaque nouvel événement
            newNotifications.forEach(event => {
              if (event && event.id && !notifications.some(n => n.id === event.id)) {
                toast({
                  title: "Rappel d'événement",
                  description: `${event.title} - ${Array.isArray(event.days) ? event.days.map(day => day === "samedi" ? "Samedi" : "Dimanche").join(" et ") : ""}, ${event.time || ""}`,
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
        } catch (error) {
          console.error("Erreur lors de la vérification des notifications:", error);
        }
      }, 60000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Erreur dans le composant NotificationsProvider:", error);
      return () => {}; // Return empty cleanup function in case of error
    }
  }, [notifications.length]);

  const markAsRead = (eventId: string) => {
    try {
      const updatedNotifications = markNotificationAsRead(eventId);
      setNotifications(updatedNotifications || []);
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
      // En cas d'erreur, essayer de mettre à jour l'état local sans appeler le service
      setNotifications(prev => prev.filter(n => n.id !== eventId));
    }
  };

  const hasUnreadNotifications = notifications.length > 0;

  return (
    <NotificationsContext.Provider value={{ notifications, markAsRead, hasUnreadNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
