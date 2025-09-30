import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapComponent } from "@/components/MapComponent";

export default function CoordinatesPicker() {
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    setCoordinates({ x, y });
    setCopied(false);
    
    // Afficher une alerte
    alert(`📍 Coordonnées récupérées\n\nX: ${x}\nY: ${y}\n\nFermez cette popup pour voir le bouton "Copier" !`);
  };

  const copyToClipboard = () => {
    if (!coordinates) return;
    
    const text = `x: ${coordinates.x},\ny: ${coordinates.y}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-[#4a5d94]">
            Récupérateur de Coordonnées
          </h1>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <p className="text-gray-600">
            Cliquez n'importe où sur la carte ci-dessous pour obtenir les coordonnées X et Y.
            Une popup s'affichera avec les coordonnées que vous pourrez copier.
          </p>
        </div>

        {/* Affichage des coordonnées */}
        {coordinates && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-4">
            <h2 className="text-lg font-semibold mb-3 text-green-800">
              📍 Dernières coordonnées cliquées :
            </h2>
            <div className="text-3xl font-mono font-bold text-green-900 mb-4">
              X: {coordinates.x} | Y: {coordinates.y}
            </div>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-xs text-green-600 mb-2">Format pour le code :</p>
              <div className="text-base text-green-700 font-mono">
                x: {coordinates.x},<br/>
                y: {coordinates.y}
              </div>
            </div>
            <Button
              onClick={copyToClipboard}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              size="lg"
            >
              {copied ? '✓ Copié dans le presse-papier !' : '📋 Copier les coordonnées'}
            </Button>
          </div>
        )}

        {/* Carte cliquable avec MapComponent */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">Carte de l'Île Feydeau</h2>
          <div className="flex justify-center">
            <div className="relative" onClick={handleMapClick} style={{ cursor: 'crosshair' }}>
              <MapComponent
                locations={[]}
                testPoint={coordinates || undefined}
                readOnly={true}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            💡 Astuce : Le point rouge montre votre dernier clic
          </p>
        </div>
      </div>
    </div>
  );
}
