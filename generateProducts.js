require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const OpenAI = require('openai');

// 🔑 Récupération des clés depuis .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!OPENAI_API_KEY || !UNSPLASH_ACCESS_KEY) {
  console.error("❌ Erreur : Vérifie que tes clés sont bien définies dans le fichier .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function generateProduct(keyword) {
  try {
    // Génération du contenu via GPT
    const prompt = `
    Génère un objet JSON pour un produit tech à partir du mot-clé "${keyword}" avec les champs :
    slug, title, intro, features (5), specs (clé/valeur), sections (3, heading+content), faq (2), verdict, pros (2), cons (2), images (2 URLs Unsplash), date (YYYY-MM-DD), ctaText, layoutType ("review"), conclusion.
    Réponds uniquement avec l'objet JSON.
    `;

    const completion = await openai.chat.completions.create({
	  model: 'gpt-4o-mini', // ou 'gpt-4o' / 'gpt-4.1' selon ton choix
	  messages: [{ role: 'user', content: prompt }],
	  temperature: 0.7,
	});

	let product = JSON.parse(completion.choices[0].message.content);


    // 🔎 Ajout d'images Unsplash
    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=2&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const unsplashData = await unsplashRes.json();
    product.images = unsplashData.results.map(img => img.urls.regular);

    // Génération d'un slug unique
    product.slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ajout de la date du jour
    product.date = new Date().toISOString().slice(0, 10);

    return product;
  } catch (err) {
    console.error(`❌ Erreur lors de la génération du produit "${keyword}":`, err);
    return null;
  }
}

async function main() {
  const keywords = ['best gaming PC under 1000', 'best monitor for gaming', 'cheap gaming mouse under 50']; // À personnaliser
  let products = [];

  // Charger les produits existants si le fichier existe
  if (fs.existsSync('products.json')) {
    products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
  }

  for (const keyword of keywords) {
    const product = await generateProduct(keyword);
    if (product) {
      products.push(product);
      console.log(`✅ Ajouté : ${product.title}`);
    }
  }

  fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  console.log("📂 Fichier products.json mis à jour !");
}

main();
