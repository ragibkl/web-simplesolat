// Calculated prayer times for places without an official timetable.
// The method table is copied from the app (simplesolat
// lib/domain/adhanCalculator.ts) so the website and the app always agree.
// Keep the two in sync.
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";

// --- Country → calculation method mapping ---

const COUNTRY_METHODS: Record<string, { method: string; label: string }> = {
  // Built-in adhan methods
  SA: { method: "UmmAlQura", label: "Umm Al-Qura" },
  AE: { method: "Dubai", label: "Dubai" },
  EG: { method: "Egyptian", label: "Egyptian" },
  TR: { method: "Turkey", label: "Turkey" },
  PK: { method: "Karachi", label: "Karachi" },
  QA: { method: "Qatar", label: "Qatar" },
  KW: { method: "Kuwait", label: "Kuwait" },
  US: { method: "NorthAmerica", label: "ISNA" },
  CA: { method: "NorthAmerica", label: "ISNA" },
  IR: { method: "Tehran", label: "Tehran" },
  // Custom methods
  JO: { method: "Jordan", label: "Jordan" },
  DZ: { method: "Algeria", label: "Algeria" },
  TN: { method: "Tunisia", label: "Tunisia" },
  FR: { method: "France", label: "UOIF" },
  RU: { method: "Russia", label: "Russia" },
  MA: { method: "Morocco", label: "Morocco" },
  PT: { method: "Portugal", label: "Lisbon" },
  // Gulf region (Bahrain, Oman, Yemen) — follows Umm Al-Qura
  BH: { method: "UmmAlQura", label: "Umm Al-Qura" },
  OM: { method: "UmmAlQura", label: "Umm Al-Qura" },
  YE: { method: "UmmAlQura", label: "Umm Al-Qura" },
};

const DEFAULT_METHOD = {
  method: "MuslimWorldLeague",
  label: "Muslim World League",
};

export function getCalculationMethod(countryIso: string | null): {
  method: string;
  label: string;
} {
  if (!countryIso) return DEFAULT_METHOD;
  return COUNTRY_METHODS[countryIso] ?? DEFAULT_METHOD;
}

// --- Adhan calculation parameters ---

function customMethod(fajrAngle: number, ishaAngle: number) {
  return () => {
    const params = CalculationMethod.Other();
    params.fajrAngle = fajrAngle;
    params.ishaAngle = ishaAngle;
    return params;
  };
}

function customMethodIshaOffset(fajrAngle: number, ishaOffsetMinutes: number) {
  return () => {
    const params = CalculationMethod.Other();
    params.fajrAngle = fajrAngle;
    params.ishaInterval = ishaOffsetMinutes;
    return params;
  };
}

const METHODS: Record<string, () => CalculationParameters> = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  NorthAmerica: () => CalculationMethod.NorthAmerica(),
  Dubai: () => CalculationMethod.Dubai(),
  Qatar: () => CalculationMethod.Qatar(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Turkey: () => CalculationMethod.Turkey(),
  Tehran: () => CalculationMethod.Tehran(),
  Singapore: () => CalculationMethod.Singapore(),
  Jordan: customMethod(18, 18),
  Algeria: customMethod(18, 17),
  Tunisia: customMethod(18, 18),
  France: customMethod(12, 12),
  Russia: customMethod(16, 15),
  Morocco: customMethod(19, 17),
  Portugal: customMethodIshaOffset(18, 77),
};

// --- Prayer time calculation (same rules as the app) ---

/** Today's times at a location, as HH:MM in the given IANA timezone. */
export function calculateDay(
  date: Date,
  lat: number,
  lng: number,
  countryIso: string | null,
  timeZone: string,
) {
  const { method, label } = getCalculationMethod(countryIso);
  const params = (METHODS[method] ?? METHODS.MuslimWorldLeague)();
  params.madhab = Madhab.Shafi;

  const pt = new PrayerTimes(new Coordinates(lat, lng), date, params);
  const hhmm = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(d);

  return {
    label,
    times: {
      imsak: hhmm(new Date(pt.fajr.getTime() - 10 * 60 * 1000)),
      fajr: hhmm(pt.fajr),
      syuruk: hhmm(pt.sunrise),
      dhuhr: hhmm(pt.dhuhr),
      asr: hhmm(pt.asr),
      maghrib: hhmm(pt.maghrib),
      isha: hhmm(pt.isha),
    },
  };
}
