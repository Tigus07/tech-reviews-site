// app/page.js
import Image from "next/image";
import Link from "next/link";
import db from "../products.json";

/* =========================================================
   CONFIG & SEO CONSTANTS
   ========================================================= */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const TITLE = "Smarter Tech Reviews — Honest, Up-to-Date, and Actionable";
const DESCRIPTION =
  "Independent, engineering-driven reviews and buying guides for laptops, monitors, GPUs, keyboards, and more. Clear picks, concise pros/cons, and fast performance.";

/* =========================================================
   IMAGE HELPERS — strictly prefer Amazon "images.main"
   + upsize to avoid pixelation, keep object-contain to avoid crop
   ========================================================= */
const AMAZON_HOSTS = new Set([
  "m.media-amazon.com",
  "images-na.ssl-images-amazon.com",
]);

function isAmazonUrl(url) {
  try {
    const u = new URL(url);
    return AMAZON_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/** Try to upgrade Amazon image URL to a higher-resolution variant (e.g. _SL1200_) */
function upgradeAmazon(url) {
  if (!isAmazonUrl(url)) return url;
  try {
    // Example: .../I/91ZKaOrm5xL.__AC_SY300_SX300_QL70_ML2_.jpg -> .../I/91ZKaOrm5xL._SL1200_.jpg
    const u = new URL(url);
    const parts = u.pathname.split("/I/");
    if (parts.length < 2) return url;
    const afterI = parts[1]; // e.g. "91Z...L.__AC_SY300_SX300_QL70_ML2_.jpg"
    const filename = afterI.split("/")[0];
    const dot = filename.lastIndexOf(".");
    if (dot === -1) return url;
    const base = filename.slice(0, dot); // hash
    const ext = filename.slice(filename.lastIndexOf(".") + 1); // jpg|png|webp
    const upgraded = `${parts[0]}/I/${base}._SL1200_.${ext}`;
    return `${u.origin}${upgraded}${u.search || ""}`;
  } catch {
    return url;
  }
}

function byDateDesc(a, b) {
  const da = new Date(a?.date || 0).getTime();
  const db = new Date(b?.date || 0).getTime();
  return db - da;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function capitalizeLabel(slug = "") {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Get the product's MAIN image strictly from products.json, prioritizing:
 * - product.images.main (Amazon)
 * - product.images.hero / cover / array entries (if Amazon)
 * - product.imageMain / product.image / product.media.main / product.media.cover (if Amazon)
 * Returns null if no Amazon-hosted image is available.
 * Always attempts to upsize for quality.
 */
function getMainImage(product) {
  if (!product) return null;
  const candidates = [];

  if (product?.images?.main) candidates.push(product.images.main);
  if (product?.images?.hero) candidates.push(product.images.hero);
  if (product?.images?.cover) candidates.push(product.images.cover);

  if (Array.isArray(product?.images)) {
    for (const it of product.images) {
      if (typeof it === "string") candidates.push(it);
      else if (it?.url) candidates.push(it.url);
    }
  }

  if (product?.imageMain) candidates.push(product.imageMain);
  if (product?.image) candidates.push(product.image);
  if (product?.media?.main) candidates.push(product.media.main);
  if (product?.media?.cover) candidates.push(product.media.cover);

  for (const raw of candidates) {
    const url = typeof raw === "string" ? raw : raw?.url;
    if (url && isAmazonUrl(url)) return upgradeAmazon(url);
  }
  return null;
}

/** Amazon gallery thumbs (up to N, excluding the main) */
function getGalleryImages(product, limit = 3) {
  const main = getMainImage(product);
  const pool = new Set();

  const tryPush = (u) => {
    if (u && isAmazonUrl(u) && u !== main) pool.add(upgradeAmazon(u));
  };

  if (Array.isArray(product?.images)) {
    for (const it of product.images) {
      const url = typeof it === "string" ? it : it?.url;
      tryPush(url);
      if (pool.size >= limit) break;
    }
  }
  if (product?.images?.gallery && Array.isArray(product.images.gallery)) {
    for (const url of product.images.gallery) {
      tryPush(url);
      if (pool.size >= limit) break;
    }
  }
  if (product?.images?.alt && Array.isArray(product.images.alt)) {
    for (const url of product.images.alt) {
      tryPush(url);
      if (pool.size >= limit) break;
    }
  }

  const arr = Array.from(pool);
  while (arr.length < Math.min(3, limit) && main) arr.push(main);
  return arr.slice(0, limit);
}

/** Deterministic pseudo-random selection (stable across builds) */
function hashStr(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h | 0);
}
function pickRandomStable(items = [], n = 5) {
  return items
    .slice()
    .sort((a, b) => (hashStr(a.slug) % 10000) - (hashStr(b.slug) % 10000))
    .slice(0, n);
}

/** Select up to 8 top categories by product count */
function topCategories(products = []) {
  const counts = new Map();
  for (const p of products) {
    const c = p?.category;
    if (!c) continue;
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  const list = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug, count]) => ({ slug, count, label: capitalizeLabel(slug) }));

  if (list.length === 0) {
    const defaults = ["laptops", "monitors", "graphics-cards", "keyboards", "mice", "headsets"];
    return defaults.map((slug) => ({ slug, count: 0, label: capitalizeLabel(slug) }));
  }
  return list;
}

/** First available Amazon main image from a list of products (newest first) */
function firstAmazonMain(products = []) {
  for (const p of [...products].sort(byDateDesc)) {
    const url = getMainImage(p);
    if (url) return { url, alt: `${p.title} cover image` };
  }
  return null;
}

/* Simple placeholder (no external images) to avoid CLS when missing) */
function Placeholder({ label, className = "" }) {
  const short =
    label?.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "…";
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 ${className}`}
    >
      <span className="text-lg font-semibold">{short}</span>
    </div>
  );
}

/* =========================================================
   SEO METADATA (OpenGraph uses first Amazon main image if present)
   ========================================================= */
const OG_IMAGE = firstAmazonMain(Array.isArray(db?.products) ? db.products : []);

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Tech Reviews",
    images: OG_IMAGE
      ? [{ url: OG_IMAGE.url, width: 1200, height: 630, alt: OG_IMAGE.alt }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* =========================================================
   PAGE (Server Component)
   ========================================================= */
export default function HomePage() {
  const products = Array.isArray(db?.products) ? db.products.slice() : [];
  const articles = Array.isArray(db?.articles) ? db.articles.slice() : [];

  const latest = products.sort(byDateDesc).slice(0, 8);
  const categories = topCategories(products);

  // --- HERO: 5 "random" (stable) reviews for the right-side carousel
  const heroSlides = pickRandomStable(products, 5);

  // Representative latest product per category (to pull its main image)
  const repByCategory = new Map();
  for (const p of products.sort(byDateDesc)) {
    if (p?.category && !repByCategory.has(p.category)) {
      repByCategory.set(p.category, p);
    }
  }

  const featured =
    articles.find((a) => a?.type === "guide") ||
    articles.find((a) => a?.type === "comparison") ||
    null;

  const featuredUrl = featured?.slug ? `/articles/${featured.slug}` : null;
  const featuredLabel =
    featured?.type === "guide"
      ? "Read the guide"
      : featured?.type === "comparison"
      ? "Read the comparison"
      : "Read more";

  // Featured thumbs: resolve referenced slugs to products
  let featuredThumbs = [];
  if (featured?.products && Array.isArray(featured.products)) {
    const prodBySlug = new Map(products.map((p) => [p.slug, p]));
    featuredThumbs = featured.products
      .map((ref) => (typeof ref === "string" ? prodBySlug.get(ref) : prodBySlug.get(ref?.slug)))
      .filter(Boolean)
      .slice(0, 3);
  }

  // JSON-LD
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: "Tech Reviews",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/reviews?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Reviews",
    itemListElement: latest.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/reviews/${p.slug}`,
      name: p.title,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ],
  };

  return (
    <>
      {/* Accessibility: Skip Link */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg shadow"
      >
        Skip to content
      </a>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      {latest.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main id="content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HERO — Left: heading & CTAs. Right: SCROLLABLE (5 random reviews)
           ========================================================= */}
        <section className="pt-10 pb-12 md:pt-16 md:pb-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Left column: text + CTAs */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                Smarter Tech Reviews. Actionable Picks.
              </h1>
              <p className="mt-4 text-gray-600 max-w-prose">
                We test the latest laptops, monitors, GPUs, and peripherals—so you can buy once,
                buy right. Clear recommendations, no fluff, performance you can trust.
              </p>
              <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Primary actions">
                <Link
                  href="/reviews"
                  aria-label="Browse reviews"
                  className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-3 text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  Browse Reviews
                </Link>
                <Link
                  href="/categories"
                  aria-label="View all categories"
                  className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-gray-900 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  All Categories
                </Link>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>

              {/* Internal linking */}
              <nav className="mt-6" aria-label="Internal links">
                <ul className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <li>
                    <Link href="/reviews" className="hover:text-gray-900 underline underline-offset-2">
                      Latest reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="hover:text-gray-900 underline underline-offset-2">
                      Browse by category
                    </Link>
                  </li>
                  <li>
                    <Link href="/articles" className="hover:text-gray-900 underline underline-offset-2">
                      All articles
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Right column: carousel (5 random) */}
            <div
              id="hero-right"
              className="relative w-full rounded-2xl overflow-hidden shadow ring-1 ring-gray-200 bg-white"
              aria-label="Featured reviews carousel"
              tabIndex={0}
            >
              {/* Track */}
              <div
                data-track
                className="
                  grid grid-flow-col auto-cols-[100%]
                  overflow-x-auto snap-x snap-mandatory scroll-smooth
                  h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px]
                  [-ms-overflow-style:none] [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                  bg-white
                "
              >
                {heroSlides.map((p, i) => {
                  const main = getMainImage(p);
                  return (
                    <Link
                      key={p.slug}
                      href={`/reviews/${p.slug}`}
                      aria-label={`Open review: ${p.title}`}
                      className="relative block snap-start"
                    >
                      {/* We use object-contain + quality to avoid crop & pixelation */}
                      {main ? (
                        <Image
                          src={main}
                          alt={p.title}
                          fill
                          quality={90}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain bg-white p-2 sm:p-3"
                          priority={i === 0}
                        />
                      ) : (
                        <Placeholder label={p.title} className="w-full h-full" />
                      )}

                      {/* subtle bottom overlay with title */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <div className="inline-block rounded-md bg-black/60 px-2 py-1 text-xs sm:text-sm text-white">
                          {p.title}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Arrows */}
              <button
                type="button"
                data-prev
                aria-label="Previous"
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-3 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-200 shadow hover:bg-white"
              >
                ‹
              </button>
              <button
                type="button"
                data-next
                aria-label="Next"
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-3 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 ring-1 ring-gray-200 shadow hover:bg-white"
              >
                ›
              </button>

              {/* Dots */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    data-goto
                    aria-label={`Go to slide ${i + 1}`}
                    className="pointer-events-auto h-2.5 w-2.5 rounded-full bg-black/60 opacity-40 transition-opacity"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Attach carousel logic after DOM exists */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function(){
  const root = document.getElementById('hero-right');
  if(!root) return;
  const track = root.querySelector('[data-track]');
  const slides = Array.from(track.children);
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const dots = Array.from(root.querySelectorAll('[data-goto]'));
  let idx = 0;

  const goto = (i) => {
    if(!slides.length) return;
    idx = (i + slides.length) % slides.length;
    const left = slides[idx].offsetLeft;
    track.scrollTo({ left, behavior: 'smooth' });
    dots.forEach((d,j)=>{ d.classList.toggle('opacity-100', j===idx); d.classList.toggle('opacity-40', j!==idx); });
  };

  // init
  setTimeout(()=>{ goto(0); }, 0);

  prev && prev.addEventListener('click', ()=>goto(idx-1));
  next && next.addEventListener('click', ()=>goto(idx+1));
  dots.forEach((d,i)=>d.addEventListener('click', ()=>goto(i)));

  // Keyboard navigation
  root.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight'){ e.preventDefault(); goto(idx+1); }
    if(e.key==='ArrowLeft'){ e.preventDefault(); goto(idx-1); }
  });

  // Update dots on manual scroll
  let ticking=false;
  track.addEventListener('scroll', () => {
    if(ticking) return;
    requestAnimationFrame(()=> {
      const sl = track.scrollLeft;
      let nearest=0, best=1e18;
      slides.forEach((s,i)=>{ const d=Math.abs(s.offsetLeft-sl); if(d<best){best=d; nearest=i;} });
      idx = nearest;
      dots.forEach((d,j)=>{ d.classList.toggle('opacity-100', j===idx); d.classList.toggle('opacity-40', j!==idx); });
      ticking=false;
    });
    ticking=true;
  }, {passive:true});

  // ===============================
  // Auto-play every 4s + Pause logic
  // ===============================
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  function startAutoplay(){
    if (prefersReduced) return; // respect user setting
    stopAutoplay();
    timer = setInterval(()=>{ goto(idx+1); }, 4000);
  }
  function stopAutoplay(){
    if (timer){ clearInterval(timer); timer = null; }
  }

  // Pause on hover/focus within the carousel
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Pause when not on screen (IntersectionObserver)
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      const onScreen = entries.some(e=>e.isIntersecting);
      if (onScreen) startAutoplay(); else stopAutoplay();
    }, { threshold: 0.3 });
    io.observe(root);
  } else {
    // Fallback: just start
    startAutoplay();
  }

  // Start initially
  startAutoplay();
})();`,
            }}
          />
        </section>

        {/* Quick Categories — show main image of most recent product per category */}
        <section className="py-10 border-t border-gray-100">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Quick Categories</h2>
            <p className="mt-1 text-gray-600">Jump straight into the gear you care about most.</p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat) => {
              const rep = repByCategory.get(cat.slug);
              const thumb = rep ? getMainImage(rep) : null;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  aria-label={`Open ${cat.label} category`}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-gray-900">{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.count} items</div>
                    </div>
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-white">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={`${cat.label} thumbnail`}
                          fill
                          quality={85}
                          sizes="(max-width: 1024px) 20vw, 160px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Placeholder label={cat.label} className="h-full w-full" />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Curated picks, specs, and honest pros/cons.
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Latest Reviews — (kept as before; uses getMainImage which upsizes) */}
        <section className="py-10 border-t border-gray-100">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Latest Reviews</h2>
          </header>

          {latest.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p) => {
                const cover = getMainImage(p);
                return (
                  <article
                    key={p.slug}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`${p.title} cover image`}
                          fill
                          quality={85}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Placeholder label={p.title} className="w-full h-full" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {p.category && (
                          <Link
                            href={`/categories/${p.category}`}
                            className="hover:text-gray-700"
                            aria-label={`Open ${p.category} category`}
                          >
                            {capitalizeLabel(p.category)}
                          </Link>
                        )}
                        {p.date && <span aria-hidden="true">•</span>}
                        {p.date && <time dateTime={p.date}>{formatDate(p.date)}</time>}
                      </div>

                      <h3 className="mt-2 text-lg font-semibold text-gray-900">
                        <Link
                          href={`/reviews/${p.slug}`}
                          aria-label={`Read review: ${p.title}`}
                          className="hover:underline underline-offset-2"
                        >
                          {p.title}
                        </Link>
                      </h3>

                      {p.intro && (
                        <p
                          className="mt-2 text-sm text-gray-600"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.intro}
                        </p>
                      )}

                      <div className="mt-4">
                        <Link
                          href={`/reviews/${p.slug}`}
                          aria-label={`Read the full review for ${p.title}`}
                          className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                          Read review
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <footer className="mt-4">
            <p className="text-xs text-gray-500">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </footer>
        </section>

        {/* Featured Article — use main images of referenced products */}
        {featured && featuredUrl && (
          <section className="py-10 border-t border-gray-100">
            <header className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Featured Article</h2>
              <p className="mt-1 text-gray-600">
                Our latest {featured.type}: {featured.title}
              </p>
            </header>

            <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="relative md:col-span-2 h-60 md:h-auto bg-white">
                  {(() => {
                    const c =
                      (featuredThumbs.length && getMainImage(featuredThumbs[0])) ||
                      (firstAmazonMain(products)?.url) ||
                      null;
                    return c ? (
                      <Image
                        src={c}
                        alt={`${featured.title} cover image`}
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-contain p-1"
                      />
                    ) : (
                      <Placeholder label={featured.title} className="w-full h-full" />
                    );
                  })()}
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-gray-900">{featured.title}</h3>
                  {featured.intro && <p className="mt-2 text-gray-600">{featured.intro}</p>}

                  {featuredThumbs.length > 0 && (
                    <ul className="mt-4 flex -space-x-2" aria-label="Products featured">
                      {featuredThumbs.map((fp) => {
                        const c = getMainImage(fp);
                        return (
                          <li
                            key={fp.slug}
                            className="relative h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-white"
                            title={fp.title}
                          >
                            {c ? (
                              <Image
                                src={c}
                                alt={fp.title}
                                fill
                                quality={80}
                                sizes="40px"
                                className="object-contain p-0.5"
                              />
                            ) : (
                              <Placeholder label={fp.title} className="h-full w-full" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="mt-6">
                    <Link
                      href={featuredUrl}
                      aria-label={`${featuredLabel}: ${featured.title}`}
                      className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      {featuredLabel}
                    </Link>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    As an Amazon Associate, we earn from qualifying purchases.
                  </p>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Bottom navigation / internal links */}
        <section className="py-10 border-t border-gray-100">
          <nav aria-label="Explore more">
            <ul className="flex flex-wrap gap-3 text-sm">
              <li>
                <Link
                  href="/reviews"
                  className="rounded-lg bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50"
                >
                  Explore Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="rounded-lg bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/articles"
                  className="rounded-lg bg-white px-3 py-2 text-gray-900 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50"
                >
                  Read Articles
                </Link>
              </li>
            </ul>
          </nav>
        </section>
      </main>
    </>
  );
}
