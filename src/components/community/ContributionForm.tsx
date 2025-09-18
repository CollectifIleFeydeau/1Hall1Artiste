import React, { useState, useRef, useEffect } from "react";
import Camera from "lucide-react/dist/esm/icons/camera";
import Upload from "lucide-react/dist/esm/icons/upload";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Info from "lucide-react/dist/esm/icons/info";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
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
import { analytics, EventAction } from "@/services/firebaseAnalytics";

interface ContributionFormProps {
  onSubmit: (newEntry: CommunityEntry) => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    // Analytics: user opened contribution form
    analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'open_form' });
  }, [setValue]);

  // Gérer le changement d'image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥 [handleImageChange] FONCTION APPELÉE !', e.target.files?.length, 'fichier(s)');
    
    try {
      const file = e.target.files?.[0];
      if (file) {
        console.log('[ContributionForm] Début upload Cloudinary:', file.name);
        
        // Créer un aperçu local immédiatement
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setImagePreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);

        // Upload vers Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'collectif_photos');
        formData.append('cloud_name', 'dpatqkgsc');

        console.log('[ContributionForm] Requête Cloudinary:', {
          url: 'https://api.cloudinary.com/v1_1/dpatqkgsc/image/upload',
          preset: 'collectif_photos',
          fileSize: file.size,
          fileType: file.type
        });

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dpatqkgsc/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        console.log('[ContributionForm] Cloudinary response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[ContributionForm] Cloudinary response data:', data);
          
          if (data.secure_url) {
            console.log('[ContributionForm] Upload Cloudinary réussi:', data.secure_url);
            // Stocker l'URL Cloudinary pour la soumission
            setValue('cloudinaryUrl', data.secure_url);
            // Analytics: image upload success
            analytics.trackCommunityInteraction(EventAction.UPLOAD, { type: 'image', success: true, size: file.size, mime: file.type });
          } else {
            console.error('[ContributionForm] Pas de secure_url dans la réponse:', data);
            // Analytics: image upload unexpected response
            analytics.trackCommunityInteraction(EventAction.UPLOAD, { type: 'image', success: false, reason: 'no_secure_url' });
          }
        } else {
          const errorText = await response.text();
          console.error('[ContributionForm] Erreur upload Cloudinary:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          // Analytics: image upload failure
          analytics.trackCommunityInteraction(EventAction.UPLOAD, { type: 'image', success: false, status: response.status, statusText: response.statusText });
        }
      }
    } catch (error) {
      console.error('[ContributionForm] Erreur lors du changement d\'image:', error);
      // Analytics: image upload exception
      analytics.trackCommunityInteraction(EventAction.UPLOAD, { type: 'image', success: false, exception: true });
    }
  };

  // Soumettre le formulaire
  const processSubmit = async (data: SubmissionParams) => {
    console.log('[ContributionForm] === DÉBUT DE SOUMISSION ===');
    console.log('[ContributionForm] Données reçues du formulaire:', data);
    
    try {
      setIsSubmitting(true);
      console.log('[ContributionForm] État de soumission activé');
      // Analytics: contribution submit start
      analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'submit_start' });

      // Déterminer le type de contribution automatiquement
      const hasImage = data.cloudinaryUrl || fileInputRef.current?.files?.[0];
      const type: EntryType = hasImage ? "photo" : "testimonial";
      console.log('[ContributionForm] Type déterminé automatiquement:', type, hasImage ? '(avec image)' : '(sans image)');

      // Ajouter le type aux données
      data.type = type;

      // Log de l'URL Cloudinary si présente
      if (data.cloudinaryUrl) {
        console.log('[ContributionForm] URL Cloudinary disponible:', data.cloudinaryUrl);
      } else {
        console.log('[ContributionForm] Aucune URL Cloudinary disponible');
      }

      // Enrichir les données avec le contexte si présent
      console.log('[ContributionForm] Contexte avant enrichissement:', contributionContext);
      data = enrichSubmissionWithContext(data);
      console.log('[ContributionForm] Données après enrichissement avec contexte:', data);

      // Modérer le contenu avant soumission
      console.log('[ContributionForm] Appel du service de soumission...');
      // Soumettre la contribution
      const newEntry = await submitContribution(data);
      console.log('[ContributionForm] Contribution soumise avec succès:', newEntry);
      // Analytics: contribution submit success
      analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'success', entry_id: newEntry.id, type: newEntry.type });
      
      // Afficher le message de succès
      setIsSubmitted(true);
      
      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        console.log('[ContributionForm] Réinitialisation du formulaire...');
        reset();
        setImagePreview(null);
        clearContributionContext();
        setContributionContext(null);
        setSelectedEventId("");
        setSelectedLocationId("");
        setIsSubmitted(false);
        console.log('[ContributionForm] Formulaire réinitialisé');
      }, 5000); // Afficher le message pendant 5 secondes
      
      // Notifier le parent
      console.log('[ContributionForm] Notification du composant parent...');
      onSubmit(newEntry);
      console.log('[ContributionForm] === SOUMISSION TERMINÉE AVEC SUCCÈS ===');
      
    } catch (error) {
      console.error("[ContributionForm] === ERREUR LORS DE LA SOUMISSION ===");
      console.error("[ContributionForm] Erreur détaillée:", error);
      console.error("[ContributionForm] Stack trace:", error instanceof Error ? error.stack : 'N/A');
      // Gérer l'erreur (pourrait être amélioré avec un système de notification)
      alert("Une erreur est survenue lors de l'envoi de votre contribution. Veuillez réessayer.");
      // Analytics: contribution submit failure
      analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, { stage: 'failure' });
    } finally {
      setIsSubmitting(false);
      console.log('[ContributionForm] État de soumission désactivé');
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
        
        {/* Message de succès après soumission */}
        {isSubmitted && (
          <Alert className="mt-4 bg-blue-50 border-blue-300 border-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <AlertDescription className="space-y-3">
              <div className="font-bold text-blue-900 text-lg">
                📤 Contribution envoyée !
              </div>
              <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>⏱️ Votre photo sera visible dans 1-2 minutes</span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Le temps que notre système traite automatiquement votre contribution
                </div>
              </div>
              <div className="text-sm text-blue-600">
                ✨ Merci de contribuer à la mémoire collective de l'île Feydeau !
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Afficher le contexte de contribution s'il existe */}
        {contributionContext && !isSubmitted && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              Votre contribution sera associée à {contributionContext.type === "event" ? "l'événement" : "l'emplacement"} <strong>{contributionContext.name}</strong>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {!isSubmitted && (
        <form 
          onSubmit={handleSubmit(processSubmit)} 
          className="space-y-6"
          autoComplete="off"
          data-form-type="contribution"
          noValidate
        >
        {/* Nom d'affichage */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom d'affichage (optionnel)</Label>
          <Input 
            id="displayName" 
            placeholder="Votre nom ou pseudonyme"
            defaultValue="Anonyme"
            autoComplete="off"
            data-form-type="contribution-displayname"
            {...register("displayName")}
          />
          <p className="text-xs text-slate-500">
            Laissez vide pour contribuer anonymement
          </p>
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
          <input 
            type="hidden" 
            {...register("eventId")} 
            value={selectedEventId}
            data-form-type="contribution-event"
            autoComplete="off"
          />
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
          <input 
            type="hidden" 
            {...register("locationId")} 
            value={selectedLocationId}
            data-form-type="contribution-location"
            autoComplete="off"
          />
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
                data-form-type="contribution-image"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea 
              id="description" 
              placeholder="Décrivez votre photo..."
              autoComplete="off"
              data-form-type="contribution-description"
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
      )}
    </motion.div>
  );
};
