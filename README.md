# Smart Travel AI

A mobile-first GPS self-guided tour Progressive Web App. The product vision is: **Google Maps meets a museum audio guide meets an AI local guide.**

## Phase 1 — PWA Foundation

This branch establishes:
- React + TypeScript + Vite
- Tailwind CSS foundation
- Leaflet + OpenStreetMap
- Live browser GPS with accuracy ring
- Rome demo with 8 historical POIs
- Map-first mobile UI
- Installable PWA manifest and service worker
- Offline shell caching
- Accessible 48px+ primary tap targets

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

Geolocation requires HTTPS in production (localhost is allowed during development).

## Architecture

- `src/components/map` — map presentation and map behavior
- `src/data` — seed POI data
- `src/hooks` — browser sensor hooks
- `src/types` — shared domain types
- `public/manifest.webmanifest` — PWA metadata
- `public/sw.js` — offline app-shell caching

## Roadmap

Phase 2 adds POI detail sheets, proximity content/audio, and IndexedDB-backed offline tour content. Phase 3 connects the AI guide, voice, streaming responses, citations, and camera/vision. Phase 4 adds route generation, turn-by-turn guidance, AR, and gamification.

## Privacy

Location is read directly from the browser and is not uploaded by this Phase 1 implementation.
