# Graph Report - StoryCraft-Studio  (2026-06-17)

## Corpus Check
- 1101 files · ~1,255,255 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4875 nodes · 8643 edges · 85 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 2090 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 140|Community 140]]
- [[_COMMUNITY_Community 145|Community 145]]
- [[_COMMUNITY_Community 177|Community 177]]
- [[_COMMUNITY_Community 223|Community 223]]
- [[_COMMUNITY_Community 263|Community 263]]
- [[_COMMUNITY_Community 268|Community 268]]
- [[_COMMUNITY_Community 716|Community 716]]
- [[_COMMUNITY_Community 717|Community 717]]
- [[_COMMUNITY_Community 718|Community 718]]
- [[_COMMUNITY_Community 719|Community 719]]
- [[_COMMUNITY_Community 720|Community 720]]
- [[_COMMUNITY_Community 721|Community 721]]
- [[_COMMUNITY_Community 722|Community 722]]
- [[_COMMUNITY_Community 723|Community 723]]
- [[_COMMUNITY_Community 724|Community 724]]
- [[_COMMUNITY_Community 725|Community 725]]
- [[_COMMUNITY_Community 726|Community 726]]
- [[_COMMUNITY_Community 727|Community 727]]
- [[_COMMUNITY_Community 728|Community 728]]
- [[_COMMUNITY_Community 729|Community 729]]
- [[_COMMUNITY_Community 730|Community 730]]
- [[_COMMUNITY_Community 731|Community 731]]
- [[_COMMUNITY_Community 732|Community 732]]
- [[_COMMUNITY_Community 733|Community 733]]
- [[_COMMUNITY_Community 734|Community 734]]
- [[_COMMUNITY_Community 735|Community 735]]
- [[_COMMUNITY_Community 736|Community 736]]
- [[_COMMUNITY_Community 737|Community 737]]
- [[_COMMUNITY_Community 738|Community 738]]
- [[_COMMUNITY_Community 739|Community 739]]
- [[_COMMUNITY_Community 740|Community 740]]

