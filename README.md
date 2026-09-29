# web-simplesolat

The website for [simplesolat](https://github.com/ragibkl/simplesolat), a free
prayer times app: [simplesolat.com](https://simplesolat.com). Built with
[Astro](https://astro.build) and served as static files by nginx.

The live prayer times on the home page run entirely in the browser, reading the
public [simplesolat-data](https://github.com/ragibkl/simplesolat-data) CDN. "Use
my location" matches the location to a zone in the browser, the same way the
app does, and never sends it anywhere.

## Development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds to dist/
```

| Path | What |
| --- | --- |
| `src/pages/index.astro` | The home page |
| `src/pages/privacy.astro` | The privacy policy (linked from Google Play) |
| `src/components/LiveTimes.astro` | Live prayer times: zone picker and "Use my location" |
| `src/lib/site.ts` | Links, and the list of official sources |

## Releasing

CI publishes `ghcr.io/ragibkl/web-simplesolat:sha-<short sha>` on every push.
To roll out, set that tag in `ragibkl/flux-deploy`.
