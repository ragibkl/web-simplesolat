export const SITE = {
  name: "simplesolat",
  tagline: "Prayer times with widgets that update themselves.",
  description:
    "A free prayer times app for Android with home screen widgets that follow you when you travel. No ads, no account, and your location never leaves your phone.",
  playStore:
    "https://play.google.com/store/apps/details?id=com.simplesolat.app",
  github: "https://github.com/ragibkl/simplesolat",
  data: "https://github.com/ragibkl/simplesolat-data",
  cdn: "https://simplesolat-data.netlify.app",
  story: "https://ragib.dev/writing/why-i-built-a-prayer-times-app/",
  issues: "https://github.com/ragibkl/simplesolat/issues",
  supportEmail: "ragib.badaruddin@gmail.com",
};

/** Countries with official timetables, as listed in simplesolat-data. */
export const SOURCES = [
  {
    country: "Malaysia",
    authority: "JAKIM",
    url: "https://www.e-solat.gov.my",
  },
  { country: "Singapore", authority: "MUIS", url: "https://data.gov.sg" },
  {
    country: "Indonesia",
    authority: "Kemenag (via EQuran.id)",
    url: "https://equran.id",
  },
  { country: "Brunei", authority: "KHEU", url: "https://www.mora.gov.bn" },
  {
    country: "Sri Lanka",
    authority: "ACJU",
    url: "https://www.acju.lk/prayer-times/",
  },
  {
    country: "Turkey",
    authority: "Diyanet",
    url: "https://namazvakitleri.diyanet.gov.tr",
  },
  {
    country: "United Arab Emirates",
    authority: "AWQAF",
    url: "https://www.awqaf.gov.ae",
  },
  {
    country: "Bosnia and Herzegovina",
    authority: "IZ BiH (Vaktija)",
    url: "https://vaktija.ba",
  },
  { country: "Albania", authority: "KMSH", url: "https://kmsh.al" },
];
