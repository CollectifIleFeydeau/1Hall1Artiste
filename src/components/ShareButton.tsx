import Share2 from "lucide-react/dist/esm/icons/share-2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackFeatureUsage } from "../services/analytics";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const shareUrl = url || window.location.href;
  
  const handleShare = async (platform: string) => {
    // Track share event
    trackFeatureUsage.shareContent(platform, title);
    switch (platform) {
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url: shareUrl,
            });
          } catch (error) {
            console.error("Error sharing:", error);
          }
        } else {
          copyToClipboard(shareUrl);
        }
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "x":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "instagram":
        // Instagram doesn't have a direct share URL like other platforms
        // We'll open Instagram and let users share manually
        // For mobile, we can try to open the app
        window.open(`instagram://`, "_blank");
        // Fallback to website if app doesn't open
        setTimeout(() => {
          window.open(`https://www.instagram.com/`, "_blank");
        }, 500);
        break;
      case "copy":
        copyToClipboard(shareUrl);
        break;
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow"
        >
          <Share2 className="h-4 w-4 text-[#4a5d94]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {navigator.share && (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
