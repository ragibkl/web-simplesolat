// The month table, shared by the interactive month page (/times/) and the
// zone pages (/times/bn/brn01/). Runs in the browser.
import { type Day, type Key, ROWS, to12h } from "./times";

export type Lang = "en" | "ms";

// Prayer names as people say them in Malay, for the Malay pages.
const MALAY: Record<Key, string> = {
  imsak: "Imsak",
  fajr: "Subuh",
  syuruk: "Syuruk",
  dhuha: "Dhuha",
  dhuhr: "Zohor",
  asr: "Asar",
  maghrib: "Maghrib",
  isha: "Isyak",
};

export function rowsFor(lang: Lang): [Key, string][] {
  return lang === "ms" ? ROWS.map(([key]) => [key, MALAY[key]]) : ROWS;
}

export const locale = (lang: Lang) => (lang === "ms" ? "ms-MY" : "en-GB");

export function shiftMonth(m: string, by: number): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthName(m: string, lang: Lang = "en"): string {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString(locale(lang), {
    month: "long",
    year: "numeric",
  });
}

// Fills the table's header row and body. Only the columns this timetable
// has: no Dhuha where the authority doesn't publish it.
export function renderMonthTable(
  head: HTMLElement,
  body: HTMLElement,
  days: Day[],
  today: string,
  lang: Lang = "en",
) {
  const cols = rowsFor(lang).filter(([key]) => days.some((d) => d[key]));
  const th = (text: string) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = text;
    return cell;
  };
  head.replaceChildren(
    th(lang === "ms" ? "Tarikh" : "Date"),
    ...cols.map(([, label]) => th(label)),
  );

  body.replaceChildren(
    ...days.map((day) => {
      const date = new Date(`${day.date}T00:00:00`);
      const tr = document.createElement("tr");
      if (date.getDay() === 5) tr.classList.add("friday");
      if (day.date === today) tr.classList.add("today");
      const rowHead = document.createElement("th");
      rowHead.scope = "row";
      rowHead.textContent = date.toLocaleDateString(locale(lang), {
        weekday: "short",
        day: "numeric",
      });
      tr.append(
        rowHead,
        ...cols.map(([key]) => {
          const td = document.createElement("td");
          const t = day[key];
          td.textContent = t ? to12h(t, false) : "–";
          return td;
        }),
      );
      return tr;
    }),
  );
}
