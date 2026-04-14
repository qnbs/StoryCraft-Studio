# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Hardcoded `'en'` language in `useConsistencyCheckerView` and `useCriticView` hooks now dynamically reads from user settings
- Missing `src-tauri/target/` entry in `.gitignore`
- Removed duplicate empty `.prettierrc` file (`.prettierrc.json` is authoritative)
- Fixed 50+ Markdown lint errors in `README.md` (MD022, MD031, MD032, MD040, MD060)

### Added

- `CHANGELOG.md` following Keep a Changelog standard
- `.github/copilot-instructions.md` with project-specific coding guidelines
- `AUDIT.md` with comprehensive codebase audit findings and recommendations

## [1.0.0] - 2025-01-01

### Added

#### Core Application

- React 19 + TypeScript 5 (strict mode) single-page application
- Vite 6 build tooling with ES2022 target and manual chunk splitting
- Redux Toolkit 2.x state management with Redux-Undo (100-step history)
- Feature-sliced architecture (`project`, `settings`, `status`, `writer`, `versionControl`)
- Listener middleware for debounced auto-save to IndexedDB (1000ms)

#### Writing & Editing

- Three-panel manuscript editor with chapter navigator and project inspector
- Real-time `@character` and `#world` mention overlay with linking
- Scene board — kanban-style drag-and-drop visual story planning (DnD Kit)
- Voice dictation via Web Speech API with multi-language support
- Command palette (Ctrl+K / ⌘K) for keyboard-first navigation

#### AI Integration (Google Gemini API)

- 10 specialized AI writing tools: Continue, Improve, Change Tone, Dialogue, Brainstorm, Synopsis, Grammar & Style, Critic, Plot-Hole Detector, Consistency Checker
- AI outline generator with genre, pacing, and plot twist controls
- AI character profile generator with backstory, motivations, and personality traits
- AI character portrait generation in multiple styles (realistic, anime, cartoon, comic)
- AI world-building content generation with atmospheric ambiance images
- AI logline suggestions for project dashboard
- RAG-based consistency checker cross-referencing manuscript against character/world data
- Streaming AI responses with chunk-by-chunk rendering
- Multi-provider architecture (Gemini primary, OpenAI and Ollama support)

#### Story Structure & Planning

- Intelligent story template library (Three-Act, Hero's Journey, Save the Cat!, Fichtean Curve)
- Genre templates (Fantasy, Thriller, Horror, Romance, Space Opera, Dystopian)
- Community template system with GitHub-hosted template repository
- Interactive character relationship graph (force-directed visualization)

#### Data Management

- IndexedDB storage with LZ-String compression for payloads > 10KB
- AES-256-GCM encryption for API keys via Web Crypto API
- Version control with branch management and snapshot system
- Project import/export as JSON with image handling
- Auto-save with configurable debounce interval

#### Export Suite

- Markdown (`.md`) export
- Plain text (`.txt`) export
- PDF export with title page, configurable font and spacing (jsPDF)
- DOCX export (docx + jszip)
- EPUB 3.0 client-side generation (epubApiService)
- AI-generated synopsis for export

#### Collaboration

- P2P real-time editing via Yjs + WebRTC (no backend required)
- Awareness system for presence tracking
- Shared Y.Text documents for concurrent editing

#### Progressive Web App (PWA) v3.0

- Service Worker with versioned caches and smart caching strategies
- Cache-First for static assets, Stale-While-Revalidate for dynamic content
- NetworkOnly for AI API calls (never cached)
- Offline fallback page with branded UI
- Installable on desktop and mobile (iOS & Android)
- App shortcuts for quick access from home screen
- Background sync and periodic update support
- Web App Manifest v3 with share target and protocol handlers

#### Internationalization (i18n)

- 5 languages: German (complete), English (complete), French, Spanish, Italian (in progress)
- 14 modular translation files per language
- Custom React Context-based i18n system
- Language persistence via localStorage
- Document `lang` attribute synchronization

#### Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML with comprehensive ARIA attributes
- Focus trapping in modals and drawers
- Keyboard navigation throughout
- Screen reader support with sr-only labels
- High contrast, reduced motion, and color-blind mode settings

#### Desktop Application

- Tauri 2 wrapper for native desktop distribution
- File system access via Tauri plugins
- Dialog and shell integration

#### Developer Experience

- ESLint 9 flat config with TypeScript, React, React Hooks, and jsx-a11y plugins
- Prettier formatting with pre-commit hooks (Husky + lint-staged)
- Vitest unit testing with jsdom environment
- Playwright E2E testing (Chromium + Firefox)
- Storybook component development environment
- GitHub Actions CI/CD pipeline (lint → typecheck → test → build → deploy)
- Automatic GitHub Pages deployment on push to main

### Security

- No hardcoded API keys — all keys encrypted at rest in IndexedDB
- Content Security Policy in index.html
- Local-first architecture — no data leaves the browser
- HTTPS-only external API communication
- Device-scoped encryption key derivation

[Unreleased]: https://github.com/qnbs/StoryCraft-Studio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qnbs/StoryCraft-Studio/releases/tag/v1.0.0
