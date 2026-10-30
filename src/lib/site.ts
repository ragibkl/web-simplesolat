export const SITE = {
  name: "simplesolat",
  tagline: "Prayer times with widgets that update themselves.",
  description:
    "A free prayer times app for Android and iPhone with home screen widgets that follow you when you travel. No ads, no account, and your location never leaves your phone.",
  playStore:
    "https://play.google.com/store/apps/details?id=com.simplesolat.app",
  appStore: "https://apps.apple.com/app/id6818761315",
  github: "https://github.com/ragibkl/simplesolat",
  data: "https://github.com/ragibkl/simplesolat-data",
  cdn: "https://simplesolat-data.netlify.app",
  api: "https://api.simplesolat.com",
  apiDocs: "https://github.com/ragibkl/simplesolat-api#readme",
  dataIssues: "https://github.com/ragibkl/simplesolat-data/issues",
  story: "https://ragib.dev/writing/why-i-built-a-prayer-times-app/",
  issues: "https://github.com/ragibkl/simplesolat/issues",
  supportEmail: "support@simplesolat.com",
};

/** Countries with official timetables, as listed in simplesolat-data. */
export const SOURCES = [
  {
    country: "Malaysia",
    code: "MY",
    authority: "JAKIM",
    url: "https://www.e-solat.gov.my",
  },
  {
    country: "Singapore",
    code: "SG",
    authority: "MUIS",
    url: "https://data.gov.sg",
  },
  {
    country: "Indonesia",
    code: "ID",
    authority: "Kemenag (via EQuran.id)",
    url: "https://equran.id",
  },
  {
    country: "Brunei",
    code: "BN",
    authority: "KHEU",
    url: "https://www.mora.gov.bn",
  },
  {
    country: "Sri Lanka",
    code: "LK",
    authority: "ACJU",
    url: "https://www.acju.lk/prayer-times/",
  },
  {
    country: "Turkey",
    code: "TR",
    authority: "Diyanet",
    url: "https://namazvakitleri.diyanet.gov.tr",
  },
  {
    country: "United Arab Emirates",
    code: "AE",
    authority: "AWQAF",
    url: "https://www.awqaf.gov.ae",
  },
  {
    country: "Bosnia and Herzegovina",
    code: "BA",
    authority: "IZ BiH (Vaktija)",
    url: "https://vaktija.ba",
  },
  { country: "Albania", code: "AL", authority: "KMSH", url: "https://kmsh.al" },
];
