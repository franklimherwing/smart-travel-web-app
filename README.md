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


## v0.4.0 — AI Guide & Natural Voice

The local development app now supports:
- Natural AI-generated tour narration through the OpenAI Audio Speech API
- Conversational Ask AI guide through the OpenAI Responses API
- Search across the current demo destination
- 30-minute four-stop tour generation
- Walking directions through Google Maps
- Automatic arrival narration when Audio Mode is enabled
- Rome, Guatemala City, and Zacapa demo destinations

### Enable AI voice and Ask AI locally

1. Create an OpenAI API key at https://platform.openai.com/api-keys
2. In the project folder, create a file named `.env.local`
3. Add:

```
OPENAI_API_KEY=your_key_here
```

4. Never commit or share `.env.local`. It is ignored by Git.
5. Restart the development server after adding or changing the key:

```bash
npm run dev
```

The API key stays server-side. The browser calls the local `/api/tts` and `/api/guide` endpoints instead of receiving the key.
