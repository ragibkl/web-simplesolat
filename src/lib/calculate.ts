// Calculated prayer times for places without an official timetable, with the
// method listed for the country in simplesolat-data's methods.yaml (the same
// file the app uses, so the two agree). methods.json is a copy for when the
// CDN can't be reached; loadMethods() fetches the latest.
import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Rounding,
} from "adhan";
import { load } from "js-yaml";

import bundled from "./methods.json";
import { fetchText } from "./times";

type MethodDef = {
  label: string;
  fajr_angle: number;
  isha_angle?: number;
  isha_interval?: number;
  maghrib_angle?: number;
  adjustments?: Record<string, number>;
  rounding?: "nearest" | "up";
};
type MethodsDoc = {
  default: string;
  methods: Record<string, MethodDef>;
  countries: Record<string, string>;
};

let current = bundled as MethodsDoc;
let loading: Promise<void> | null = null;

// Once per page; until it loads, or if it can't, the bundled copy is used.
export function loadMethods(): Promise<void> {
  loading ??= fetchText("/methods.yaml")
    .then((text) => {
      const doc = load(text) as MethodsDoc;
      if (doc?.methods && doc.countries && doc.methods[doc.default])
        current = doc;
    })
    .catch(() => {});
  return loading;
}

function methodFor(countryIso: string | null): MethodDef {
  const name = (countryIso && current.countries[countryIso]) || current.default;
  return current.methods[name] ?? current.methods[current.default];
}

// adhan's "Other" method with the file's values reproduces its built-in
// methods of the same name.
function toParams(def: MethodDef) {
  const params = CalculationMethod.Other();
  params.fajrAngle = def.fajr_angle;
  params.ishaAngle = def.isha_angle ?? 0;
  params.ishaInterval = def.isha_interval ?? 0;
  params.maghribAngle = def.maghrib_angle ?? 0;
  params.methodAdjustments = {
    ...params.methodAdjustments,
    ...def.adjustments,
  };
  if (def.rounding === "up") params.rounding = Rounding.Up;
  return params;
}

export function calculateDay(
  date: Date,
  lat: number,
  lng: number,
  countryIso: string | null,
  timeZone: string,
) {
  const def = methodFor(countryIso);
  const label = def.label;
  const params = toParams(def);
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
