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

### ✅ Apply the generated changes

1. Run the prompt with your brief and copy the JSON response.
2. Validate the payload locally, for example:

   ```bash
   echo '<json-from-the-model>' | jq
   ```

3. Open `products.json` and paste:
   - `products[0]` into the top-level `products` array.
   - `articles[0]` into the top-level `articles` array.
4. Save the file and run the site locally (`npm run dev`) to confirm the new review and article render correctly.
5. Commit the updated `products.json` and deploy—Incremental Static Regeneration will publish the new pages automatically.
