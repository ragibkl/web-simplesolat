// Today's times in the Today card (components/TodayCard.astro), the same on
// the home page, /times/ and the zone pages. Runs in the browser.
import { type Lang, locale, rowsFor } from "./month";
import { type Day, nowIn, to12h } from "./times";

const el = (id: string) => document.getElementById(id)!;

export function longDate(date: string, lang: Lang = "en"): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Fills the card, highlighting the current time (same rule as the app: a time
// is current until the next one; Isha runs until midnight).
export function renderToday(day: Day, timezone: string, lang: Lang = "en") {
  const now = nowIn(timezone);
  const rows = rowsFor(lang).filter(([key]) => day[key] !== undefined);
  let active = -1;
  rows.forEach(([key], i) => {
    const next = rows[i + 1];
    if (now.time >= day[key]! && (!next || now.time < day[next[0]]!))
      active = i;
  });

  el("today-date").textContent = longDate(day.date, lang);
  el("today-rows").replaceChildren(
    ...rows.map(([key, label], i) => {
      const tr = document.createElement("tr");
      if (i === active) tr.className = "active";
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = label;
      const td = document.createElement("td");
      td.textContent = to12h(day[key]!);
      tr.append(th, td);
      return tr;
    }),
  );
  el("today-note").textContent =
    rows[active]?.[0] === "fajr"
      ? `Fajr ends at Syuruk, ${to12h(day.syuruk)}.`
      : "Fajr ends at Syuruk (sunrise).";
  el("today-body").hidden = false;
  setTodayStatus("");
}

// A message in place of the times (loading, not published, error).
export function setTodayStatus(text: string) {
  el("today-status").textContent = text;
  if (text) el("today-body").hidden = true;
}
