// The countries that get a page per zone (/times/bn/brn01/), so searches
// like "waktu solat Tutong" can find them. Read from the simplesolat-data
// CDN at build time; the times themselves load in the browser, so the site
// only needs rebuilding when zones are added or renamed.
import type { Lang } from "./month";
import { getCountries, getZones, type Country, type Zone } from "./times";

export type PageCountry = {
  code: string;
  slug: string;
  lang: Lang;
  // The name used in page titles (Malay for the Malay pages).
  name: string;
};

export const PAGE_COUNTRIES: PageCountry[] = [
  { code: "BN", slug: "bn", lang: "ms", name: "Brunei" },
  { code: "MY", slug: "my", lang: "ms", name: "Malaysia" },
  { code: "SG", slug: "sg", lang: "ms", name: "Singapura" },
  { code: "LK", slug: "lk", lang: "en", name: "Sri Lanka" },
];

export const hasZonePages = (code: string) =>
  PAGE_COUNTRIES.some((c) => c.code === code);

export const countryPath = (code: string) => `/times/${code.toLowerCase()}/`;

export const zonePath = (countryCode: string, zoneCode: string) =>
  `/times/${countryCode.toLowerCase()}/${zoneCode.toLowerCase()}/`;

export type CountryWithZones = PageCountry & {
  country: Country;
  zones: Zone[];
};

let cache: Promise<CountryWithZones[]> | undefined;

export function getPageCountries(): Promise<CountryWithZones[]> {
  cache ??= (async () => {
    const countries = await getCountries();
    return Promise.all(
      PAGE_COUNTRIES.map(async (pc) => {
        const country = countries.find((c) => c.code === pc.code);
        if (!country) throw new Error(`${pc.code} missing from countries.yaml`);
        return { ...pc, country, zones: await getZones(pc.code) };
      }),
    );
  })();
  return cache;
}

// Zones grouped by state, in the data's order.
export function byState(zones: Zone[]): [string, Zone[]][] {
  const groups = new Map<string, Zone[]>();
  for (const z of zones)
    groups.set(z.state, [...(groups.get(z.state) ?? []), z]);
  return [...groups];
}
