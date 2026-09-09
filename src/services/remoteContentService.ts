// Synchronisation du programme depuis Google Sheets.
//
// Source de vérité : deux Google Sheets (expositions, concerts) édités par les
// organisateurs. L'app fetch les CSV au lancement, les parse, construit des
// objets Event/Artist compatibles avec les types existants, et les pousse au
// dataService. Cache localStorage 24h sert de fallback hors-ligne ; les fichiers
// TS bundlés (src/data/*) restent le filet de sécurité ultime.

import Papa from "papaparse";
import {
  REMOTE_SHEETS,
  buildCsvUrl,
  REMOTE_FETCH_TIMEOUT_MS,
  REMOTE_CACHE_TTL_MS,
  REMOTE_CACHE_KEY,
  EXPO_DEFAULT_TIME,
} from "@/config/remoteContent";
import { Event } from "@/data/events";
import { Artist } from "@/data/artists";
import { locations } from "@/data/locations";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RemoteContent");

export type RemoteProgram = {
  events: Event[];
  artists: Artist[];
};

type CachedProgram = {
  fetchedAt: number;
  program: RemoteProgram;
};

// Map Location.name (lowercased + trimmed) -> id, pour résoudre l'adresse saisie
// dans le Sheet en locationId interne.
function buildLocationLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const loc of locations) {
    // L'organisateur peut saisir soit l'ID interne (ex. "quai-turenne-11"),
    // soit le nom affiché (ex. "11 quai Turenne") — on accepte les deux.
    map.set(normalize(loc.id), loc.id);
    map.set(normalize(loc.name), loc.id);
    for (const segment of loc.name.split("/")) {
      map.set(normalize(segment), loc.id);
    }
  }
  return map;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "anonyme";
}

function ensureUniqueId(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  const id = `${base}-${i}`;
  used.add(id);
  return id;
}

// Permissif : cellule vide ou explicitement négative → false ; sinon → true.
// Tolère "Oui", "Yes", "X", "Samedi"/"Dimanche" (si l'organisateur tape le jour
// au lieu de Oui), une coche, etc.
function parseYesNo(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v === "" || v === "-") return false;
  return !/^(non|no|n|0|false|faux)$/i.test(v);
}

// Récupère une cellule en testant plusieurs en-têtes possibles (tolérance aux
// variations de casse/accent que peuvent introduire les organisateurs).
function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
      return String(direct).trim();
    }
    const lowerKey = key.toLowerCase();
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase() === lowerKey) {
        const v = row[rowKey];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
    }
  }
  return "";
}

