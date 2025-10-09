# Prompt for generating product pages, reviews, and articles

This repository stores all editorial data inside `products.json`. The `/reviews` pages read the objects in the `products` array, and the `/articles` pages use the entries in the `articles` array. To populate these sections with AI-generated content, use the prompt below: it outputs a JSON snippet that can be merged straight into `products.json`.

## Expected `products.json` structure

### Product (`products[]`)
Each product must provide the following keys (all used by `/reviews/[slug]`):

- `slug`: unique URL identifier in kebab case.
- `title`, `brand`, `category`, `releaseYear`, `date`, `lastUpdated`.
- `intro`: short hook (1–2 sentences).
- `images`: object with `main` (HTTPS Amazon or manufacturer URL), `gallery[]` (3+ URLs), and `query` (search string).
- `highlights[]`: short bullet points (5–6) featured on the page.
- `specs{}`: key/value dictionary (CPU, GPU, ports, etc.).
- `pros[]` / `cons[]` (3–5 items each).
- `rating{ performance, design, value, overall }` scored out of 5.
- `affiliateLink`: Amazon URL already containing the `techrevie004c-20` tag (or leave empty if unavailable).
- `faq[]`: 2–4 question/answer pairs.
- `longForm`: `targetWordCount` + `sections[]` with `id`, `heading`, `contentHtml` (minimal HTML). Follow the flow of the review.
- `sections` and `verdict` are not consumed directly but may be added to keep additional context.
- `related[]`: related product slugs.

### Article (`articles[]`)
The `/articles/[slug]` route accepts three article types:

- `guide`: requires `products[]` (ordered list of slugs), `sections[]` (same length as `products`, with `heading` + `blurb` summarising each pick), `sectionsLong[]` for editorial callouts, and a comparison `matrix`.
- `comparison`: must compare exactly two products via `products[]`. Add `sections[]` (2–4 entries with `heading` + `body`) and `sources[]` (title + URL).
- `review`: links a single product via `productSlug`. Provide `sections[]` (free-form text), a `verdict` (short summary), and `sources[]`.

Shared keys: `slug`, `title`, `intro`, `type`, `category`, `date` (ISO), `updated` (optional), `sources[]` (objects with `name` + `url`).

## Ready-to-use prompt

Copy/paste this prompt into your preferred language model and replace the bracketed placeholders:

```
You are a senior English-speaking tech journalist. Based on the brief below, create:
1. A complete product entry for the `/reviews/[slug]` page.
2. A companion article for the `/articles/[slug]` page.

General rules:
- Respond with a valid JSON object formatted with exactly two keys:
  {
    "products": [ { ...newProduct } ],
    "articles": [ { ...newArticle } ]
  }
- Do not include comments, extra narration, or trailing commas.
- Use double quotes for every string value.
- Avoid non-UTF8 characters.
- Image URLs must come from `https://m.media-amazon.com/` (copied from an Amazon listing) or an official manufacturer site.
- Every text field must be original, factual, and backed by entries in `sources[]`.
- The review and article must cover hardware launched within the past 24 months.
- All prose—including headings, highlights, FAQs, and long-form sections—must be written in English.

Brief:
- Primary category: [product category e.g. "laptops"].
- Product to cover: [exact model name + year/variant].
- Positioning: [use case context, e.g. "ultrabook for students"].
- Price & availability notes: [details if known].
- Key strengths to highlight: [3–4 bullet points].
- Key limitations to acknowledge: [2–3 points].
- Sources to cite:
  - [Source title 1] — [URL 1] — [date YYYY-MM-DD]
  - [Source title 2] — [URL 2] — [date YYYY-MM-DD]
  - (Add up to 5 total sources in `sources[]`).

Specific requirements:
- `products[0]` must strictly follow the structure described above (unique slug derived from the model name, `releaseYear`, `longForm.sections` in HTML using `<p>`, `<ul>`, `<li>`, etc.).
- `articles[0]`: choose the `type` based on the brief ("guide", "comparison", or "review").
  - If type "guide", ensure every slug in `products[]` exists (include the main product and at least one alternative) and provide 2–3 analytical entries in `sectionsLong`.
  - If type "comparison", include exactly two slugs in `products[]` and cover the major differences within `sections`.
  - If type "review", set `productSlug` to the main product slug and supply 3–5 sections in `sections`.
- `matrix` is mandatory for `guide` (3–6 rows). Omit `matrix` for the other types.
- `sources[]` must list the provided references (plus any you add) with `name`, optional `publisher`, `url`, and `date`.
- `date` and `lastUpdated`: use today’s date in ISO format (YYYY-MM-DD).
- `rating`: score each field out of 5 (decimals allowed). Keep `overall` consistent with `pros`/`cons`.
- Ensure full alignment between the intro, highlights, sections, matrix, and the listed specs.

Validate that the JSON output can be merged into `products.json` without missing keys.
```

## Integration tips

1. Run the prompt, then validate the JSON (for example with `jq`).
2. Add the generated product to `products.json.products[]` and the article to `products.json.articles[]`.
3. Update any slugs referenced elsewhere (`related`, `matrix`, etc.) so they point to existing entries.
4. Deploy: the `/reviews` and `/articles` pages will automatically consume the new data via ISR.
