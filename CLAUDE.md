# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Partners App is a React Native (Expo) multi-platform app (iOS, Android, Web) built with TypeScript. It's a commercial sales management tool featuring AI-powered chat assistant "Lola", CRM with Kanban boards, product catalogs, training modules, and commission tracking. The project language is Brazilian Portuguese.

## Development Commands

### Frontend (Expo)
```bash
npx expo start          # Start dev server
npx expo start --web    # Web dev server (webpack)
npx expo start --android
npx expo start --ios
```

### Backend (AI API Service)
```bash
cd src/Back-end/commercial-ai-api
npm run dev             # ts-node-dev with auto-reload
npm run build           # TypeScript compile to dist/
npm run start           # Run compiled JS
npm run lint            # ESLint
```
The backend requires a `.env` file with `OPENAI_API_KEY` and `EVOLUTION_API_KEY`.

## Architecture

### Provider Hierarchy (App.tsx)
```
KeymanProvider → ModalProvider → MiniPlayerProvider → AppNavigator + ModalRoot + GlobalMiniPlayer
```
The Commercial module adds its own nested contexts: `CommercialContext`, `AIAssistantContext`, `KanbanContext`.

### Navigation
Stack navigator with 40+ routes in `src/navigation/AppNavigator.tsx`. A global `navigationRef` is exported for navigation outside the component tree. Route types and screen name constants live in `src/types/navigation.ts`.

### Screen Organization
Screens are numbered by feature module under `src/screens/`:
- `0.SplashScreen` → `1.Login` → `2.Register` → `3.Change Password`
- `4.Products` – Product catalog and presentations
- `7.Keymans` – Key contact management
- `8.Customers` – Customer directory
- `9.Agenda` – Calendar
- `10.Vendas` – Sales and discounts
- `11.Comissões` – Commissions
- `12.FluxoDePagamento` – Payment flow (lazy-loaded routes)
- `13.Commitments` – Daily commitments
- `14.Training` – Training content with video player
- `15.Commercial` – CRM module with AI chat (Lola), Kanban board, lead management

### Commercial Module (15.Commercial) – Active Development
The main active feature area. Entry point: `00.CommercialScreen.tsx`. Contains its own `contexts/`, `components/`, `services/`, `hooks/`, `types/`, and `utils/` subdirectories. Key subsystems:
- **Kanban** – Drag-and-drop lead board (`components/kanban/`)
- **Chat** – Lead messaging with camera/gallery integration (`components/Chat/`)
- **Lola AI** – Avatar assistant with GPT-4 suggestions, TTS, Whisper transcription, lip-sync (`components/Lola/`, `components/ai/`, `components/AIAvatar/`)
- **Dashboard** – Sales metrics (`components/dashboard/`)

### Backend AI Service (`src/Back-end/commercial-ai-api/`)
Standalone Express API (port 3001) providing:
- Chat completions with per-lead context injection
- Text-to-Speech (OpenAI TTS, MP3 output)
- Audio transcription (Whisper)
- AI suggestion generation
- Lip-sync data generation
- Evolution API webhooks (WhatsApp integration)

### Audio Player
Dual platform implementation in `src/context/AudioPlayerContext.tsx`: Web uses `HTMLAudioElement`, native uses `expo-av`. Supports playlist, auto-next, repeat modes, playback rate control, and a UI ticker for smooth progress.

### State Management
Context API exclusively (no Redux). Global contexts in `src/context/`: `KeymanContext`, `ModalContext`, `MiniPlayerContext`, `AudioPlayerContext`. Feature-specific contexts are colocated within their screen module directories.

## Theme & Styling

Design tokens defined in `src/constants/theme.ts`:
- **Colors**: primary `#021632`, accent `#1777CF`, background `#FCFCFC`
- **Fonts**: Inter (primary), DM Sans, Comfortaa (loaded via `@expo-google-fonts`)
- **Spacing scale**: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

## Key Conventions

- Console logging uses `[ModuleName]` prefixes (e.g., `[APP]`, `[AudioPlayer]`)
- File naming in screens uses numbered prefixes for ordering (e.g., `01.01.KeymansHomeScreen.tsx`)
- Components use `StyleSheet.create()` for styles, defined at the bottom of each file
- Platform-specific code uses `Platform.OS === 'web'` checks
- AsyncStorage is used for local persistence (`src/utils/storage.ts`, `src/utils/keymanStorage.ts`)
