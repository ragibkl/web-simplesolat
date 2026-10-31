// How a zone is named on screen, shared by the zone pages (at build time) and
// /times/ (in the browser), so a place reads the same everywhere.
import type { Zone } from "./times";

export type PlaceText = {
  // "Prayer times in Selangor (SGR01)": a long area list (Malaysian zones)
  // gets a short heading, so today's times stay near the top on a phone.
  heading: string;
  // The short name alone, for breadcrumbs.
  short: string;
  // The full area list under a short heading, or "".
  areas: string;
  // "Selangor, Malaysia · SGR01 · Source: JAKIM"
  meta: string;
  // For the printout: "Gombak, Petaling…, Selangor"
  printPlace: string;
};

export function placeText(
  zone: Zone,
  countryName: string,
  source: string,
): PlaceText {
  const long = zone.location.length > 32;
  const short = long ? `${zone.state} (${zone.code})` : zone.location;
  // The state is left out where it would repeat ("Singapore, Singapore").
  const showState =
    zone.state && zone.state !== zone.location && zone.state !== countryName;
  return {
    heading: `Prayer times in ${short}`,
    short,
    areas: long ? zone.location : "",
    meta: `${showState ? `${zone.state}, ` : ""}${countryName} · ${zone.code} · Source: ${source}`,
    printPlace: showState ? `${zone.location}, ${zone.state}` : zone.location,
  };
}
