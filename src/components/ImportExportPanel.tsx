import React from 'react';
import { Button } from '@/components/ui/button';
import { exportAllData, exportEvents, exportEventsToCSV, importData, importEventsFromCSV } from '@/services/importExportService';

export const ImportExportPanel: React.FC = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    try {
      const data = exportAllData();
      downloadFile(data, `feydeau-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (error) {
      console.error('Erreur d\'exportation', error);
    }
  };

  const handleExportEvents = () => {
    try {
      const data = exportEvents();
      downloadFile(data, `feydeau-events-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (error) {
      console.error('Erreur d\'exportation des événements', error);
    }
  };

  const handleExportEventsCSV = () => {
    try {
      const data = exportEventsToCSV();
      downloadFile(data, `feydeau-events-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
    } catch (error) {
      console.error('Erreur d\'exportation des événements au format CSV', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = importData(content);
        
        if (result.success) {
          console.log('Importation réussie:', result.message);
        } else {
          console.error('Erreurs lors de l\'importation:', result.message);
          
          if (result.errors && result.errors.length > 0) {
            console.error('Erreurs d\'importation:', result.errors);
          }
        }
      } catch (error) {
        console.error('Erreur d\'importation des données', error);
      }
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = importEventsFromCSV(content);
        
        if (result.success) {
          console.log('Importation CSV réussie:', result.message);
        } else {
          console.error('Erreurs lors de l\'importation CSV:', result.message);
          
          if (result.errors && result.errors.length > 0) {
            console.error('Erreurs d\'importation CSV:', result.errors);
          }
        }
      } catch (error) {
        console.error('Erreur d\'importation CSV', error);
      }
      
      // Réinitialiser l'input file
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    try {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none'; // Masquer l'élément
      
      // Vérification sécurisée avant manipulation DOM
      if (document.body && document.contains(document.body)) {
        document.body.appendChild(a);
        a.click();
        
        // Cleanup sécurisé avec vérification
        if (document.body.contains(a)) {
          try {
            document.body.removeChild(a);
          } catch (removeError) {
            console.warn('[ImportExportPanel] Error removing download element:', removeError);
            // Fallback: essayer de supprimer via remove() si disponible
            if (a.remove) {
              a.remove();
            }
          }
        }
      } else {
        console.warn('[ImportExportPanel] Document body not available for download');
      }
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[ImportExportPanel] Error in downloadFile:', error);
      // Fallback: essayer d'ouvrir dans une nouvelle fenêtre
      try {
        const dataUrl = `data:${type};charset=utf-8,${encodeURIComponent(data)}`;
        window.open(dataUrl, '_blank');
      } catch (fallbackError) {
        console.error('[ImportExportPanel] Fallback download failed:', fallbackError);
        alert('Impossible de télécharger le fichier. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Import/Export de données</h2>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Exportation</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportAll}>
            Exporter toutes les données
          </Button>
          <Button onClick={handleExportEvents}>
            Exporter les événements
          </Button>
          <Button onClick={handleExportEventsCSV}>
            Exporter les événements (CSV)
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Importation</h3>
        <div className="flex flex-col gap-2">
          <div>
            <Button onClick={() => fileInputRef.current?.click()}>
              Importer depuis JSON
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
          
          <div>
            <Button onClick={() => csvInputRef.current?.click()}>
              Importer événements depuis CSV
            </Button>
            <input
              type="file"
              ref={csvInputRef}
              onChange={handleImportCSV}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
