
## SQL Practice Platform — MVP

A web app to learn SQL through 50 hands-on problems on a realistic e-commerce dataset, with safe in-browser query execution, result-based validation, and progress tracking.

### Core experience
- **Landing page** explaining the platform and a CTA to start practicing.
- **Practice list** showing all 50 problems grouped by level (0–5) with difficulty, topics, and solved status.
- **Problem page** with: problem statement, schema reference, Monaco SQL editor, "Run" button, result table, hints (progressive reveal), and "Show solution" with explanation. Compares user result vs expected result and shows ✅/❌ feedback.
- **Dashboard** showing XP, level, streak, solved count by topic, and weak areas.
- **Exam mode** (timed, mixed difficulty) — basic version.

### Dataset
Single persistent e-commerce schema (`users`, `products`, `orders`, `order_items`, `payments`) seeded with realistic small data — same DB across all problems so users build mental model of the data.

### SQL execution engine
- Runs entirely in the browser using **sql.js** (SQLite compiled to WebAssembly) — no backend needed for query execution, fully sandboxed by design.
- Fresh in-memory DB per query run, schema + seed loaded each time.
- Safety filter blocks `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`.
- **Validator**: result-based comparison (not string match). Configurable `ignore_order` and `ignore_column_names` per problem.

### Problem bank (50 problems)
Stored as typed JSON in the codebase. Schema includes: id, title, level, difficulty, topics, goal, problem statement, starter SQL, solution + alt solutions, validation config, progressive hints, explanation, estimated time. Distribution:
- L0–L1 Basics (SELECT, WHERE, ORDER BY, LIKE, IN): 15
- L2 JOINs (INNER, LEFT, multi-table, anti-joins): 15
- L3 Aggregation (COUNT, SUM, AVG, GROUP BY, HAVING): 10
- L4 Subqueries (IN, NOT IN, EXISTS, correlated): 7
- L5 Advanced (multi-join + aggregation + ranking): 3

### Progression & gamification
- XP per solve: `level × 10`, ×1.5 if first attempt, ×1.2 if under estimated time.
- Level derived from XP thresholds.
- Streak: consecutive days with at least one solve.
- Topic mastery tracked per tag (JOIN, aggregation, etc.) → surfaces weak areas on dashboard.
- Achievements: First Query, 10 Solved, JOIN Master, No-Hint Solve, 7-Day Streak.
- Persistence in `localStorage` for MVP (no auth required).

### Routes
- `/` — landing
- `/practice` — problem list grouped by level
- `/problem/$problemId` — editor + run + validate
- `/dashboard` — progress, XP, streak, topic mastery
- `/exam` — timed mixed-difficulty session

### Tech & UI
- TanStack Start file-based routes, Tailwind, shadcn/ui components.
- Monaco editor for SQL with syntax highlighting.
- Schema sidebar always visible on problem page (collapsible on mobile).
- Clean, focused dark-mode-friendly UI inspired by LeetCode/HackerRank but simpler.

### Out of scope for MVP (future)
- Auth + cloud-synced progress, multiple datasets, query visualizer, AI explanations, leaderboard, debug/optimize/schema-design problem types.