async function fetchCsv(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseCsv(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (result.errors.length > 0) {
    logger.warn("Erreurs de parsing CSV", result.errors.slice(0, 3));
  }
  return result.data;
}

function buildExpoRows(
  rows: Record<string, string>[],
  locationLookup: Map<string, string>,
  artistIds: Set<string>,
  eventIds: Set<string>
): { events: Event[]; artists: Artist[] } {
  const events: Event[] = [];
  const artists: Artist[] = [];

  for (const row of rows) {
    const name = pick(row, "Prénom et Nom de l'artiste", "Prénom et Nom", "Nom de l'artiste");
    if (!name) continue;

    const samedi = parseYesNo(pick(row, "Samedi"));
    const dimanche = parseYesNo(pick(row, "Dimanche"));
    if (!samedi && !dimanche) continue;

    const days: ("samedi" | "dimanche")[] = [];
    if (samedi) days.push("samedi");
    if (dimanche) days.push("dimanche");

    const adresse = pick(row, "Adresse expo", "Adresse");
    const locationId = locationLookup.get(normalize(adresse));
    if (!locationId) {
      logger.warn(`Lieu introuvable pour "${name}" : "${adresse}" — ligne ignorée`);
      continue;
    }
    const locationName = locations.find((l) => l.id === locationId)?.name ?? adresse;

    const presentation = pick(row, "Deux lignes pour vous présenter", "Présentation");
    const title = pick(row, "Titre", "Titre de l'exposition") || name;
    const category = pick(row, "Type d'évènement", "Type d'événement", "Type d'evenement", "Type") || "Exposition";

    const artistId = ensureUniqueId(slugify(name), artistIds);
    const artist: Artist = {
      id: artistId,
      name,
      type: "exposition",
      category,
      title,
      presentation,
      email: pick(row, "Adresse e-mail", "Email") || undefined,
      instagram: pick(row, "Compte Instagram (si vous en avez un)", "Compte Instagram", "Instagram") || undefined,
      facebook: pick(row, "Compte Facebook (si vous en avez un)", "Compte Facebook", "Facebook") || undefined,
      website: pick(row, "Site internet (si vous en avez un)", "Site internet", "Website") || undefined,
    };
    artists.push(artist);

    const eventId = ensureUniqueId(`expo-${artistId}`, eventIds);
    events.push({
      id: eventId,
      artistId,
      title,
      time: EXPO_DEFAULT_TIME,
      days,
      locationId,
      locationName,
      artistName: name,
      type: "exposition",
      category,
      // Pas de colonne photo pour les expos dans le Sheet : la vignette vient du
      // portail artiste (override Firebase "thumbnail"), fusionnée uniquement par
      // /api/program (lecture protégée par secret). Ce chemin de repli (Sheets
      // direct, sans /api/program) ne peut donc jamais afficher de photo d'expo.
      image: artist.image,
      imageUrl: artist.image,
    });
  }

  return { events, artists };
}

function buildConcertRows(
  rows: Record<string, string>[],
  locationLookup: Map<string, string>,
  artistIds: Set<string>,
  eventIds: Set<string>
): { events: Event[]; artists: Artist[] } {
  const events: Event[] = [];
  const artists: Artist[] = [];

  for (const row of rows) {
    const name = pick(row, "Nom du groupe", "Groupe", "Nom");
    if (!name) continue;

    const samedi = parseYesNo(pick(row, "Samedi"));
    const dimanche = parseYesNo(pick(row, "Dimanche"));
    if (!samedi && !dimanche) continue;

    const days: ("samedi" | "dimanche")[] = [];
    if (samedi) days.push("samedi");
    if (dimanche) days.push("dimanche");

    const time = pick(row, "Horaires", "Horaire") || "";

    const adresse = pick(row, "Adresse concert", "Adresse");
    const locationId = locationLookup.get(normalize(adresse)) ?? "quai-turenne-9-concert";
    const locationName = locations.find((l) => l.id === locationId)?.name ?? adresse;

    const photos = [
      pick(row, "Liens vers une photo", "Photo 1"),
      pick(row, "Liens vers une seconde photo", "Photo 2"),
      pick(row, "Liens vers une troisième photo", "Photo 3"),
    ].filter(Boolean);

    const category = pick(row, "Type d'évènement", "Type d'événement", "Type d'evenement", "Type") || "Concert";

    const artistId = ensureUniqueId(slugify(name), artistIds);
    const artist: Artist = {
      id: artistId,
      name,
      type: "concert",
      category,
      title: name,
      presentation: pick(row, "Présentation"),
      email: pick(row, "Email") || undefined,
      instagram: pick(row, "Compte Instagram", "Instagram") || undefined,
      facebook: pick(row, "Compte Facebook", "Facebook") || undefined,
      website: pick(row, "Site internet", "Website") || undefined,
      image: photos[0],
      photos: photos.length > 0 ? photos : undefined,
    };
    artists.push(artist);

    // Un event par jour de présence (l'horaire est le même).
    for (const day of days) {
      const eventId = ensureUniqueId(`concert-${artistId}-${day}`, eventIds);
      events.push({
        id: eventId,
        artistId,
        title: name,
        time,
        days: [day],
        locationId,
        locationName,
        artistName: name,
        type: "concert",
        category,
        image: artist.image,
        imageUrl: artist.image,
      });
    }
  }

  return { events, artists };
}

function readCache(): CachedProgram | null {
  try {
    const raw = localStorage.getItem(REMOTE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProgram;
    if (!parsed?.program?.events || !parsed?.program?.artists) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(program: RemoteProgram): void {
  try {
    const payload: CachedProgram = { fetchedAt: Date.now(), program };
    localStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    logger.warn("Impossible d'écrire le cache du programme distant", e);
  }
}

export function getCachedProgram(): RemoteProgram | null {
  return readCache()?.program ?? null;
}

export async function fetchRemoteProgram(): Promise<RemoteProgram> {
  // Source primaire : /api/program (Vercel Function) — applique les overrides artistes
  // (présentation, vignette, réseaux) stockés dans Firebase par-dessus le Google Sheet.
  try {
    logger.info("Fetch du programme distant (/api/program)");
    // Pas de cache-buster : on s'appuie sur le cache edge Vercel (s-maxage=60s).
    const res = await fetch(`/api/program`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.events) && Array.isArray(data.artists)) {
      // /api/program renvoie locationName = locationId ; on résout le vrai nom côté client.
      const events = (data.events as Event[]).map((e) => ({
        ...e,
        locationName: locations.find((l) => l.id === e.locationId)?.name ?? e.locationName,
      }));
      const program: RemoteProgram = { events, artists: data.artists };
      logger.info(
        `Programme distant (/api/program) : ${program.events.length} events, ${program.artists.length} artistes`
      );
      writeCache(program);
      return program;
    }
    throw new Error("Réponse /api/program invalide");
  } catch (apiErr) {
    logger.warn("/api/program indisponible, fallback Google Sheets (sans overrides)", apiErr);
  }

  // Fallback : parse Google Sheets directement (overrides non appliqués).
  const [expoCsv, concertCsv] = await Promise.all([
    fetchCsv(buildCsvUrl(REMOTE_SHEETS.expositions)),
    fetchCsv(buildCsvUrl(REMOTE_SHEETS.concerts)),
  ]);

  const locationLookup = buildLocationLookup();
  const artistIds = new Set<string>();
  const eventIds = new Set<string>();

  const expo = buildExpoRows(parseCsv(expoCsv), locationLookup, artistIds, eventIds);
  const concert = buildConcertRows(parseCsv(concertCsv), locationLookup, artistIds, eventIds);

  const program: RemoteProgram = {
    events: [...expo.events, ...concert.events],
    artists: [...expo.artists, ...concert.artists],
  };

  logger.info(
    `Programme distant (Sheets fallback) : ${program.events.length} events, ${program.artists.length} artistes`
  );

  writeCache(program);
  return program;
}

// Charge le programme avec stratégie : cache valide → renvoie le cache et
// déclenche un refresh en arrière-plan ; sinon fetch direct ; en cas d'échec
// total, renvoie null pour laisser place aux données bundlées.
export async function loadProgram(options: { forceRefresh?: boolean } = {}): Promise<RemoteProgram | null> {
  const cached = readCache();
  const cacheValid =
    cached !== null && Date.now() - cached.fetchedAt < REMOTE_CACHE_TTL_MS;

  if (!options.forceRefresh && cacheValid) {
    // Refresh en arrière-plan, sans attendre.
    fetchRemoteProgram().catch((e) =>
      logger.warn("Refresh arrière-plan échoué, on garde le cache", e)
    );
    return cached!.program;
  }

  try {
    return await fetchRemoteProgram();
  } catch (e) {
    logger.error("Fetch du programme distant échoué", e);
    return cached?.program ?? null;
  }
}