## God Nodes (most connected - your core abstractions)
1. `mt()` - 104 edges
2. `Bv` - 74 edges
3. `fn()` - 58 edges
4. `t()` - 47 edges
5. `Ze()` - 43 edges
6. `wx()` - 41 edges
7. `xA` - 40 edges
8. `CloudSyncBackend` - 39 edges
9. `StorageManager` - 36 edges
10. `tA()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `readMode()` --calls--> `getItem()`  [INFERRED]
  components/copilot/CopilotPanel.tsx → features/featureFlags/featureFlagsStorage.ts
- `writeMode()` --calls--> `setItem()`  [INFERRED]
  components/copilot/CopilotPanel.tsx → features/featureFlags/featureFlagsStorage.ts
- `clearBenchmarkResults()` --calls--> `removeItem()`  [INFERRED]
  services/ai/benchmarkService.ts → features/featureFlags/featureFlagsStorage.ts
- `Ja()` --calls--> `matches()`  [INFERRED]
  e2e-deep-report/trace/assets/codeMirrorModule-Ds_H_9Yq.js → tests/unit/ai/localModelStorageService.test.ts
- `handleWebllmDownload()` --calls--> `generateLocalText()`  [INFERRED]
  components/settings/AiSections.tsx → services/localAiFacade.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (322): md(), _0, _2(), A0, a2(), aA(), ab(), ac() (+314 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (170): af(), ef(), ff(), Ja(), lf(), mt(), nf(), of() (+162 more)

### Community 2 - "Community 2"
Cohesion: 0.01
Nodes (128): recordLatency(), AiInferenceCacheService, hashKey(), _clearPendingRequestsForTest(), binderDepth(), collectSubtreeIds(), createCancellationToken(), CloudSyncClient (+120 more)

### Community 3 - "Community 3"
Cohesion: 0.01
Nodes (79): handleCopyForNotion(), handleDocxImport(), handleExport(), handlePasteImport(), loadAgent(), handleBuildLocalRag(), handleWebllmDownload(), isCustomOllamaModel() (+71 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (81): accessibilityPresetDefaults(), normalizeAccessibilitySettings(), applyPreset(), handleRemoveKey(), handleSaveKey(), handleTestConnection(), CloudSyncBackend, decryptCloudPayload() (+73 more)

### Community 5 - "Community 5"
Cohesion: 0.02
Nodes (64): pipeline(), isEcoMode(), EcoModeService, FeedbackService, handleEcoToggle(), routeTask(), addDebouncedListener(), getLocalFirstHandle() (+56 more)

### Community 6 - "Community 6"
Cohesion: 0.03
Nodes (23): a_(), bh, Dh(), eA(), el(), GE(), Gh(), lv() (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (99): getActiveAiMode(), getLocalFallbackModel(), getOpenRouterFallbackProvider(), getOpenRouterModel(), isCloudOnlyMode(), isOffline(), notifyLocalModelsReady(), shouldRouteLocally() (+91 more)

### Community 8 - "Community 8"
Cohesion: 0.01
Nodes (78): categoryFromMessage(), categoryFromStatus(), classificationFor(), classifyAiError(), extractStatus(), getAiErrorMessage(), isOffline(), clampRetryAfter() (+70 more)

### Community 9 - "Community 9"
Cohesion: 0.03
Nodes (56): FsAssetStore, glossaryTranslate(), loadCheckpoint(), loadGlossary(), main(), maskPlaceholders(), parseArgs(), restorePlaceholders() (+48 more)

### Community 10 - "Community 10"
Cohesion: 0.02
Nodes (58): AnalyticsBootstrap(), App(), ViewLoader(), useCommandExecutor(), CopilotLauncher(), Header(), useAppDispatch(), useAppSelectorShallow() (+50 more)

### Community 11 - "Community 11"
Cohesion: 0.02
Nodes (67): collect(), buildPaletteCommandModels(), collectAllDefinitions(), resolveTitle(), runCommandById(), assertCommunityTemplates(), loadJson(), main() (+59 more)

### Community 12 - "Community 12"
Cohesion: 0.03
Nodes (55): AdaptiveAiEngine, _clearLatencyHistory(), estimateLatency(), getTaskConfig(), selectModelForBackend(), start(), clearBenchmarkResults(), getLastBenchmarkResults() (+47 more)

### Community 13 - "Community 13"
Cohesion: 0.02
Nodes (63): item(), getLocalUser(), getRandomColor(), handleKeyDown(), sanitizeRoomInput(), stripControlChars(), deleteIdb(), formatStorageError() (+55 more)

### Community 14 - "Community 14"
Cohesion: 0.03
Nodes (62): countWords(), enrichProjectIndex(), extractCharacterNames(), getDb(), indexProject(), listIndexedProjects(), removeProjectIndex(), semanticSearchProjects() (+54 more)

### Community 15 - "Community 15"
Cohesion: 0.03
Nodes (36): AudioNavigator, makeProjectData(), makeContext(), makeLargeContext(), makeSection(), smallProject(), buildCharacter(), buildLargeManuscript() (+28 more)

### Community 16 - "Community 16"
Cohesion: 0.04
Nodes (35): assertNoSeriousViolations(), navigateToCollaborationSettings(), connectSrcTokens(), group1(), tauriCsp(), webCsp(), clickNavItem(), ensureBlankProject() (+27 more)

### Community 17 - "Community 17"
Cohesion: 0.05
Nodes (22): CollabEncryptionRequiredError, CollaborationService, resolveWebRtcSignalingUrls(), MockDoc, MockWebrtcProvider, createAttentionPipeline(), createComputePipeline(), createKvCachePipeline() (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (16): getFocusable(), onKeyDown(), onPointerUp(), handleKeyDown(), k2, n2(), getFocusable(), handleEsc() (+8 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (38): AiModeIndicator(), check(), green(), grep(), hasRuntimeConsumption(), read(), red(), createOllamaModelFromAdapter() (+30 more)

### Community 20 - "Community 20"
Cohesion: 0.1
Nodes (10): bb(), d_, f_, h_, r0(), u_, Ui, Wv() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (23): applyTextEdit(), applyReviewEditsToSection(), containsDisallowedControlChar(), isValidRange(), nearestFreeOccurrence(), planAcceptedManuscriptEdits(), validateProposedText(), mockT() (+15 more)

### Community 22 - "Community 22"
Cohesion: 0.06
Nodes (25): pipeline(), applyPreset(), async(), close(), isSidebar(), onKey(), onPointerDown(), readMode() (+17 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (12): createBrowserProForgeCapability(), runCopilotDiagnostic(), buildNormManuscriptExport(), paginateNormLines(), stripLightMarkdown(), wrapParagraphToLines(), wrapPlainTextToNormLines(), createProForgeCapabilityLayer() (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (15): bc(), cE(), fr(), Go(), jc(), jS(), ri(), uS() (+7 more)

### Community 25 - "Community 25"
Cohesion: 0.1
Nodes (1): StorageManager

### Community 26 - "Community 26"
Cohesion: 0.23
Nodes (3): LS, xn(), aa

### Community 27 - "Community 27"
Cohesion: 0.14
Nodes (21): handleToggle(), handleDelete(), handleFileChange(), activateAdapter(), clearDatasetEntries(), deactivateAdapter(), deleteAdapter(), exportAdapter() (+13 more)

### Community 28 - "Community 28"
Cohesion: 0.16
Nodes (14): buildExcerpt(), extractCharacters(), extractManuscriptSections(), searchAcrossProjectIndex(), searchAcrossProjects(), normalizeSearch(), scoreAgainstQuery(), subsequenceScore() (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.35
Nodes (2): cc, Gb()

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (1): PriorityTaskQueue

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (5): MockAudioContext, MockBufferSource, MockGain, NonEndingSource, TrackingContext

### Community 36 - "Community 36"
Cohesion: 0.53
Nodes (4): buildWebNNExecutionProviders(), detectWebNN(), isDirectMLAvailable(), isDirectMLHeuristic()

### Community 37 - "Community 37"
Cohesion: 0.7
Nodes (4): check_cuda_and_vram(), check_package(), check_python_version(), main()

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (1): O0

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (3): createStorageMock(), setupStorage(), SpeechSynthesisUtteranceMock

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (4): Room, SignalingConn, WebrtcConn, WebrtcProvider

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (2): useDashboardContext(), DashboardHeader()

### Community 48 - "Community 48"
Cohesion: 0.6
Nodes (4): applyFormula(), computeReadabilitySnapshot(), estimateSyllables(), getSyllablePattern()

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (2): sanitizeSpeechTranscript(), stripControlChars()

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): rc

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (2): makeConfig(), startPipelinePayload()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (2): make(), noop()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (2): defaultProject(), setProjectData()

### Community 64 - "Community 64"
Cohesion: 0.83
Nodes (3): makeChars(), makeProject(), makeWorlds()

### Community 65 - "Community 65"
Cohesion: 0.83
Nodes (3): emptyChars(), emptyWorlds(), makeProject()

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (3): AsyncDuckDB, AsyncDuckDBConnection, ConsoleLogger

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (2): getQuestionsForArchetype(), getTemplateForArchetype()

### Community 76 - "Community 76"
Cohesion: 0.67
Nodes (1): makeSection()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (1): MockGoogleGenAI

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (1): makeDeps()

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (2): fireSwipe(), makePointerEvent()

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (1): TaskError

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): MockIntersectionObserver

### Community 140 - "Community 140"
Cohesion: 1.0
Nodes (1): MockWorker

### Community 145 - "Community 145"
Cohesion: 1.0
Nodes (1): MockBroadcastChannel

### Community 177 - "Community 177"
Cohesion: 1.0
Nodes (1): MockIntersectionObserver

### Community 223 - "Community 223"
Cohesion: 1.0
Nodes (1): MockWorker

### Community 263 - "Community 263"
Cohesion: 1.0
Nodes (1): FileSystemService

### Community 268 - "Community 268"
Cohesion: 1.0
Nodes (1): IndexedDBService

### Community 716 - "Community 716"
Cohesion: 1.0
Nodes (1): Remove ANSI escape codes from text.

### Community 717 - "Community 717"
Cohesion: 1.0
Nodes (1): Remove timestamp strings from text.

### Community 718 - "Community 718"
Cohesion: 1.0
Nodes (1): Replace long base64 strings with placeholder.

### Community 719 - "Community 719"
Cohesion: 1.0
Nodes (1): Remove NPM/pnpm warning lines.

### Community 720 - "Community 720"
Cohesion: 1.0
Nodes (1): Remove redundant success messages.

### Community 721 - "Community 721"
Cohesion: 1.0
Nodes (1): Apply all preprocessing steps to reduce token payload.

### Community 722 - "Community 722"
Cohesion: 1.0
Nodes (1): Extract only error-related sections from log.

### Community 723 - "Community 723"
Cohesion: 1.0
Nodes (1): Pydantic models for CI Analyzer structured output. QNBS-v3: These models enforce

### Community 724 - "Community 724"
Cohesion: 1.0
Nodes (1): Structured CI error for VS Code problem matcher integration.

### Community 725 - "Community 725"
Cohesion: 1.0
Nodes (1): Vitest JSON test result structure.

### Community 726 - "Community 726"
Cohesion: 1.0
Nodes (1): Full Vitest JSON report structure.

### Community 727 - "Community 727"
Cohesion: 1.0
Nodes (1): Stryker per-file mutation report.

### Community 728 - "Community 728"
Cohesion: 1.0
Nodes (1): Full Stryker JSON report structure.

### Community 729 - "Community 729"
Cohesion: 1.0
Nodes (1): Initialize OpenRouter client for Poolside Laguna model.

### Community 730 - "Community 730"
Cohesion: 1.0
Nodes (1): Analyze Vitest JSON report and raw logs for errors.

### Community 731 - "Community 731"
Cohesion: 1.0
Nodes (1): Analyze Stryker JSON report for surviving mutants.

### Community 732 - "Community 732"
Cohesion: 1.0
Nodes (1): Send preprocessed errors to LLM for analysis.

### Community 733 - "Community 733"
Cohesion: 1.0
Nodes (1): Format errors for VS Code problem matcher.

### Community 734 - "Community 734"
Cohesion: 1.0
Nodes (1): Main entry point for CI analyzer.

### Community 735 - "Community 735"
Cohesion: 1.0
Nodes (1): Execute gh CLI command and return parsed JSON output.

### Community 736 - "Community 736"
Cohesion: 1.0
Nodes (1): Get the ID of the most recent failed CI run.

### Community 737 - "Community 737"
Cohesion: 1.0
Nodes (1): Download a specific artifact from a workflow run.

### Community 738 - "Community 738"
Cohesion: 1.0
Nodes (1): Get raw logs from a failed workflow run.

### Community 739 - "Community 739"
Cohesion: 1.0
Nodes (1): Parse Vitest JSON report for failing tests.

### Community 740 - "Community 740"
Cohesion: 1.0
Nodes (1): Parse Stryker JSON report for surviving mutants.

## Knowledge Gaps
- **53 isolated node(s):** `Emits JSON progress events on each training log step.`, `qb`, `v2`, `MockIntersectionObserver`, `MockWorker` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 25`** (37 nodes): `.initialize()`, `storageService.ts`, `StorageManager`, `.clearApiKey()`, `.clearGeminiApiKey()`, `.constructor()`, `.deleteAllBinderAssetsForProject()`, `.deleteBinderAsset()`, `.deleteImage()`, `.deleteProject()`, `.deleteRagVectors()`, `.deleteSnapshot()`, `.deleteStoryCodex()`, `.getApiKey()`, `.getBackend()`, `.getBinderAsset()`, `.getGeminiApiKey()`, `.getImage()`, `.getRagVectors()`, `.getSnapshotData()`, `.getStoryCodex()`, `.hasSavedData()`, `.initializeBackend()`, `.listBinderAssetIds()`, `.listProjects()`, `.listSnapshots()`, `.loadProject()`, `.loadSettings()`, `.saveApiKey()`, `.saveBinderAsset()`, `.saveGeminiApiKey()`, `.saveImage()`, `.saveProject()`, `.saveRagVectors()`, `.saveSettings()`, `.saveSnapshot()`, `.saveStoryCodex()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (17 nodes): `cc`, `._applyAttribute()`, `._assert()`, `.constructor()`, `._eof()`, `._isWhitespace()`, `._next()`, `.parse()`, `._peek()`, `._readAttributes()`, `._readIdentifier()`, `._readRegex()`, `._readString()`, `._readStringOrRegex()`, `._skipWhitespace()`, `._throwError()`, `Gb()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (10 nodes): `taskQueue.ts`, `PriorityTaskQueue`, `.constructor()`, `.dequeue()`, `.effectivePriority()`, `.enqueue()`, `.peek()`, `.promoteStarvedTasks()`, `.stats()`, `.totalDepth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `O0`, `.constructor()`, `.toJSON()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (5 nodes): `DashboardHeader.tsx`, `DashboardContext.ts`, `useDashboardContext()`, `Chip()`, `DashboardHeader()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `useSpeechRecognition.ts`, `sanitizeSpeechTranscript()`, `stripControlChars()`, `useSpeechRecognition()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `rc`, `.constructor()`, `.toSource()`, `.toString()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (4 nodes): `makeConfig()`, `makeReviewItem()`, `startPipelinePayload()`, `proForgeSlice.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `make()`, `noop()`, `aiRetry.test.ts`, `aiRetry.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `useDashboard.test.ts`, `defaultProject()`, `defaultSection()`, `setProjectData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (4 nodes): `getAllTemplates()`, `getQuestionsForArchetype()`, `getTemplateForArchetype()`, `characterInterviewTemplates.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `makeSection()`, `plotBoardService.test.ts`, `plotBoardService.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `makeStream()`, `MockGoogleGenAI`, `geminiService.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `makeDeps()`, `aiSuggestions.test.ts`, `aiSuggestions.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (3 nodes): `useSwipeGesture.test.ts`, `fireSwipe()`, `makePointerEvent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (3 nodes): `types.ts`, `TaskError`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `MockIntersectionObserver`, `BookPreviewView.test.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 140`** (2 nodes): `MockWorker`, `duckdbClient.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (2 nodes): `MockBroadcastChannel`, `tabLeaderElection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 177`** (2 nodes): `useBookPreviewView.test.ts`, `MockIntersectionObserver`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 223`** (2 nodes): `workerPool.test.ts`, `MockWorker`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 263`** (2 nodes): `FileSystemService`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 268`** (2 nodes): `IndexedDBService`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 716`** (1 nodes): `Remove ANSI escape codes from text.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 717`** (1 nodes): `Remove timestamp strings from text.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 718`** (1 nodes): `Replace long base64 strings with placeholder.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 719`** (1 nodes): `Remove NPM/pnpm warning lines.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 720`** (1 nodes): `Remove redundant success messages.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 721`** (1 nodes): `Apply all preprocessing steps to reduce token payload.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 722`** (1 nodes): `Extract only error-related sections from log.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 723`** (1 nodes): `Pydantic models for CI Analyzer structured output. QNBS-v3: These models enforce`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 724`** (1 nodes): `Structured CI error for VS Code problem matcher integration.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 725`** (1 nodes): `Vitest JSON test result structure.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 726`** (1 nodes): `Full Vitest JSON report structure.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 727`** (1 nodes): `Stryker per-file mutation report.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 728`** (1 nodes): `Full Stryker JSON report structure.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 729`** (1 nodes): `Initialize OpenRouter client for Poolside Laguna model.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 730`** (1 nodes): `Analyze Vitest JSON report and raw logs for errors.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 731`** (1 nodes): `Analyze Stryker JSON report for surviving mutants.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 732`** (1 nodes): `Send preprocessed errors to LLM for analysis.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 733`** (1 nodes): `Format errors for VS Code problem matcher.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 734`** (1 nodes): `Main entry point for CI analyzer.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 735`** (1 nodes): `Execute gh CLI command and return parsed JSON output.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 736`** (1 nodes): `Get the ID of the most recent failed CI run.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 737`** (1 nodes): `Download a specific artifact from a workflow run.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 738`** (1 nodes): `Get raw logs from a failed workflow run.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 739`** (1 nodes): `Parse Vitest JSON report for failing tests.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 740`** (1 nodes): `Parse Stryker JSON report for surviving mutants.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mt()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 12`, `Community 15`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `t()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 19`, `Community 22`, `Community 27`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `fn()` connect `Community 8` to `Community 2`, `Community 4`, `Community 7`, `Community 9`, `Community 15`, `Community 16`, `Community 23`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 87 inferred relationships involving `mt()` (e.g. with `pE()` and `xE()`) actually correct?**
  _`mt()` has 87 INFERRED edges - model-reasoned connections that need verification._
- **Are the 57 inferred relationships involving `fn()` (e.g. with `makeMediaQuery()` and `MockSpeechRecognition()`) actually correct?**
  _`fn()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 46 inferred relationships involving `t()` (e.g. with `.flattenForSingleProject()` and `fr()`) actually correct?**
  _`t()` has 46 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Emits JSON progress events on each training log step.`, `qb`, `v2` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._