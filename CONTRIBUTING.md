# Contributing to StoryCraft Studio

Thank you for your interest in contributing to StoryCraft Studio — an AI-powered creative writing studio built with React, Redux Toolkit, and the Gemini API.

## Table of Contents

- [Development Setup](#development-setup)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Accessibility](#accessibility)
- [Security Guidelines](#security-guidelines)
- [Known Technical Debt](#known-technical-debt)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 20 (LTS recommended)
- **npm** ≥ 10
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone https://github.com/qnbs/StoryCraft-Studio.git
cd StoryCraft-Studio
npm install --legacy-peer-deps
```

### Environment

The app uses **no build-time secrets**. The Gemini API key is entered via the Settings UI and stored encrypted in IndexedDB.  
See [`.env.example`](.env.example) for details.

### Running the dev server

```bash
npm run dev          # Vite dev server on http://localhost:3000
npm run dev:tauri    # Tauri desktop app (requires Rust)
```

---

## Tech Stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Frontend  | React 19, TypeScript (strict + exactOptionalPropertyTypes) |
| State     | Redux Toolkit 2.x + redux-undo                             |
| Styling   | Tailwind CSS 4 via CDN                                     |
| AI        | Google Gemini API (`@google/genai`)                        |
| Storage   | IndexedDB (browser) / File system (Tauri)                  |
| Build     | Vite 6 + vite-plugin-pwa                                   |
| Tests     | Vitest + React Testing Library + Playwright                |
| Desktop   | Tauri 2 (optional)                                         |
| Storybook | Storybook 10 with `@storybook/react-vite`                  |

---

## Project Structure

```
StoryCraft-Studio/
├── app/              # Redux store, hooks, listenerMiddleware
├── components/       # React UI components
│   └── ui/           # Primitive design-system components (Button, Card, Modal…)
├── contexts/         # React contexts for each view
├── features/         # Redux slices (project, settings, writer, status)
├── hooks/            # Custom React hooks per view + shared hooks
├── locales/          # i18n translations (de, en, es, fr, it)
├── services/         # API services (Gemini, storage, EPUB, TTS…)
├── stories/          # Storybook stories for UI components
├── tests/
│   ├── unit/         # Vitest unit tests
│   ├── e2e/          # Playwright end-to-end tests
│   └── setup.ts      # Test setup (jsdom, mocks)
├── types/            # Global TypeScript types
└── .github/
    └── workflows/
        ├── ci.yml    # Full CI pipeline (lint → test → build → deploy)
        └── deploy.yml # Legacy deploy-only workflow
```

---

## Development Workflow

### Git Branching

- `main` — protected, deploys automatically to GitHub Pages
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/issue-description`

### Pre-commit Hooks

Husky + lint-staged runs automatically on commit:

- ESLint (`--fix`) on `.ts`/`.tsx` files
- Prettier on `.ts`/`.tsx`/`.json`/`.md` files

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add X feature
fix: resolve Y bug
docs: update README
refactor: restructure Z module
test: add unit tests for W
chore: update dependencies
```

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test         # Run in watch mode
npm run test:run     # Run once (CI mode)
npm run test:coverage  # With coverage report
```

Tests live in `tests/unit/`. Each UI component and core hook should have a test file.

### E2E Tests (Playwright)

```bash
npm run dev          # Start dev server first
npm run test:e2e     # Run Playwright tests
npm run test:e2e:ui  # Interactive Playwright UI
```

Tests live in `tests/e2e/`. Playwright tests verify core user flows:

- Navigation between views
- Export functionality
- Keyboard accessibility
- Mobile viewport behavior

### Storybook

```bash
npm run storybook          # Start Storybook dev server on :6006
npm run build-storybook    # Build static Storybook
```

Stories live in `stories/`. All primitive UI components (`components/ui/`) should have a story.

---

## Code Quality

### TypeScript

- `strict: true` is enforced
- `exactOptionalPropertyTypes: true` is enforced — do not assign `undefined` to optional properties explicitly; omit the property instead
- When adding new code, avoid `any` — use proper types or `unknown`
- Run: `npm run typecheck`

### ESLint

ESLint 9 flat config with:

- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` (rules-of-hooks + exhaustive-deps)
- `eslint-plugin-jsx-a11y` (accessibility rules)

Run: `npm run lint`

### Rule: No API Keys in Logs

**Never** log the Gemini API key or any secrets to the console. The `geminiService.ts` handles key storage securely via IndexedDB with crypto.subtle encryption.

---

## Accessibility

The project follows WCAG 2.1 AA guidelines:

- All interactive elements have `aria-label` or accessible text
- Dialog/Modal components use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- AI responses use `aria-live="polite"` regions for screen-reader announcements
- Scene Board drag-and-drop uses `role="list"` with accessible instructions
- Keyboard navigation works throughout (Tab, Enter, Escape, Arrow keys)

When adding new components:

- Use semantic HTML elements where possible
- Provide `aria-label` for icon-only buttons
- Test with a screen reader (NVDA/VoiceOver) before submitting

---

## Security Guidelines

- **CSP**: `index.html` contains a `Content-Security-Policy` meta tag restricting resource origins
- **API keys**: Never hardcode API keys; always use the encrypted IndexedDB storage
- **AbortController**: All Gemini API calls support cancellation via `AbortSignal`
- **Rate limiting**: `geminiService.ts` handles 429 errors with exponential backoff
- **Input sanitization**: User input displayed in HTML contexts uses `esc()` helpers

---

## Known Technical Debt

The following TypeScript issues are tracked and need resolution:

1. **`services/dbService.ts`**: `IndexedDBService` partially implements `StorageBackend` — methods like `loadProject`/`listProjects` need proper implementation
2. **`services/fileSystemService.ts`**: References `StoryProject.author/description` which don't exist in the current `StoryProject` interface
3. **`components/AdvancedImportExport.tsx`**: DOCX export uses `fileSystemService` (Tauri-only) instead of a browser-compatible approach
4. **`app/listenerMiddleware.ts`**: Complex Redux type issues with `redux-undo`'s `StateWithHistory`
5. **`features/project/projectSlice.ts`**: `GeminiSchema` type mismatches in async thunks — needs schema type refinement
6. **Various components**: `errorMessage` property referenced but not defined in context types

Contributors tackling these issues should create a dedicated PR per module.

---

## Pull Request Process

1. Fork the repository and create a feature branch
2. Write or update tests for your changes
3. Run the full test suite: `npm run test:run`
4. Ensure ESLint passes: `npm run lint`
5. Ensure the build succeeds: `npm run build`
6. Submit a PR against `main` with a clear description
7. Request review from at least one maintainer

The CI pipeline will automatically run lint, typecheck, tests, and build on every PR.

---

## License

[MIT](LICENSE)
