import React from 'react';
import { Button } from '@/components/ui/button';
import { exportAllData, exportEvents, exportEventsToCSV, importData, importEventsFromCSV } from '@/services/importExportService';
import { useToast } from '@/components/ui/use-toast';

export const ImportExportPanel: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    try {
      const data = exportAllData();
      downloadFile(data, `feydeau-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      toast({
        title: 'Exportation réussie',
        description: 'Toutes les données ont été exportées avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'exportation des données.',
        variant: 'destructive',
      });
    }
  };

  const handleExportEvents = () => {
    try {
      const data = exportEvents();
      downloadFile(data, `feydeau-events-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      toast({
        title: 'Exportation réussie',
        description: 'Les événements ont été exportés avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'exportation des événements.',
        variant: 'destructive',
      });
    }
  };

  const handleExportEventsCSV = () => {
    try {
      const data = exportEventsToCSV();
      downloadFile(data, `feydeau-events-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
      toast({
        title: 'Exportation CSV réussie',
        description: 'Les événements ont été exportés au format CSV avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'exportation des événements au format CSV.',
        variant: 'destructive',
      });
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
          toast({
            title: 'Importation réussie',
            description: result.message,
          });
        } else {
          toast({
            title: 'Erreurs lors de l\'importation',
            description: result.message,
            variant: 'destructive',
          });
          
          if (result.errors && result.errors.length > 0) {
            console.error('Erreurs d\'importation:', result.errors);
          }
        }
      } catch (error) {
        toast({
          title: 'Erreur d\'importation',
          description: 'Une erreur est survenue lors de l\'importation des données.',
          variant: 'destructive',
        });
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
          toast({
            title: 'Importation CSV réussie',
            description: result.message,
          });
        } else {
          toast({
            title: 'Erreurs lors de l\'importation CSV',
            description: result.message,
            variant: 'destructive',
          });
          
          if (result.errors && result.errors.length > 0) {
            console.error('Erreurs d\'importation CSV:', result.errors);
          }
        }
      } catch (error) {
        toast({
          title: 'Erreur d\'importation CSV',
          description: 'Une erreur est survenue lors de l\'importation des événements depuis CSV.',
          variant: 'destructive',
        });
      }
      
      // Réinitialiser l'input file
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
