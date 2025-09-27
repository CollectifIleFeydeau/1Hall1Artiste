import React from "react";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import QrCode from "lucide-react/dist/esm/icons/qr-code";
import { ActionButton } from "@/components/ui/ActionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { analytics } from "@/services/firebaseAnalytics";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  // Utiliser une référence pour s'assurer que l'URL est disponible après le rendu
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const [showQrCode, setShowQrCode] = React.useState(false);
  
  const handleShare = async (platform: string) => {
    try {
      // Analytics: share
      analytics.trackFeatureUse('share', { platform, title });
    
    // S'assurer que l'URL est absolue
    const absoluteUrl = shareUrl.startsWith('http') ? shareUrl : (typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl);
    
    switch (platform) {
      case "native":
        // Vérifier si l'API Web Share est disponible
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url: absoluteUrl,
            });
          } catch (error) {
            console.error("Error sharing:", error);
            // Fallback en cas d'erreur
            copyToClipboard(absoluteUrl);
          }
        } else {
          // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
          copyToClipboard(absoluteUrl);
        }
        break;
      case "facebook":
        try {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`, "_blank");
        } catch (error) {
          console.error("Error opening Facebook share:", error);
          copyToClipboard(absoluteUrl);
        }
        break;
      case "x":
        try {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(absoluteUrl)}`, "_blank");
        } catch (error) {
          console.error("Error opening Twitter share:", error);
          copyToClipboard(absoluteUrl);
        }
        break;
      case "instagram":
        try {
          // Instagram n'a pas d'API de partage directe comme les autres plateformes
          // Nous allons essayer d'ouvrir l'application, puis rediriger vers le site web
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          
          if (isIOS || isAndroid) {
            // Essayer d'ouvrir l'application Instagram
            window.location.href = `instagram://`;
            
            // Rediriger vers le site web si l'application ne s'ouvre pas
            setTimeout(() => {
              window.location.href = `https://www.instagram.com/`;
            }, 2000);
          } else {
            // Sur desktop, ouvrir simplement le site web
            window.open(`https://www.instagram.com/`, "_blank");
          }
        } catch (error) {
          console.error("Error opening Instagram:", error);
          copyToClipboard(absoluteUrl);
        }
        break;
      case "copy":
        copyToClipboard(absoluteUrl);
        break;
    }
    } catch (error) {
      console.error("Error in handleShare:", error);
      // Fallback en cas d'erreur générale
      try {
        copyToClipboard(shareUrl);
      } catch (e) {
        console.error("Error in fallback copy:", e);
        alert('Impossible de partager. Veuillez copier manuellement : ' + shareUrl);
      }
    }
  };
  
  const copyToClipboard = (text: string) => {
    // Vérifier si l'API Clipboard est disponible
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('Lien copié dans le presse-papier');
        })
        .catch(err => {
          console.error('Erreur lors de la copie :', err);
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  };
  
  // Méthode alternative pour les navigateurs qui ne supportent pas l'API Clipboard
  const fallbackCopyToClipboard = (text: string) => {
    let textArea: HTMLTextAreaElement | null = null;
    try {
      textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Lien copié dans le presse-papier');
      } else {
        alert('Impossible de copier le lien. Veuillez le copier manuellement : ' + text);
      }
    } catch (err) {
      console.error('Erreur lors de la copie fallback :', err);
      alert('Impossible de copier le lien. Veuillez le copier manuellement : ' + text);
    } finally {
      // Nettoyage sécurisé
      if (textArea && document.body.contains(textArea)) {
        try {
          document.body.removeChild(textArea);
        } catch (cleanupError) {
          console.warn('[ShareButton] Error cleaning up textarea:', cleanupError);
        }
      }
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={className || "flex items-center justify-center h-10 w-10 rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"}
            aria-label="Partager"
            title="Partager"
            type="button"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[150px]">
          {typeof navigator !== 'undefined' && navigator.share && (
            <DropdownMenuItem onClick={() => handleShare("native")} className="cursor-pointer">
              Partager
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("x")} className="cursor-pointer">
            X
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("instagram")} className="cursor-pointer">
            Instagram
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer">
            Copier le lien
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowQrCode(true)} className="cursor-pointer">
            <QrCode className="h-4 w-4 mr-2" />
            Afficher QR code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent 
          className="sm:max-w-[425px]"
          aria-describedby="qr-code-description"
        >
          <DialogHeader>
            <DialogTitle>Scannez ce QR code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <QRCodeSVG 
              value={shareUrl} 
              size={200} 
              bgColor={"#ffffff"}
              fgColor={"#4a5d94"}
              level={"H"}
            />
            <p id="qr-code-description" className="text-sm text-gray-600 mt-4 text-center">
              Scannez ce code avec votre téléphone pour accéder directement à cette page
            </p>
          </div>
          <DialogFooter>
            <ActionButton variant="primary" onClick={() => setShowQrCode(false)}>Fermer</ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
