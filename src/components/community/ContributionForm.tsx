import React, { useState, useRef, useEffect } from "react";
import Camera from "lucide-react/dist/esm/icons/camera";
import Upload from "lucide-react/dist/esm/icons/upload";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Info from "lucide-react/dist/esm/icons/info";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";

import { CommunityEntry, EntryType, SubmissionParams, ModerationResult } from "../../types/communityTypes";
import { submitContribution, moderateContent, uploadImage } from "../../services/communityServiceBridge";
import { AnonymousSessionService } from "../../services/anonymousSessionService";
import { getContributionContext, clearContributionContext, enrichSubmissionWithContext } from "../../services/contextualContributionService";
import { events } from "../../data/events";
import { locations } from "../../data/locations";

interface ContributionFormProps {
  onSubmit: (newEntry: CommunityEntry) => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contributionContext, setContributionContext] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SubmissionParams>();
  
  // Récupérer le contexte de contribution au chargement
  useEffect(() => {
    const context = getContributionContext();
    if (context) {
      setContributionContext(context);
      console.log("[ContributionForm] Contexte reçu:", context);
      
      // Pré-remplir les champs du formulaire en fonction du contexte
      if (context.type === "event") {
        // Pré-remplir l'événement
        setValue("eventId", context.id);
        setSelectedEventId(context.id);
        console.log("[ContributionForm] Contexte événement défini:", context.id);
        console.log("[ContributionForm] Liste des événements disponibles:", events.map(e => e.id));
        console.log("[ContributionForm] L'ID de l'événement est-il dans la liste ?", events.some(e => e.id === context.id));
        
        // Si l'événement a un lieu associé, pré-remplir également le lieu
        if (context.locationId) {
          setValue("locationId", context.locationId);
          setSelectedLocationId(context.locationId);
          console.log("[ContributionForm] Lieu associé à l'événement pré-rempli:", context.locationId);
          console.log("[ContributionForm] Le lieu associé est-il dans la liste ?", locations.some(l => l.id === context.locationId));
        }
      } else if (context.type === "location") {
        // Pré-remplir le lieu
        setValue("locationId", context.id);
        setSelectedLocationId(context.id);
        console.log("[ContributionForm] Contexte lieu défini:", context.id);
        console.log("[ContributionForm] Liste des lieux disponibles:", locations.map(l => l.id));
        console.log("[ContributionForm] L'ID du lieu est-il dans la liste ?", locations.some(l => l.id === context.id));
        
        // Vérifier si le lieu existe dans la liste
        const locationExists = locations.some(l => l.id === context.id);
        if (!locationExists) {
          console.warn("[ContributionForm] ATTENTION: L'ID du lieu dans le contexte ne correspond à aucun lieu disponible dans la liste déroulante");
        }
      }
    }
  }, [setValue]);

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Vérification de sécurité pour éviter l'erreur TypeError
        if (event.target && event.target.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumettre le formulaire
  const processSubmit = async (data: SubmissionParams) => {
    try {
      setIsSubmitting(true);

      // Déterminer le type de contribution automatiquement
      const hasImage = fileInputRef.current?.files?.[0];
      const type: EntryType = hasImage ? "photo" : "testimonial";

      // Ajouter le type aux données
      data.type = type;

      // Ajouter l'image si présente
      if (fileInputRef.current?.files?.[0]) {
        data.image = fileInputRef.current.files[0];
      }
      
      // Enrichir les données avec le contexte si présent
      data = enrichSubmissionWithContext(data);

      // Modérer le contenu avant soumission
      // Soumettre la contribution
      const newEntry = await submitContribution(data);
      
      // Réinitialiser le formulaire
      reset();
      setImagePreview(null);
      clearContributionContext();
      setContributionContext(null);
      setSelectedEventId("");
      setSelectedLocationId("");
      
      // Notifier le parent
      onSubmit(newEntry);
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      // Gérer l'erreur (pourrait être amélioré avec un système de notification)
      alert("Une erreur est survenue lors de l'envoi de votre contribution. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Partagez votre expérience</h2>
        <p className="text-sm text-slate-500">
          Contribuez à la mémoire collective de l'île Feydeau en partageant vos photos et témoignages.
        </p>
        
        {/* Afficher le contexte de contribution s'il existe */}
        {contributionContext && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              Votre contribution sera associée à {contributionContext.type === "event" ? "l'événement" : "l'emplacement"} <strong>{contributionContext.name}</strong>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
        {/* Nom d'affichage */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Votre nom ou pseudo</Label>
          <Input 
            id="displayName" 
            placeholder="Comment souhaitez-vous être identifié?"
            defaultValue={AnonymousSessionService.getDisplayName() || ""}
            {...register("displayName")}
          />
        </div>

        {/* Événement associé */}
        <div className="space-y-2">
          <Label htmlFor="eventId">Événement associé (optionnel)</Label>
          <Select 
            value={selectedEventId} 
            onValueChange={(value) => {
              setSelectedEventId(value);
              setValue("eventId", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un événement" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("eventId")} value={selectedEventId} />
        </div>

        {/* Lieu associé */}
        <div className="space-y-2">
          <Label htmlFor="locationId">Lieu associé (optionnel)</Label>
          <Select 
            value={selectedLocationId} 
            onValueChange={(value) => {
              setSelectedLocationId(value);
              setValue("locationId", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un lieu" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("locationId")} value={selectedLocationId} />
        </div>

        {/* Champs spécifiques au type */}
        <div className="space-y-4">
          {/* Upload d'image */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="max-h-64 mx-auto rounded" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Changer l'image
                  </Button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Cliquez pour sélectionner une image ou glissez-déposez
                  </p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea 
              id="description" 
              placeholder="Décrivez votre photo..."
              {...register("description")}
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Partager"
          )}
        </Button>
      </form>
    </motion.div>
  );
};
