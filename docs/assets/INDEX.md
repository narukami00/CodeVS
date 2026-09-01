# Assets Index — CodeVS

Generated from 4 sources. **76 unique images** deduplicated by SHA-256 hash (11 docx↔pptx overlaps collapsed). Decorative icons (<2 KB) excluded. Output: `docs/assets/`

## Sources

| Source | File | Images | Notes |
|---|---|---|---|
| Report (Word) | `CodeVS_Project_Report.docx` | 22 `word/media/*` | Sorted in document order (Section 3 diagrams → Jira/Git tables) |
| Report (PDF) | `CodeVS_Project_Report.pdf` | 24 page images (32 pages) | `fitz` pixmap extraction; 8 pages contain no images |
| Presentation | `CodeVS_Workflow_Presentation.pptx` | 47 `ppt/media/*` (4 decorative excluded → 43 kept) | 34 slides |
| Zephyr Report | `CodeVS_Zephyr_Testing_Report.docx` | 0 + thumbnail | No embedded media beyond `docProps/thumbnail.jpeg` |

## Quick Stats

- Unique assets written: **76**
- Deduplicated overlaps (same hash in docx & pptx): 11 (UML, Activity, Sequence, Use-Case, Component-alt, DFD L0/L1/L2×5)
- Naming: semantic kebab-case. Diagrams → `uml-*`, `dfd-*`, `*-diagram`; UI → `ui-*`; Jira → `jira-*`/`screenshot-jira-*`; GitHub → `github-*`/`screenshot-*`; Zephyr → `zephyr-*`; PDF extras → `pdf-pageXX-*`

## All Assets

