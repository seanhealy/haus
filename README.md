This is a [Next.js](https://nextjs.org) project bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `app/page.tsx`. The page
auto-updates as you edit the file.

This project uses
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load [Geist](https://vercel.com/font), a new font
family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out
[the Next.js GitHub repository](https://github.com/vercel/next.js) - your
feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for more details.

## Project Setup

This project was scaffolded with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
and customized with `setup-next.js` using the following choices:

| Category             | Choice                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| Language             | TypeScript                                                                      |
| Linter               | [Biome](https://biomejs.dev/)                                                   |
| React Compiler       | Enabled                                                                         |
| CSS                  | CSS Modules (Tailwind opt-out)                                                  |
| Project structure    | `src/` directory                                                                |
| Router               | App Router                                                                      |
| Import alias         | `@/*`                                                                           |
| Database             | [Neon](https://neon.tech/) (Serverless Postgres)                                |
| ORM                  | [Drizzle ORM](https://orm.drizzle.team/)                                        |
| Testing              | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Formatter (MD/HTML)  | [Prettier](https://prettier.io/) (tabs, 80 col)                                 |
| Node version manager | [Volta](https://volta.sh/)                                                      |
| Editor               | [Zed](https://zed.dev/) settings included                                       |

### Available Scripts

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start dev server (Turbopack)            |
| `npm run build`       | Production build                        |
| `npm run start`       | Start production server                 |
| `npm run lint`        | Check with Biome + Prettier             |
| `npm run format`      | Auto-fix with Biome                     |
| `npm run lint:fix`    | Auto-fix with Biome + Prettier          |
| `npm run db:generate` | Generate migrations from schema         |
| `npm run db:migrate`  | Run pending migrations                  |
| `npm run db:push`     | Push schema directly (dev shortcut)     |
| `npm run db:studio`   | Open Drizzle Studio (visual DB browser) |
| `npm run test`        | Run tests once                          |
| `npm run test:watch`  | Run tests in watch mode                 |
| `npm run typecheck`   | TypeScript type check (no emit)         |
| `npm run verify`      | Run tests + lint:fix + typecheck in one |
