// Shared by the live times on the home page and the month page: countries,
// zones and timetables from the public simplesolat-data CDN, and finding the
// zone for a location. Everything runs in the browser.
import { load } from "js-yaml";

export const CDN = "https://simplesolat-data.netlify.app";
export const STORE_KEY = "simplesolat:zone";

export type Country = {
  code: string;
  name: string;
  source: string;
  geojson: string;
  mapping: string;
  shape_property: string;
};
export type Zone = {
  code: string;
  country: string;
  state: string;
  location: string;
  timezone: string;
};
export type Key =
  "imsak" | "fajr" | "syuruk" | "dhuha" | "dhuhr" | "asr" | "maghrib" | "isha";
// Dhuha only comes from official timetables (Malaysia and Brunei).
export type Day = Record<"date" | Exclude<Key, "dhuha">, string> & {
  dhuha?: string;
};

export const ROWS: [Key, string][] = [
  ["imsak", "Imsak"],
  ["fajr", "Fajr"],
  ["syuruk", "Syuruk"],
  ["dhuha", "Dhuha"],
  ["dhuhr", "Dhuhr"],
  ["asr", "Asr"],
  ["maghrib", "Maghrib"],
  ["isha", "Isha"],
];

type Ring = [number, number][];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };
type Feature = {
  properties: Record<string, string>;
  geometry: Geometry | null;
};

// Rough bounding boxes [minLon, minLat, maxLon, maxLat], so we only download
// the boundary file for a country the visitor might be in. Smallest first,
// because some overlap (Singapore and Brunei sit inside Malaysia's box).
const BOXES: Record<string, [number, number, number, number]> = {
  SG: [103.5, 1.1, 104.2, 1.5],
  BN: [113.9, 3.9, 115.5, 5.1],
  AL: [19.1, 39.5, 21.2, 42.8],
  BA: [15.6, 42.4, 19.8, 45.4],
  LK: [79.4, 5.8, 82.0, 10.0],
  AE: [51.4, 22.5, 56.5, 26.2],
  MY: [99.5, 0.8, 119.4, 7.5],
  TR: [25.5, 35.7, 45.0, 42.3],
  ID: [94.9, -11.1, 141.2, 6.2],
};

export async function fetchText(path: string): Promise<string> {
  const res = await fetch(path.startsWith("http") ? path : CDN + path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.text();
}

export async function getCountries(): Promise<Country[]> {
  const doc = load(await fetchText("/countries.yaml")) as {
    countries: Country[];
  };
  return doc.countries;
}

const zonesByCountry = new Map<string, Zone[]>();

export async function getZones(code: string): Promise<Zone[]> {
  let zones = zonesByCountry.get(code);
  if (!zones) {
    const doc = load(await fetchText(`/zones/${code}.yaml`)) as {
      zones: Zone[];
    };
    zones = doc.zones;
    zonesByCountry.set(code, zones);
  }
  return zones;
}

// A zone's timetable for one month ("YYYY-MM").
export async function getMonth(
  countryCode: string,
  zoneCode: string,
  month: string,
): Promise<Day[]> {
  return JSON.parse(
    await fetchText(`/prayer-times/${countryCode}/${zoneCode}/${month}.json`),
  ) as Day[];
}

// "YYYY-MM-DD" and "HH:MM" in the zone's own timezone.
export function nowIn(timezone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function to12h(hhmm: string, withAmPm = true): string {
  const [h, m] = hhmm.split(":").map(Number);
  const time = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
  return withAmPm ? `${time} ${h < 12 ? "am" : "pm"}` : time;
}

// Fills a zone dropdown with the country's zones, grouped by state.
export async function fillZones(
  select: HTMLSelectElement,
  countryCode: string,
  selected?: string,
) {
  select.disabled = true;
  const zones = await getZones(countryCode);
  const byState = new Map<string, Zone[]>();
  for (const z of zones)
    byState.set(z.state, [...(byState.get(z.state) ?? []), z]);

  const placeholder = new Option("Choose a zone", "");
  const groups = [...byState].map(([state, list]) => {
    const group = document.createElement("optgroup");
    group.label = state;
    for (const z of list) group.append(new Option(z.location, z.code));
    return group;
  });
  select.replaceChildren(placeholder, ...groups);
  select.value = selected ?? "";
  select.disabled = false;
}

// Ray casting: is the point inside this ring?
function inRing([x, y]: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(point: [number, number], rings: Ring[]): boolean {
  const [outer, ...holes] = rings;
  return inRing(point, outer) && !holes.some((h) => inRing(point, h));
}

function contains(geometry: Geometry | null, point: [number, number]) {
  // Some boundary files include a region with no shape at all; skip those.
  if (!geometry) return false;
  if (geometry.type === "Polygon")
    return inPolygon(point, geometry.coordinates);
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates.some((poly) => inPolygon(point, poly));
  return false;
}

// The browser's location, or null if it can't or won't share it.
export async function getPosition(): Promise<GeolocationPosition | null> {
  if (!("geolocation" in navigator)) return null;
  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 10 * 60 * 1000,
    }),
  ).catch(() => null);
}

// The official zone for a location, if it's in a country with a timetable.
export async function findZone(
  countries: Country[],
  lat: number,
  lng: number,
  onProgress: (text: string) => void = () => {},
): Promise<{ country: Country; zone: string } | null> {
  const point: [number, number] = [lng, lat];
  const candidates = countries.filter((c) => {
    const b = BOXES[c.code];
    return (
      b &&
      point[0] >= b[0] &&
      point[0] <= b[2] &&
      point[1] >= b[1] &&
      point[1] <= b[3]
    );
  });

  for (const country of candidates) {
    onProgress(`Checking the zones for ${country.name}…`);
    const geo = JSON.parse(await fetchText(country.geojson)) as {
      features: Feature[];
    };
    const feature = geo.features.find((f) => contains(f.geometry, point));
    if (!feature) continue;

    const mapping = JSON.parse(await fetchText(country.mapping)) as Record<
      string,
      { zone: string }
    >;
    const entry = mapping[feature.properties[country.shape_property]];
    if (entry) return { country, zone: entry.zone };
  }
  return null;
}

// The country for a location anywhere in the world (for calculated times),
// from the site's own boundary file.
export async function findWorldCountry(
  lat: number,
  lng: number,
): Promise<{ ISO_A2: string; NAME: string } | null> {
  try {
    const res = await fetch("/geodata/countries-adm0-web.json");
    const world = (await res.json()) as {
      features: (Feature & { properties: { ISO_A2: string; NAME: string } })[];
    };
    return (
      world.features.find((f) => contains(f.geometry, [lng, lat]))
        ?.properties ?? null
    );
  } catch {
    return null;
  }
}
