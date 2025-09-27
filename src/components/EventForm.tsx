import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "@/data/events";
import { Location } from "@/data/locations";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { createLogger } from "@/utils/logger";
import { v4 as uuidv4 } from 'uuid';

// Créer un logger pour le composant EventForm
const logger = createLogger('EventForm');

interface EventFormProps {
  onSuccess?: () => void;
  editingEvent?: Event;
}

export function EventForm({ onSuccess, editingEvent }: EventFormProps) {
  const { locations } = useLocations();
  const { addEvent, updateEvent } = useData();
  
  const [formData, setFormData] = useState<Partial<Event>>(
    editingEvent || {
      id: uuidv4(),
      title: "",
      artistName: "",
      type: "exposition",
      description: "",
      artistBio: "",
      time: "",
      days: [],
      locationId: "",
      locationName: ""
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si on change de lieu, mettre à jour les coordonnées et le nom du lieu
    if (name === "locationId") {
      const selectedLocation = locations.find(loc => loc.id === value);
      if (selectedLocation) {
        setFormData(prev => ({ 
          ...prev, 
          locationName: selectedLocation.name
        }));
      }
    }
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDayChange = (day: "samedi" | "dimanche", checked: boolean) => {
    setFormData(prev => {
      const currentDays = prev.days as ("samedi" | "dimanche")[] || [];
      let newDays: ("samedi" | "dimanche")[];
      
      if (checked) {
        newDays = [...currentDays, day];
      } else {
        newDays = currentDays.filter(d => d !== day);
      }
      
      return { ...prev, days: newDays };
    });
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors.days) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.days;
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validation des champs obligatoires
    if (!formData.title?.trim()) {
      newErrors.title = "Le titre est obligatoire";
    }
    
    if (!formData.artistName?.trim()) {
      newErrors.artistName = "Le nom de l'artiste est obligatoire";
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = "La description est obligatoire";
    }
    
    if (!formData.locationId) {
      newErrors.locationId = "Veuillez sélectionner un lieu";
    }
    
    if (!formData.days || formData.days.length === 0) {
      newErrors.days = "Veuillez sélectionner au moins un jour";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage({
        text: "Veuillez corriger les erreurs dans le formulaire",
        type: "error"
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ text: "", type: "" });
    
    try {
      logger.info(`${editingEvent ? 'Mise à jour' : 'Création'} d'un événement`);
      logger.debug('Données de l\'événement', formData);
      
      const eventData = formData as Event;
      
      let result;
      if (editingEvent) {
        result = updateEvent(eventData);
      } else {
        result = addEvent(eventData);
      }
      
      if (result.success) {
        setSubmitMessage({
          text: `Événement ${editingEvent ? 'mis à jour' : 'créé'} avec succès`,
          type: "success"
        });
        
        if (!editingEvent) {
          // Réinitialiser le formulaire pour un nouvel événement
          setFormData({
            id: uuidv4(),
            title: "",
            artistName: "",
            type: "exposition",
            description: "",
            artistBio: "",
            time: "",
            days: [],
            locationId: "",
            locationName: ""
          });
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setSubmitMessage({
          text: `Erreur: ${result.error}`,
          type: "error"
        });
      }
    } catch (error) {
      logger.error('Erreur lors de la soumission du formulaire', error);
      setSubmitMessage({
        text: `Une erreur est survenue: ${error}`,
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-[#4a5d94]">
          {editingEvent ? "Modifier un événement" : "Ajouter un nouvel événement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'événement *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              placeholder="Titre de l'événement"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="artistName">Nom de l'artiste *</Label>
            <Input
              id="artistName"
              name="artistName"
              value={formData.artistName || ""}
              onChange={handleInputChange}
              placeholder="Nom de l'artiste"
              className={errors.artistName ? "border-red-500" : ""}
            />
            {errors.artistName && <p className="text-red-500 text-sm">{errors.artistName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type d'événement *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exposition">Exposition</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Description de l'événement"
              className={`min-h-24 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="artistBio">Biographie de l'artiste</Label>
            <Textarea
              id="artistBio"
              name="artistBio"
              value={formData.artistBio || ""}
              onChange={handleInputChange}
              placeholder="Biographie de l'artiste"
              className="min-h-24"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Horaires</Label>
            <Input
              id="time"
              name="time"
              value={formData.time || ""}
              onChange={handleInputChange}
              placeholder="Ex: 10h00 - 18h00"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Jours *</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="samedi"
                  checked={formData.days?.includes("samedi") || false}
                  onCheckedChange={(checked) => handleDayChange("samedi", checked as boolean)}
                />
                <Label htmlFor="samedi" className="cursor-pointer">Samedi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dimanche"
                  checked={formData.days?.includes("dimanche") || false}
                  onCheckedChange={(checked) => handleDayChange("dimanche", checked as boolean)}
                />
                <Label htmlFor="dimanche" className="cursor-pointer">Dimanche</Label>
              </div>
            </div>
            {errors.days && <p className="text-red-500 text-sm">{errors.days}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="locationId">Lieu *</Label>
            <Select
              value={formData.locationId}
              onValueChange={(value) => handleSelectChange("locationId", value)}
            >
              <SelectTrigger className={errors.locationId ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionner un lieu" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.locationId && <p className="text-red-500 text-sm">{errors.locationId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">URL de l'image (optionnel)</Label>
            <Input
              id="image"
              name="image"
              value={formData.image || ""}
              onChange={handleInputChange}
              placeholder="URL de l'image"
            />
          </div>
          
          <CardFooter className="flex justify-between px-0">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#4a5d94] hover:bg-[#3a4d84]"
            >
              {isSubmitting ? "En cours..." : (editingEvent ? "Mettre à jour" : "Ajouter l'événement")}
            </Button>
            
            {submitMessage.text && (
              <p className={`text-sm ${submitMessage.type === "error" ? "text-red-500" : "text-green-500"}`}>
                {submitMessage.text}
              </p>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

