# ✨ StoryCraft Studio: Your AI-Powered Narrative Universe ✨

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/qnbs/StoryCraft-Studio)

[//]: # (Simulated Badges)
<p align="left">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux" alt="Redux Toolkit">
  <img src="https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google" alt="Google Gemini">
  <img src="https://img.shields.io/badge/Storage-IndexedDB-orange" alt="IndexedDB">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT">
</p>

**StoryCraft Studio is a cutting-edge, AI-enhanced application meticulously engineered for authors, screenwriters, and creators. It transforms the daunting task of writing into a seamless, inspiring journey from a fleeting idea to a polished manuscript.** By integrating the power of Google's Gemini API with an intuitive, offline-first interface, StoryCraft Studio acts as your all-in-one creative co-pilot, empowering you to build, write, and refine your narrative universe without compromise.

![StoryCraft Studio Dashboard](https://storage.googleapis.com/aistudio-hosting/storycraft-assets/dashboard_preview.png)
_[Image: A placeholder showing the sleek, modern dashboard of StoryCraft Studio]_

---

## 📖 Table of Contents

- [Why StoryCraft Studio?](#-why-storycraft-studio)
- [🚀 Features: A Comprehensive Creative Suite](#-features-a-comprehensive-creative-suite)
- [💡 Our Philosophy](#-our-philosophy)
- [🛠️ Technology Deep Dive](#-technology-deep-dive)
- [📂 Project Structure](#-project-structure)
- [Getting Started](#getting-started)
- [🚀 A Creative Workflow](#-a-creative-workflow)
- [🤝 Contributing](#-contributing)
- [Deutsche Version (German)](#-storycraft-studio-deutsch)

---

## 🤔 Why StoryCraft Studio?

In a world of generic text editors and complex writing software, StoryCraft Studio carves its own niche by focusing on a holistic, AI-augmented narrative design process.

-   **✍️ From Macro to Micro:** Most tools focus only on writing. We focus on the *entire* creative lifecycle: from the high-level plot structure and world-building down to the sentence-by-sentence prose.
-   **🧠 Intelligent Partnership:** Our AI is not a ghostwriter. It's a Socratic partner, a tireless brainstormer, and a creative muse, designed to break blocks and expand your own creative potential, not replace it.
-   **🔒 Ultimate Privacy & Ownership:** Your story is your most valuable asset. By leveraging a 100% local, offline-first architecture with IndexedDB, your data never leaves your machine. No clouds, no accounts, no compromises.

---
## 🚀 Features: A Comprehensive Creative Suite

StoryCraft Studio is packed with state-of-the-art tools designed to support every stage of the writing process.

-   **📊 Dynamic Project Dashboard**: Your mission control. Get a dynamic, at-a-glance overview of your project's vitals. Track word counts against your goals, see character and world statistics, and manage your project's title and logline with AI assistance.

-   **✍️ Three-Panel Manuscript Editor**: A dedicated, distraction-free writing environment. The central editor is flanked by a draggable chapter **Navigator** and a project **Inspector**. An advanced overlay provides real-time highlighting for `@character` and `#world` mentions.

-   **📚 Intelligent Story Templates**: Jumpstart your creativity with a library of classic narrative structures (Three-Act, Hero's Journey) and genre templates. **Remix any template** by dragging, editing, or adding sections, then **personalize it with AI** to generate chapter-specific prompts based on your unique story concept.

-   **🤖 Sophisticated Outline Generator**: The ultimate cure for the blank page. Provide a simple concept and let our AI architect a detailed, chapter-by-chapter outline. Utilize advanced controls to specify genre, pacing, and even mandate a stunning plot twist. The result is a fully interactive and editable structure.

-   **👥 Advanced Character Dossiers**: Breathe life into your cast. Use the **AI Profile Generator** to flesh out a compelling backstory, motivation, and personality from a single concept. Then, generate a unique, AI-powered **character portrait** and refine it with textual prompts.

-   **🌍 Expansive World-Building Atlas**: Construct the universe of your story. Define your world's lore, then create interactive timelines and location lists. Let the **AI World Generation** feature build out rich, consistent lore, and create a vivid, atmospheric **ambiance image** to capture your world's mood.

-   **✨ AI Writing Studio**: Your tireless creative partner.
    -   **Continue Writing**: Seamlessly continue from your last sentence.
    -   **Improve & Change Tone**: Select any passage and ask the AI to rewrite it.
    -   **Generate Dialogue**: Create authentic, in-character conversations.
    -   **Brainstorm Ideas**: Get creative plot points for what could happen next.
    -   **Summarize**: Generate a concise synopsis of any section.

-   **🎨 Highly Customizable Workspace**: Tailor your environment to your preferences with **Dark/Light Modes**, adjustable editor fonts, sizes, and spacing, and a tunable AI creativity level.

-   **💾 Robust Offline-First Data Management**: Your work is safe, private, and portable. All data is saved automatically in your browser's **IndexedDB**. A powerful **Snapshot system** automatically and manually saves project versions, allowing you to restore your work to any previous point in time.

-   **📤 Polished Exporting Suite**: Go from draft to document in seconds. Export your project as Markdown, Plain Text, or a professionally formatted **PDF** with a title page. Selectively include content and even generate a one-page **AI Synopsis** of your entire manuscript.

-   **🌐 Full Multi-language Support**: Fully localized UI available in **English** and **German**.

---

## 💡 Our Philosophy

-   **Privacy First**: Your story is yours. All data is stored locally on your machine. We never see it, and there are no accounts or cloud services to worry about.
-   **AI as a Partner, Not a Replacement**: StoryCraft Studio's AI is designed to augment your creativity, not replace it. It's a tool for brainstorming, overcoming blocks, and exploring possibilities, leaving you in full creative control.
-   **Seamless Workflow**: We believe in tools that get out of the way. From outlining to writing to exporting, the experience is designed to be intuitive and frictionless, keeping you in your creative flow.

---

## 🛠️ Technology Deep Dive

StoryCraft Studio is built with a modern, robust technology stack to ensure a fast, reliable, and powerful user experience:

-   **Frontend**: **React 19** with Hooks for a cutting-edge, performant UI.
-   **State Management**: **Redux Toolkit** for predictable and scalable state management, augmented with **Redux-Undo** for a robust undo/redo history.
-   **Styling**: **Tailwind CSS** for a utility-first, highly customizable design system.
-   **AI Integration**: The **Google Gemini API** provides the state-of-the-art generative capabilities that power the studio's creative tools.
-   **Offline Storage**: **IndexedDB** was chosen for its large storage capacity and asynchronous API, enabling a true offline-first architecture that prioritizes user privacy and data ownership. All text and generated images are stored securely on the user's machine.
-   **PDF Generation**: **jsPDF** for client-side generation of professionally formatted PDF documents.

---

## 📂 Project Structure
The codebase is organized logically to promote scalability and maintainability:

-   `components/`: Contains all UI components, further subdivided into `ui/` for generic, reusable elements.
-   `features/`: Redux Toolkit slices, organized by application feature (e.g., `project`, `settings`).
-   `hooks/`: Custom React hooks that encapsulate complex business logic for each view (e.g., `useDashboard.ts`, `useWriterView.ts`).
-   `contexts/`: React Context providers for sharing hook logic and state within specific views.
-   `services/`: Modules for interacting with external APIs or browser storage (e.g., `geminiService.ts`, `dbService.ts`).
-   `locales/`: Contains all internationalization (i18n) JSON files, separated by language and feature.

---

## Getting Started

### Prerequisites

This application runs entirely in the browser. You do not need to install any dependencies. A modern web browser like Chrome, Firefox, or Safari is all that's required.

### API Key Setup

StoryCraft Studio uses the Google Gemini API for its AI-powered features. To use these features, you must have a Google Gemini API key.

The application is configured to securely access your API key from the environment variable `process.env.API_KEY`. Please ensure this variable is set in the environment where you are running the application. **The application will not ask you to enter a key in the UI.**

---

## 🚀 A Creative Workflow

1.  **Conceive**: Start in the **Welcome Portal**. Choose to begin with a structured **Template**, generate a bespoke plot with the **AI Outline Generator**, or start from a **Blank Manuscript**.
2.  **Build**: Navigate to the **Characters** and **World Building** views. Use the AI features to turn simple ideas into detailed profiles and generate inspiring concept art.
3.  **Outline**: Fine-tune your plot in the **Outline Generator**. Drag-and-drop sections, regenerate ideas, and apply it to your manuscript with a single click.
4.  **Write**: Immerse yourself in the three-panel **Manuscript** editor. Use `@mentions` to link your characters and worlds directly in the text. Progress is saved automatically.
5.  **Enhance**: When you hit a wall, visit the **AI Writing Studio**. Let it continue a scene, improve your prose, or brainstorm what happens next.
6.  **Review & Refine**: Use the **Snapshot** system in Settings to save a version of your project before making major revisions. You can restore to any snapshot at any time.
7.  **Publish**: When ready, the **Export** view lets you compile your work into a clean Markdown file, a simple text document, or a formatted PDF, complete with an AI-generated synopsis.

---

## 🤝 Contributing

While this is a showcase project, we welcome feedback and ideas! The best way to contribute is by:

1.  **Reporting Bugs:** If you find something that isn't working as expected, please open an issue.
2.  **Suggesting Features:** Have a great idea for a new tool? Let us know!
3.  **Providing Feedback:** General feedback on the user experience is always valuable.

---

# 📖 StoryCraft Studio (Deutsch)

StoryCraft Studio ist eine hochmoderne, KI-gestützte Anwendung, die sorgfältig für Autoren, Drehbuchautoren und Kreative entwickelt wurde. Sie verwandelt die anspruchsvolle Aufgabe des Schreibens in eine nahtlose, inspirierende Reise von einer flüchtigen Idee bis zum fertigen Manuskript. Durch die Integration der Leistungsfähigkeit der Google Gemini API mit einer intuitiven, offline-fähigen Benutzeroberfläche fungiert StoryCraft Studio als Ihr kreativer All-in-One-Copilot und befähigt Sie, Ihr narratives Universum ohne Kompromisse zu erschaffen, zu schreiben und zu verfeinern.

## 🚀 Funktionen: Eine umfassende Kreativ-Suite

-   **📊 Dynamisches Projekt-Dashboard**: Ihre Kommandozentrale. Erhalten Sie einen dynamischen Überblick über die wichtigsten Daten Ihres Projekts, verfolgen Sie Wortziele und verwalten Sie Titel und Logline mit KI-Unterstützung.
-   **✍️ Drei-Fenster-Manuskript-Editor**: Eine dedizierte, ablenkungsfreie Schreibumgebung mit einem Kapitel-**Navigator** und einem Projekt-**Inspektor**. Ein Overlay bietet Echtzeit-Hervorhebung für `@charakter`- und `#welt`-Erwähnungen.
-   **📚 Intelligente Story-Vorlagen**: Starten Sie mit klassischen Erzählstrukturen. **Passen Sie jede Vorlage an** und **personalisieren Sie sie mit KI**, um kapitelspezifische Anregungen basierend auf Ihrer einzigartigen Story-Idee zu generieren.
-   **🤖 Hochentwickelter Gliederungsgenerator**: Das ultimative Mittel gegen die leere Seite. Lassen Sie die KI eine detaillierte, interaktive Gliederung aus Ihrer Idee erstellen, komplett mit erweiterten Steuerelementen für Tempo und Wendungen.
-   **👥 Detaillierte Charakter-Dossiers**: Hauchen Sie Ihren Figuren Leben ein. Nutzen Sie den **KI-Profilgenerator** für tiefgründige Hintergrundgeschichten und generieren Sie einzigartige **Charakterporträts**.
-   **🌍 Expansiver Weltenbau-Atlas**: Erschaffen Sie das Universum Ihrer Geschichte. Definieren Sie die Geschichte Ihrer Welt, erstellen Sie Zeitachsen und Orte, und generieren Sie atmosphärische **Stimmungsbilder** mit KI.
-   **✨ KI-Schreibstudio**: Ihr unermüdlicher kreativer Partner, der Text fortsetzt, verbessert, Dialoge schreibt, Ideen entwickelt und Abschnitte zusammenfasst.
-   **🎨 Hochgradig anpassbarer Arbeitsbereich**: Passen Sie Ihre Umgebung mit **Hell-/Dunkel-Modi**, anpassbaren Editor-Schriftarten und einer abstimmbaren KI-Kreativität an.
-   **💾 Robuste Offline-First-Datenverwaltung**: Ihre Arbeit ist sicher. Alle Daten werden in **IndexedDB** in Ihrem Browser gespeichert. Ein leistungsstarkes **Snapshot-System** speichert automatisch und manuell Projektversionen, sodass Sie jederzeit zu einem früheren Stand zurückkehren können.
-   **📤 Elegante Export-Suite**: Exportieren Sie Ihr Projekt als Markdown, reinen Text oder professionell formatiertes **PDF**. Fügen Sie selektiv Inhalte hinzu und generieren Sie eine **KI-Synopse** Ihres gesamten Manuskripts.
-   **🌐 Vollständige Mehrsprachigkeit**: Vollständig lokalisierte Benutzeroberfläche in **Englisch** und **Deutsch** verfügbar.

## 💡 Unsere Philosophie

-   **Datenschutz an erster Stelle**: Ihre Geschichte gehört Ihnen. Alle Daten werden lokal auf Ihrem Gerät gespeichert.
-   **KI als Partner, nicht als Ersatz**: Die KI von StoryCraft Studio soll Ihre Kreativität erweitern, nicht ersetzen.
-   **Nahtloser Arbeitsablauf**: Wir glauben an Werkzeuge, die nicht im Weg stehen und Sie im kreativen Fluss halten.

## 🛠️ Modernste Technologie

-   **Frontend**: **React 19** mit Hooks.
-   **Zustandsverwaltung**: **Redux Toolkit** & **Redux-Undo**.
-   **Styling**: **Tailwind CSS**.
-   **KI-Integration**: **Google Gemini API**.
-   **Offline-Speicher**: **IndexedDB** für Datenschutz und Leistung.
-   **PDF-Generierung**: **jsPDF**.

## Erste Schritte

### Voraussetzungen

Ein moderner Webbrowser wie Chrome, Firefox oder Safari ist alles, was Sie benötigen.

### API-Schlüssel-Einrichtung

Sie benötigen einen Google Gemini API-Schlüssel. Die Anwendung greift sicher auf Ihren API-Schlüssel aus der Umgebungsvariable `process.env.API_KEY` zu. **Die Anwendung wird Sie nicht auffordern, einen Schlüssel in der Benutzeroberfläche einzugeben.**

## 🚀 Ein kreativer Arbeitsablauf

1.  **Konzipieren**: Starten Sie im **Willkommensportal**. Wählen Sie eine **Vorlage**, den **KI-Gliederungsgenerator** oder ein **leeres Manuskript**.
2.  **Erschaffen**: Erstellen Sie Ihre **Charaktere** und **Welten** mit KI-Unterstützung, um Ideen schnell in detaillierte Profile und Konzeptkunst umzuwandeln.
3.  **Gliedern**: Verfeinern Sie Ihre Handlung im **Gliederungsgenerator** und wenden Sie sie mit einem Klick auf Ihr Manuskript an.
4.  **Schreiben**: Tauchen Sie in den **Manuskript**-Editor ein. Verwenden Sie `@Erwähnungen`, um Ihre Inhalte zu verknüpfen.
5.  **Verbessern**: Nutzen Sie das **KI-Schreibstudio**, um Schreibblockaden zu überwinden.
6.  **Überprüfen & Sichern**: Verwenden Sie das **Snapshot**-System in den Einstellungen, um Versionen Ihres Projekts vor größeren Änderungen zu speichern.
7.  **Veröffentlichen**: Exportieren Sie Ihr Werk als Markdown, Textdatei oder formatiertes **PDF**, komplett mit einer KI-generierten Synopse.
