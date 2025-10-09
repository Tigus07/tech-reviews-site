# Tech Reviews Hub

A modern **Next.js 14 + Tailwind** site using the **App Router**.

## 🚀 Run locally

```bash
npm install
npm run dev
```

## ✍️ Generate content (reviews & articles)

All editorial pages pull their data from `products.json`:

- `/reviews` & `/reviews/[slug]` consume `products[]`.
- `/articles` & `/articles/[slug]` consume `articles[]`.

To create new entries with an AI model, follow the detailed guide and ready-to-use prompt in [`docs/content-generation-prompt.md`](docs/content-generation-prompt.md).

The prompt returns JSON already compatible with the front-end data format. Validate the output (e.g. with `jq`) before merging the entries into `products.json`.