| # | File | Description | Source(s) | Size |
|---|---|---|---|---|
| 1 | `activity-diagram.png` | Activity Diagram — full flow from authentication → matchmaking → live game loop → result/rematch. Section 3.2 / PPT slide 6. | CodeVS_Project_Report.docx:word/media/image2.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image8.png | 793 KB |
| 2 | `component-diagram.jpg` | Component Diagram — high-res export (122 KB) showing React SPA ↔ Firebase Auth / Firestore / Realtime Database / Hosting. PPT slide 4 (with 3 decorative icons). | CodeVS_Workflow_Presentation.pptx:ppt/media/image3.jpeg | 120 KB |
| 3 | `contribution-chart-1.png` | Chart — Task Division / Contribution (pie/bar). PPT slide 25 image 30 (173 KB). | CodeVS_Workflow_Presentation.pptx:ppt/media/image30.png | 170 KB |
| 4 | `contribution-chart-2.png` | Chart — Contributor breakdown for Rafsan / Utsa / Adib. PPT slide 25 image 31 (164 KB). | CodeVS_Workflow_Presentation.pptx:ppt/media/image31.png | 160 KB |
| 5 | `contribution-chart-3.png` | Chart — Issue distribution / sprint load. PPT slide 25 image 32 (189 KB). | CodeVS_Workflow_Presentation.pptx:ppt/media/image32.png | 185 KB |
| 6 | `dfd-level0-context.png` | DFD Level 0 Context Diagram — single CodeVS process with external entities Player, Firebase Auth, Firestore/RTDB. Section 3.6 / PPT slide 8. | CodeVS_Project_Report.docx:word/media/image6.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image10.png | 91 KB |
| 7 | `dfd-level1-main-processes.png` | DFD Level 1 — five major processes: User Authentication, Matchmaking, Game Session Management, Score Calculation, Leaderboard Management. PPT slide 9. | CodeVS_Project_Report.docx:word/media/image7.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image11.png | 174 KB |
| 8 | `dfd-level2-a.png` | DFD Level 2 (A) — decomposition of Matchmaking & Game Session Management (room creation, ready-state, snippet assignment). PPT slide 10. | CodeVS_Project_Report.docx:word/media/image8.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image12.png | 100 KB |
| 9 | `dfd-level2-b.png` | DFD Level 2 (B) — continuation of Level 2 decomposition. PPT slide 11. | CodeVS_Project_Report.docx:word/media/image9.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image13.png | 123 KB |
| 10 | `dfd-level2-c.png` | DFD Level 2 (C) — continuation of Level 2 decomposition. PPT slide 12. | CodeVS_Project_Report.docx:word/media/image10.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image14.png | 119 KB |
| 11 | `dfd-level2-d.png` | DFD Level 2 (D) — continuation of Level 2 decomposition. PPT slide 13. | CodeVS_Project_Report.docx:word/media/image11.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image15.png | 124 KB |
| 12 | `dfd-level2-e.png` | DFD Level 2 (E) — continuation of Level 2 decomposition. PPT slide 14. | CodeVS_Project_Report.docx:word/media/image12.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image16.png | 116 KB |
| 13 | `diagram-component-alt.png` | Component Diagram (alt PNG export, 63 KB) — React SPA, Firebase Auth, Firestore, Realtime Database and Hosting boundaries. Same content as component-diagram.jpg but lower-res docx export. | CodeVS_Project_Report.docx:word/media/image5.png | 62 KB |
| 14 | `git-branching-strategy.png` | Diagram — Git/GitHub Branching Strategy (main protected, SCRUM-{n}-{slug} feature branches, no direct commits). PPT slide 27. | CodeVS_Workflow_Presentation.pptx:ppt/media/image34.png | 46 KB |
| 15 | `github-branch-graph.png` | Screenshot — GitHub Branch Graph / network. PPT slide 29 image 37. | CodeVS_Workflow_Presentation.pptx:ppt/media/image37.png | 25 KB |
| 16 | `github-commit-history.png` | Screenshot — GitHub Commit History (31 commits, 68% tagged). PPT slide 29 image 36. | CodeVS_Workflow_Presentation.pptx:ppt/media/image36.png | 104 KB |
| 17 | `github-pr-list.png` | Screenshot — GitHub Pull Requests list (14 PRs). PPT slide 29 image 35. | CodeVS_Workflow_Presentation.pptx:ppt/media/image35.png | 64 KB |
| 18 | `jira-epic-overview.png` | Jira Screenshot — Epic Overview table (5 epics: SCRUM-1..5, tasks, status Done). Small card (51 KB). PPT slide 21. | CodeVS_Workflow_Presentation.pptx:ppt/media/image25.png | 51 KB |
| 19 | `jira-github-integration-1.png` | Screenshot — Jira↔GitHub Integration step 1 (create Jira ticket). PPT slide 30. | CodeVS_Workflow_Presentation.pptx:ppt/media/image38.png | 24 KB |
| 20 | `jira-github-integration-2.png` | Screenshot — Jira↔GitHub Integration step 2 (create branch SCRUM-...). PPT slide 30. | CodeVS_Workflow_Presentation.pptx:ppt/media/image39.png | 18 KB |
| 21 | `jira-github-integration-3.png` | Screenshot — Jira↔GitHub Integration step 3 (raise PR). PPT slide 30. | CodeVS_Workflow_Presentation.pptx:ppt/media/image40.png | 17 KB |
| 22 | `jira-github-integration-4.png` | Screenshot — Jira↔GitHub Integration step 4 (auto-transition to Done). PPT slide 30. | CodeVS_Workflow_Presentation.pptx:ppt/media/image41.png | 30 KB |
| 23 | `jira-scrum-board.png` | Jira Screenshot — Scrum Board overview (tiny 24 KB thumbnail). PPT slide 21 (second image). | CodeVS_Workflow_Presentation.pptx:ppt/media/image26.png | 24 KB |
| 24 | `jira-sprint1-board.png` | Jira Screenshot — Sprint 1 board (Project Foundation, 20 issues). PPT slide 22. | CodeVS_Workflow_Presentation.pptx:ppt/media/image27.png | 54 KB |
| 25 | `jira-sprint2-board.png` | Jira Screenshot — Sprint 2 board (Core Multiplayer Engine, 45 issues). PPT slide 23. | CodeVS_Workflow_Presentation.pptx:ppt/media/image28.png | 48 KB |
| 26 | `jira-sprint3-board.png` | Jira Screenshot — Sprint 3 board (Polish/Testing/Deployment, 43 issues). PPT slide 24. | CodeVS_Workflow_Presentation.pptx:ppt/media/image29.png | 47 KB |
| 27 | `jira-workflow-diagram.png` | Diagram — Jira Workflow (Backlog → In Progress → Review → Done, time-boxed sprints). PPT slide 26. | CodeVS_Workflow_Presentation.pptx:ppt/media/image33.png | 44 KB |
| 28 | `outcomes-metrics-1.png` | Metrics Dashboard — Project Outcomes (113 issues, 100% resolution, 31 commits, 14 PRs). PPT slide 33 image 46. | CodeVS_Workflow_Presentation.pptx:ppt/media/image46.png | 24 KB |
| 29 | `outcomes-metrics-2.png` | Metrics Dashboard — Performance metrics (6 languages, 7 screens, latency <250 ms). PPT slide 33 image 47. | CodeVS_Workflow_Presentation.pptx:ppt/media/image47.png | 20 KB |
| 30 | `pdf-page03-img29.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page3:xref29) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page3:xref29 | 245 KB |
| 31 | `pdf-page04-img32.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page4:xref32) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page4:xref32 | 384 KB |
| 32 | `pdf-page05-img36.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page5:xref36) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page5:xref36 | 119 KB |
| 33 | `pdf-page06-img41.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page6:xref41) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page6:xref41 | 138 KB |
| 34 | `pdf-page07-img44.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page7:xref44) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page7:xref44 | 47 KB |
| 35 | `pdf-page08-img52.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page8:xref52) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page8:xref52 | 73 KB |
| 36 | `pdf-page08-img53.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page8:xref53) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page8:xref53 | 171 KB |
| 37 | `pdf-page09-img56.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref56) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page9:xref56 | 96 KB |
| 38 | `pdf-page09-img57.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref57) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page9:xref57 | 215 KB |
| 39 | `pdf-page09-img58.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref58) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page9:xref58 | 215 KB |
| 40 | `pdf-page10-img61.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page10:xref61) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page10:xref61 | 124 KB |
| 41 | `pdf-page10-img62.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page10:xref62) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page10:xref62 | 206 KB |
| 42 | `pdf-page11-img65.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page11:xref65) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page11:xref65 | 56 KB |
| 43 | `pdf-page12-img68.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page12:xref68) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page12:xref68 | 19 KB |
| 44 | `pdf-page12-img69.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page12:xref69) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page12:xref69 | 36 KB |
| 45 | `pdf-page13-img72.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page13:xref72) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page13:xref72 | 121 KB |
| 46 | `pdf-page14-img75.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page14:xref75) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page14:xref75 | 126 KB |
| 47 | `pdf-page15-img78.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page15:xref78) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page15:xref78 | 111 KB |
| 48 | `pdf-page24-img97.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page24:xref97) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page24:xref97 | 38 KB |
| 49 | `pdf-page25-img100.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page25:xref100) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page25:xref100 | 64 KB |
| 50 | `pdf-page27-img105.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page27:xref105) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page27:xref105 | 53 KB |
| 51 | `pdf-page28-img115.png` | PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page28:xref115) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution). | CodeVS_Project_Report.pdf:page28:xref115 | 51 KB |
| 52 | `screenshot-commit-history.png` | Screenshot — Commit History table (31 commits chronological). Docx-only image 20 (103 KB), para 956. | CodeVS_Project_Report.docx:word/media/image20.png | 101 KB |
| 53 | `screenshot-git-workflow.png` | Screenshot — Git Workflow table (branch ↔ Jira mapping, PR #s). Docx-only image 19 (51 KB), para 886. | CodeVS_Project_Report.docx:word/media/image19.png | 51 KB |
| 54 | `screenshot-github-pr-overview.png` | Screenshot — GitHub PR overview / branch list. Docx-only image 21 (75 KB), para 1103. | CodeVS_Project_Report.docx:word/media/image21.png | 74 KB |
| 55 | `screenshot-jira-epics-overview.png` | Screenshot — Jira Epics Overview (small cropped tile, 28 KB). Docx-only image 14, before §4.2. | CodeVS_Project_Report.docx:word/media/image14.png | 28 KB |
| 56 | `screenshot-jira-sprint-timeline.png` | Screenshot — Jira Sprint Timeline / Gantt-like view (44 KB). Docx-only image 15, before §4.3. | CodeVS_Project_Report.docx:word/media/image15.png | 44 KB |
| 57 | `screenshot-jira-sprint1-detail.png` | Screenshot — Sprint 1 detail table (188 KB). Docx-only image 16, para 222. | CodeVS_Project_Report.docx:word/media/image16.png | 184 KB |
| 58 | `screenshot-jira-sprint2-detail.png` | Screenshot — Sprint 2 detail table (196 KB). Docx-only image 17, para 272. | CodeVS_Project_Report.docx:word/media/image17.png | 192 KB |
| 59 | `screenshot-jira-sprint3-detail.png` | Screenshot — Sprint 3 detail table (172 KB). Docx-only image 18, para 318. | CodeVS_Project_Report.docx:word/media/image18.png | 169 KB |
| 60 | `screenshot-team-roles.png` | Screenshot — Team & Roles table from report §4 (Rafsan/Utsa/Adib responsibilities). Docx-only image 13 (77 KB). | CodeVS_Project_Report.docx:word/media/image13.png | 76 KB |
| 61 | `screenshot-zephyr-test-overview.png` | Screenshot — Zephyr Test Management overview (test definitions). Docx-only image 22 (80 KB), para 1107. | CodeVS_Project_Report.docx:word/media/image22.png | 79 KB |
| 62 | `sequence-diagram.png` | Sequence Diagram — interaction timeline Client (React) ↔ Firebase Auth ↔ Firestore ↔ Realtime Database during a complete match. Section 3.3 / PPT slide 7. | CodeVS_Project_Report.docx:word/media/image3.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image9.png | 128 KB |
| 63 | `ui-landing-page.png` | UI Screenshot — Landing Page (hacker dark theme, animated background, hero). PPT slide 15. | CodeVS_Workflow_Presentation.pptx:ppt/media/image17.png | 690 KB |
| 64 | `ui-leaderboard.png` | UI Screenshot — Leaderboard (global rankings, podium). PPT slide 17 (right). | CodeVS_Workflow_Presentation.pptx:ppt/media/image21.png | 342 KB |
| 65 | `ui-login.png` | UI Screenshot — Log-In form. PPT slide 16 (right). | CodeVS_Workflow_Presentation.pptx:ppt/media/image19.png | 285 KB |
| 66 | `ui-matchmaking-create.png` | UI Screenshot — Matchmaking / Create Room flow (6-char Room ID). PPT slide 18 (left). | CodeVS_Workflow_Presentation.pptx:ppt/media/image22.png | 438 KB |
| 67 | `ui-matchmaking-join.png` | UI Screenshot — Matchmaking / Join Room (enter Room ID). PPT slide 18 (right). | CodeVS_Workflow_Presentation.pptx:ppt/media/image23.png | 423 KB |
| 68 | `ui-profile.png` | UI Screenshot — User Profile page. PPT slide 17 (left). | CodeVS_Workflow_Presentation.pptx:ppt/media/image20.png | 446 KB |
| 69 | `ui-signup.png` | UI Screenshot — Sign-Up form. PPT slide 16 (left). | CodeVS_Workflow_Presentation.pptx:ppt/media/image18.png | 257 KB |
| 70 | `ui-typing-contest.png` | UI Screenshot — Typing Contest / Game screen (split player/opponent panels, live progress, WPM/Accuracy). PPT slide 19. | CodeVS_Workflow_Presentation.pptx:ppt/media/image24.png | 332 KB |
| 71 | `uml-class-diagram.jpg` | UML Class Diagram — classes User, Room, Game, Snippet, Leaderboard with associations, multiplicities and methods. Section 3.1 of report. Corresponds to PPT slide 3. | CodeVS_Project_Report.docx:word/media/image1.jpeg<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image2.jpeg | 168 KB |
| 72 | `use-case-diagram.png` | Use Case Diagram — actors Guest User, Authenticated Player, System/Firebase and all primary use cases. Section 3.4 / PPT slide 5. | CodeVS_Project_Report.docx:word/media/image4.png<br>CodeVS_Workflow_Presentation.pptx:ppt/media/image7.png | 163 KB |
| 73 | `zephyr-coverage-report.png` | Screenshot — Zephyr Coverage Report. PPT slide 31 image 45. | CodeVS_Workflow_Presentation.pptx:ppt/media/image45.png | 68 KB |
| 74 | `zephyr-execution-results.png` | Screenshot — Zephyr Execution Results. PPT slide 31 image 44. | CodeVS_Workflow_Presentation.pptx:ppt/media/image44.png | 17 KB |
| 75 | `zephyr-test-cases.png` | Screenshot — Zephyr Test Cases list. PPT slide 31 image 43. | CodeVS_Workflow_Presentation.pptx:ppt/media/image43.png | 47 KB |
| 76 | `zephyr-test-cycle.png` | Screenshot — Zephyr Scale Test Cycle. PPT slide 31 image 42. | CodeVS_Workflow_Presentation.pptx:ppt/media/image42.png | 35 KB |

## Deduplication Map (docx ↔ pptx same hash)

| Semantic file | docx `word/media/*` | pptx `ppt/media/*` | Hash (12 hex) |
|---|---|---|---|
| `uml-class-diagram.jpg` | `word/media/image1.jpeg` | `ppt/media/image2.jpeg` | `7a64bdde2600` |
| `use-case-diagram.png` | `word/media/image4.png` | `ppt/media/image7.png` | `8ddc16ba2fd2` |
| `activity-diagram.png` | `word/media/image2.png` | `ppt/media/image8.png` | `46ea712f2382` |
| `sequence-diagram.png` | `word/media/image3.png` | `ppt/media/image9.png` | `2a2c75116ee2` |
| `dfd-level0-context.png` | `word/media/image6.png` | `ppt/media/image10.png` | `20495759f655` |
| `dfd-level1-main-processes.png` | `word/media/image7.png` | `ppt/media/image11.png` | `95e22745e822` |
| `dfd-level2-a.png` | `word/media/image8.png` | `ppt/media/image12.png` | `2ca9fb8b9ecb` |
| `dfd-level2-b.png` | `word/media/image9.png` | `ppt/media/image13.png` | `927b43c120e4` |
| `dfd-level2-c.png` | `word/media/image10.png` | `ppt/media/image14.png` | `fdaedba3b8ff` |
| `dfd-level2-d.png` | `word/media/image11.png` | `ppt/media/image15.png` | `24cd30194eb5` |
| `dfd-level2-e.png` | `word/media/image12.png` | `ppt/media/image16.png` | `c1a834eb4ae0` |

## Categories

### Diagrams (UML / DFD / Architecture) (14)

- `activity-diagram.png` — Activity Diagram — full flow from authentication → matchmaking → live game loop → result/rematch. Section 3.2 / PPT slide 6.
- `component-diagram.jpg` — Component Diagram — high-res export (122 KB) showing React SPA ↔ Firebase Auth / Firestore / Realtime Database / Hosting. PPT slide 4 (with 3 decorative icons).
- `dfd-level0-context.png` — DFD Level 0 Context Diagram — single CodeVS process with external entities Player, Firebase Auth, Firestore/RTDB. Section 3.6 / PPT slide 8.
- `dfd-level1-main-processes.png` — DFD Level 1 — five major processes: User Authentication, Matchmaking, Game Session Management, Score Calculation, Leaderboard Management. PPT slide 9.
- `dfd-level2-a.png` — DFD Level 2 (A) — decomposition of Matchmaking & Game Session Management (room creation, ready-state, snippet assignment). PPT slide 10.
- `dfd-level2-b.png` — DFD Level 2 (B) — continuation of Level 2 decomposition. PPT slide 11.
- `dfd-level2-c.png` — DFD Level 2 (C) — continuation of Level 2 decomposition. PPT slide 12.
- `dfd-level2-d.png` — DFD Level 2 (D) — continuation of Level 2 decomposition. PPT slide 13.
- `dfd-level2-e.png` — DFD Level 2 (E) — continuation of Level 2 decomposition. PPT slide 14.
- `diagram-component-alt.png` — Component Diagram (alt PNG export, 63 KB) — React SPA, Firebase Auth, Firestore, Realtime Database and Hosting boundaries. Same content as component-diagram.jpg but lower-res docx export.
- `jira-workflow-diagram.png` — Diagram — Jira Workflow (Backlog → In Progress → Review → Done, time-boxed sprints). PPT slide 26.
- `sequence-diagram.png` — Sequence Diagram — interaction timeline Client (React) ↔ Firebase Auth ↔ Firestore ↔ Realtime Database during a complete match. Section 3.3 / PPT slide 7.
- `uml-class-diagram.jpg` — UML Class Diagram — classes User, Room, Game, Snippet, Leaderboard with associations, multiplicities and methods. Section 3.1 of report. Corresponds to PPT slide 3.
- `use-case-diagram.png` — Use Case Diagram — actors Guest User, Authenticated Player, System/Firebase and all primary use cases. Section 3.4 / PPT slide 5.

### UI Screenshots (8)

- `ui-landing-page.png` — UI Screenshot — Landing Page (hacker dark theme, animated background, hero). PPT slide 15.
- `ui-leaderboard.png` — UI Screenshot — Leaderboard (global rankings, podium). PPT slide 17 (right).
- `ui-login.png` — UI Screenshot — Log-In form. PPT slide 16 (right).
- `ui-matchmaking-create.png` — UI Screenshot — Matchmaking / Create Room flow (6-char Room ID). PPT slide 18 (left).
- `ui-matchmaking-join.png` — UI Screenshot — Matchmaking / Join Room (enter Room ID). PPT slide 18 (right).
- `ui-profile.png` — UI Screenshot — User Profile page. PPT slide 17 (left).
- `ui-signup.png` — UI Screenshot — Sign-Up form. PPT slide 16 (left).
- `ui-typing-contest.png` — UI Screenshot — Typing Contest / Game screen (split player/opponent panels, live progress, WPM/Accuracy). PPT slide 19.

### Jira / Scrum Boards (15)

- `jira-epic-overview.png` — Jira Screenshot — Epic Overview table (5 epics: SCRUM-1..5, tasks, status Done). Small card (51 KB). PPT slide 21.
- `jira-github-integration-1.png` — Screenshot — Jira↔GitHub Integration step 1 (create Jira ticket). PPT slide 30.
- `jira-github-integration-2.png` — Screenshot — Jira↔GitHub Integration step 2 (create branch SCRUM-...). PPT slide 30.
- `jira-github-integration-3.png` — Screenshot — Jira↔GitHub Integration step 3 (raise PR). PPT slide 30.
- `jira-github-integration-4.png` — Screenshot — Jira↔GitHub Integration step 4 (auto-transition to Done). PPT slide 30.
- `jira-scrum-board.png` — Jira Screenshot — Scrum Board overview (tiny 24 KB thumbnail). PPT slide 21 (second image).
- `jira-sprint1-board.png` — Jira Screenshot — Sprint 1 board (Project Foundation, 20 issues). PPT slide 22.
- `jira-sprint2-board.png` — Jira Screenshot — Sprint 2 board (Core Multiplayer Engine, 45 issues). PPT slide 23.
- `jira-sprint3-board.png` — Jira Screenshot — Sprint 3 board (Polish/Testing/Deployment, 43 issues). PPT slide 24.
- `jira-workflow-diagram.png` — Diagram — Jira Workflow (Backlog → In Progress → Review → Done, time-boxed sprints). PPT slide 26.
- `screenshot-jira-epics-overview.png` — Screenshot — Jira Epics Overview (small cropped tile, 28 KB). Docx-only image 14, before §4.2.
- `screenshot-jira-sprint-timeline.png` — Screenshot — Jira Sprint Timeline / Gantt-like view (44 KB). Docx-only image 15, before §4.3.
- `screenshot-jira-sprint1-detail.png` — Screenshot — Sprint 1 detail table (188 KB). Docx-only image 16, para 222.
- `screenshot-jira-sprint2-detail.png` — Screenshot — Sprint 2 detail table (196 KB). Docx-only image 17, para 272.
- `screenshot-jira-sprint3-detail.png` — Screenshot — Sprint 3 detail table (172 KB). Docx-only image 18, para 318.

### GitHub / Git Workflow (14)

- `contribution-chart-1.png` — Chart — Task Division / Contribution (pie/bar). PPT slide 25 image 30 (173 KB).
- `contribution-chart-2.png` — Chart — Contributor breakdown for Rafsan / Utsa / Adib. PPT slide 25 image 31 (164 KB).
- `contribution-chart-3.png` — Chart — Issue distribution / sprint load. PPT slide 25 image 32 (189 KB).
- `git-branching-strategy.png` — Diagram — Git/GitHub Branching Strategy (main protected, SCRUM-{n}-{slug} feature branches, no direct commits). PPT slide 27.
- `github-branch-graph.png` — Screenshot — GitHub Branch Graph / network. PPT slide 29 image 37.
- `github-commit-history.png` — Screenshot — GitHub Commit History (31 commits, 68% tagged). PPT slide 29 image 36.
- `github-pr-list.png` — Screenshot — GitHub Pull Requests list (14 PRs). PPT slide 29 image 35.
- `jira-github-integration-1.png` — Screenshot — Jira↔GitHub Integration step 1 (create Jira ticket). PPT slide 30.
- `jira-github-integration-2.png` — Screenshot — Jira↔GitHub Integration step 2 (create branch SCRUM-...). PPT slide 30.
- `jira-github-integration-3.png` — Screenshot — Jira↔GitHub Integration step 3 (raise PR). PPT slide 30.
- `jira-github-integration-4.png` — Screenshot — Jira↔GitHub Integration step 4 (auto-transition to Done). PPT slide 30.
- `screenshot-commit-history.png` — Screenshot — Commit History table (31 commits chronological). Docx-only image 20 (103 KB), para 956.
- `screenshot-git-workflow.png` — Screenshot — Git Workflow table (branch ↔ Jira mapping, PR #s). Docx-only image 19 (51 KB), para 886.
- `screenshot-github-pr-overview.png` — Screenshot — GitHub PR overview / branch list. Docx-only image 21 (75 KB), para 1103.

### Zephyr / QA (5)

- `screenshot-zephyr-test-overview.png` — Screenshot — Zephyr Test Management overview (test definitions). Docx-only image 22 (80 KB), para 1107.
- `zephyr-coverage-report.png` — Screenshot — Zephyr Coverage Report. PPT slide 31 image 45.
- `zephyr-execution-results.png` — Screenshot — Zephyr Execution Results. PPT slide 31 image 44.
- `zephyr-test-cases.png` — Screenshot — Zephyr Test Cases list. PPT slide 31 image 43.
- `zephyr-test-cycle.png` — Screenshot — Zephyr Scale Test Cycle. PPT slide 31 image 42.

### Outcomes / Metrics (2)

- `outcomes-metrics-1.png` — Metrics Dashboard — Project Outcomes (113 issues, 100% resolution, 31 commits, 14 PRs). PPT slide 33 image 46.
- `outcomes-metrics-2.png` — Metrics Dashboard — Performance metrics (6 languages, 7 screens, latency <250 ms). PPT slide 33 image 47.

### Report-only Screenshots (docx extras) (10)

- `screenshot-commit-history.png` — Screenshot — Commit History table (31 commits chronological). Docx-only image 20 (103 KB), para 956.
- `screenshot-git-workflow.png` — Screenshot — Git Workflow table (branch ↔ Jira mapping, PR #s). Docx-only image 19 (51 KB), para 886.
- `screenshot-github-pr-overview.png` — Screenshot — GitHub PR overview / branch list. Docx-only image 21 (75 KB), para 1103.
- `screenshot-jira-epics-overview.png` — Screenshot — Jira Epics Overview (small cropped tile, 28 KB). Docx-only image 14, before §4.2.
- `screenshot-jira-sprint-timeline.png` — Screenshot — Jira Sprint Timeline / Gantt-like view (44 KB). Docx-only image 15, before §4.3.
- `screenshot-jira-sprint1-detail.png` — Screenshot — Sprint 1 detail table (188 KB). Docx-only image 16, para 222.
- `screenshot-jira-sprint2-detail.png` — Screenshot — Sprint 2 detail table (196 KB). Docx-only image 17, para 272.
- `screenshot-jira-sprint3-detail.png` — Screenshot — Sprint 3 detail table (172 KB). Docx-only image 18, para 318.
- `screenshot-team-roles.png` — Screenshot — Team & Roles table from report §4 (Rafsan/Utsa/Adib responsibilities). Docx-only image 13 (77 KB).
- `screenshot-zephyr-test-overview.png` — Screenshot — Zephyr Test Management overview (test definitions). Docx-only image 22 (80 KB), para 1107.

### PDF-rasterized extras (22)

- `pdf-page03-img29.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page3:xref29) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page04-img32.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page4:xref32) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page05-img36.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page5:xref36) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page06-img41.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page6:xref41) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page07-img44.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page7:xref44) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page08-img52.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page8:xref52) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page08-img53.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page8:xref53) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page09-img56.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref56) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page09-img57.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref57) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page09-img58.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page9:xref58) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page10-img61.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page10:xref61) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page10-img62.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page10:xref62) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page11-img65.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page11:xref65) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page12-img68.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page12:xref68) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page12-img69.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page12:xref69) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page13-img72.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page13:xref72) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page14-img75.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page14:xref75) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page15-img78.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page15:xref78) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page24-img97.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page24:xref97) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page25-img100.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page25:xref100) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page27-img105.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page27:xref105) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).
- `pdf-page28-img115.png` — PDF-rendered image extracted from CodeVS_Project_Report.pdf (CodeVS_Project_Report.pdf:page28:xref115) — rasterized diagram/screenshot as it appears in the PDF export (may be duplicate of docx diagram but at PDF resolution).

## Extraction Method

```python
# docx/pptx are ZIPs: word/media/*, ppt/media/*
# pdf via PyMuPDF (fitz): page.get_images() → Pixmap → PNG
# Deduplicate by SHA-256 (first 12 hex) → one canonical file per hash
# Decorative icons <2 KB (ppt/media/image1,4,5,6) skipped
```

See `extract.py` (root) and `_manifest.json` for reproducible hashes and full source→hash mapping.
