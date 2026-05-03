<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Linter/Formatter:** [Biome](https://biomejs.dev/) for JS/TS/CSS/JSON
- **Testing:** [Vitest](https://vitest.dev/) +
  [Testing Library](https://testing-library.com/)
- **Formatter (MD/HTML):** [Prettier](https://prettier.io/)
- **Node version manager:** [Volta](https://volta.sh/)

## Project Structure

This project uses the `src/` directory layout with the App Router:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/   # Global, reusable components
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── components/ # Components scoped to /dashboard
│   └── ...
├── db/
│   ├── index.ts          # Drizzle client + Neon connection
│   ├── schema.ts         # Table definitions
│   └── repositories/     # Repository pattern for DB access
│       ├── index.ts      # Barrel export
│       └── example.ts    # Example repository
└── ...
```

## Component Organization

- Use **design system patterns** — build a consistent library of reusable,
  composable UI components with clear props interfaces rather than one-off
  inline markup.
- **Global components** shared across multiple pages go in
  `src/app/components/`.
- **Scoped components** that are only relevant to a single page or parent
  component go in a `components/` directory colocated with that page or
  component.

## Database & Repository Pattern

- All database interactions go through **repositories** in
  `src/db/repositories/`.
- Each repository encapsulates queries for a specific domain (e.g.,
  `UserRepository`, `PostRepository`).
- Never import `db` directly in route handlers or components — always go through
  a repository.
- Use UUIDs for all database primary keys — never sequential/guessable IDs.
- Define tables in `src/db/schema.ts` using Drizzle's schema API.
- Use `npm run db:generate` to create migrations after schema changes, then
  `npm run db:migrate` to apply them.

## Coding Conventions

- **Indentation:** Tabs (not spaces)
- **Line width:** 80 columns
- **Import alias:** `@/*` maps to `src/*`
- **Imports:** Auto-organized by Biome
- **Object/interface properties:** Order by importance, not alphabetically.
  Group related properties together. Identifying fields (e.g., `identifier`)
  come first, core fields next, optional/metadata fields last.
- Prefer named exports over default exports (except for pages/layouts)
- Use `function` declarations for components, not arrow functions
- **Function ordering:** Most important first, helpers last. Exported/primary
  functions at the top of the file, internal helpers below in descending
  importance. Since functions are hoisted, usage order doesn't matter.
- **Variable naming:** Use full words, not abbreviations (e.g., `action` not
  `fn`, `implementation` not `impl`, `context` not `ctx`)
- **Iteration:** Prefer enumerables (`forEach`, `map`, `reduce`, `filter`,
  `find`) over `for` loops.
- **Directory modules:** When a module grows into a directory, use `index.ts` as
  a barrel export only — the implementation lives in a named file (e.g.,
  `machineBuilder/index.ts` re-exports from `machineBuilder/machineBuilder.ts`)
- When coding keep things simple and understandable. We don't want to
  prematurely over engineer solutions. A good guideline is how easy is it to
  mutate the code. As the only certainty we have is that we're going to have
  change what we've written. Following this will emerge good practices tempered
  by not getting too ahead of ourselves.
- Follow existing patterns and conventions within a code base. When possible
  similar systems should work in the same way so you can make easier connections
  about how things work.

## Testing Conventions

See docs/TESTING.md for testing conventions.

## Commands

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start dev server (Turbopack)            |
| `npm run build`       | Production build                        |
| `npm run start`       | Start production server                 |
| `npm run verify`      | Run tests + lint:fix + typecheck in one |
| `npm run db:generate` | Generate migrations from schema         |
| `npm run db:migrate`  | Run pending migrations                  |
| `npm run db:push`     | Push schema directly (dev shortcut)     |
| `npm run db:studio`   | Open Drizzle Studio (visual DB browser) |
| `npm run test`        | Run tests once                          |
| `npm run test:watch`  | Run tests in watch mode                 |

## Before Submitting Changes

Run `npm run verify` to run tests, auto-fix lint issues, and typecheck.

## Working with the operator

- **File references in conversation text** use project-relative paths (e.g.,
  `src/db/schema.ts:14`), not absolute paths. The project root is the implicit
  base.
- **Slow down before writing.** Read each task fully and think through naming,
  file placement, and structure before writing code — don't rush to a working
  result and clean up later.
- **Keep tests in sync.** When modifying a module that has a `.test` file,
  update the tests in the same pass. Don't leave them stale.
