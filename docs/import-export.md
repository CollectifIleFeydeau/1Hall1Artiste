# Documentation du système d'import/export de données

Ce document explique comment utiliser le système d'import/export de données pour faciliter la saisie d'événements et de lieux.

## Exportation des données

### Exportation au format JSON

Le service d'exportation permet de générer des fichiers JSON contenant les données de l'application. Vous pouvez exporter :

- Toutes les données (événements et lieux)
- Uniquement les événements
- Uniquement les lieux

#### Exemple d'utilisation

```typescript
import { exportAllData, exportEvents, exportLocations } from "@/services/importExportService";

// Exporter toutes les données
const allData = exportAllData();

// Exporter uniquement les événements
const eventsData = exportEvents();

// Exporter uniquement les lieux
const locationsData = exportLocations();
```

#### Téléchargement du fichier exporté

Pour télécharger le fichier JSON exporté, vous pouvez utiliser le code suivant :

```typescript
const downloadJSON = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Exemple d'utilisation
const handleExport = () => {
  const data = exportAllData();
  downloadJSON(data, `feydeau-export-${new Date().toISOString().split('T')[0]}.json`);
};
```

### Exportation au format CSV

Pour les événements, vous pouvez également les exporter au format CSV, ce qui peut être utile pour l'édition dans un tableur.

```typescript
import { exportEventsToCSV } from "@/services/importExportService";

// Exporter les événements au format CSV
const csvData = exportEventsToCSV();

// Télécharger le fichier CSV
const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Exemple d'utilisation
const handleExportCSV = () => {
  const data = exportEventsToCSV();
  downloadCSV(data, `feydeau-events-${new Date().toISOString().split('T')[0]}.csv`);
};
```

## Importation des données

### Importation depuis JSON

Vous pouvez importer des données depuis un fichier JSON. Le système validera automatiquement les données importées et vous informera des erreurs éventuelles.

```typescript
import { importData } from "@/services/importExportService";

// Fonction pour lire un fichier et importer les données
const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const result = importData(content);
    
    if (result.success) {
      // Importation réussie
      console.log(result.message);
      console.log(`Événements importés: ${result.importedEvents}`);
      console.log(`Lieux importés: ${result.importedLocations}`);
    } else {
      // Erreurs lors de l'importation
      console.error(result.message);
      console.error(result.errors);
    }
  };
  
  reader.readAsText(file);
};
```

### Importation depuis CSV

Vous pouvez également importer des événements depuis un fichier CSV.

```typescript
import { importEventsFromCSV } from "@/services/importExportService";

// Fonction pour lire un fichier CSV et importer les événements
const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const result = importEventsFromCSV(content);
    
    if (result.success) {
      // Importation réussie
      console.log(result.message);
      console.log(`Événements importés: ${result.importedEvents}`);
    } else {
      // Erreurs lors de l'importation
      console.error(result.message);
      console.error(result.errors);
    }
  };
  
  reader.readAsText(file);
};
```

## Format des fichiers d'importation

### Format JSON

Le format JSON pour l'importation doit respecter la structure suivante :

```json
{
  "events": [
    {
      "id": "event1",
      "title": "Titre de l'événement",
      "artistName": "Nom de l'artiste",
      "type": "exposition",
      "description": "Description de l'événement",
      "artistBio": "Biographie de l'artiste",
      "contact": "Contact de l'artiste",
      "time": "10h00 - 18h00",
      "days": ["samedi", "dimanche"],
      "locationName": "Nom du lieu",
      "locationDescription": "Description du lieu",
      "x": 100,
      "y": 200
    }
  ],
  "locations": [
    {
      "id": "location1",
      "name": "Nom du lieu",
      "description": "Description du lieu",
      "x": 100,
      "y": 200,
      "events": ["event1"]
    }
  ]
}
```

### Format CSV pour les événements

Le format CSV pour l'importation des événements doit inclure les en-têtes suivants :

```
id,title,artistName,type,description,artistBio,contact,time,days,locationName,locationDescription,x,y
```

Exemple de contenu CSV :

```
id,title,artistName,type,description,artistBio,contact,time,days,locationName,locationDescription,x,y
event1,"Titre de l'événement","Nom de l'artiste",exposition,"Description de l'événement","Biographie de l'artiste","Contact de l'artiste","10h00 - 18h00","samedi,dimanche","Nom du lieu","Description du lieu",100,200
```

## Validation des données

Lors de l'importation, toutes les données sont validées pour s'assurer qu'elles respectent les contraintes du système. Les erreurs de validation sont retournées dans le résultat de l'importation.
