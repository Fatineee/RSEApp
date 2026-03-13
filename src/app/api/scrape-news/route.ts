// app/api/scrape-news/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Désactive le cache statique — chaque requête recrée le scraping.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Étend le timeout Vercel à 60s.
// ⚠️  Vercel Hobby limite à 10s par défaut. Si vous êtes sur Hobby,
//     montez en Pro ou externalisez le scraping (cron + base de données).
export const maxDuration = 60;

// ─── Types ───────────────────────────────────────────────────────────────────

interface NewsSource {
  name: string;
  url: string;
  articleSelector: string;
  titleSelector: string;
  linkSelector: string;
  imageSelector: string;
  dateSelector?: string;
}

interface Article {
  source: string;
  title: string;
  link: string;
  image?: string;
  date?: string;
}

// ─── Sources ──────────────────────────────────────────────────────────────────

const sources: NewsSource[] = [
  { name: "Carenews",        url: "https://www.carenews.com/rse",                              articleSelector: ".article",                  titleSelector: "h2",                       linkSelector: "a", imageSelector: "img" },
  { name: "Mediatico",       url: "https://mediatico.fr/category/actualite/",                  articleSelector: ".post-list-archive__post__hero", titleSelector: "h4",                  linkSelector: "a", imageSelector: "img" },
  { name: "Green IT",        url: "https://www.greenit.fr/",                                   articleSelector: "article",                   titleSelector: ".h2",                      linkSelector: "a", imageSelector: "img" },
  { name: "L'Info Durable",  url: "https://www.linfodurable.fr/aujourdhui/actualites",         articleSelector: "article",                   titleSelector: "h2",                       linkSelector: "a", imageSelector: "img", dateSelector: "time.fs-14.color-grey-semidark" },
  { name: "Agence Déclic",   url: "https://www.agence-declic.fr/categories/actualite-article-rse/", articleSelector: ".c-actualites__item",  titleSelector: ".c-actualites__itemtitle", linkSelector: "a", imageSelector: "img", dateSelector: "span.c-actualites__itemdate" },
  { name: "Innovation24",    url: "https://www.innovation24.news/category/rse/",               articleSelector: ".post",                     titleSelector: ".entry-title",             linkSelector: "a", imageSelector: "img", dateSelector: ".updated" },
  { name: "Ross Engineering", url: "https://www.ross-eng.com/news/",                           articleSelector: "article",                   titleSelector: "h2",                       linkSelector: "a", imageSelector: "img", dateSelector: ".b-card__top--left" },
];

// ─── User-agents rotatifs ─────────────────────────────────────────────────────

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

// ─── Scraping d'une source ────────────────────────────────────────────────────

async function scrapeWebsite(site: NewsSource): Promise<{ source: string; articles: Article[] }> {
  try {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    // Délai court (100-400 ms) pour ne pas hammerer les serveurs
    // mais sans peser sur le timeout Vercel (≠ 1-3 s avant)
    await new Promise(r => setTimeout(r, 100 + Math.random() * 300));

    const { data } = await axios.get(site.url, {
      headers: {
        'User-Agent': userAgent,
        'Referer':    site.url,
        'Cache-Control': 'no-cache',
        'Pragma':     'no-cache',
      },
      // 8 s max par source — laisse de la marge dans le budget total
      timeout: 8000,
    });

    const $ = cheerio.load(data);
    const articles: Article[] = [];

    $(site.articleSelector).each((_i, el) => {
      const title =
        $(el).find(site.titleSelector).text().trim() ||
        $(el).find('h2, h3, .title').text().trim();

      let link =
        $(el).find(site.linkSelector).attr('href') ||
        $(el).find('a').attr('href');

      // Extraction d'image (lazy-load, data-src…)
      const imgEl = $(el).find(site.imageSelector).first();
      let image: string | undefined =
        imgEl.attr('src') ||
        imgEl.attr('data-src') ||
        imgEl.attr('data-lazy-src') ||
        imgEl.parent().attr('data-bg') ||
        imgEl.css('background-image')?.replace(/^url\(['"]?(.+?)['"]?\)/, '$1');

      if (!image) {
        const srcset = imgEl.attr('data-srcset');
        if (srcset) image = srcset.split(',')[0].split(' ')[0];
      }

      const date =
        $(el).find(site.dateSelector || '.date, .post-date, .article-date, time').text().trim() ||
        $(el).find('[datetime]').attr('datetime');

      // Normalisation des URLs relatives
      if (link && !link.startsWith('http')) {
        try { link = new URL(link, site.url).href; }
        catch { return; }
      }
      if (image && !image.startsWith('http')) {
        try {
          image = image.replace(/^\/\//, 'https://');
          if (!image.match(/^https?:\/\//)) image = new URL(image, site.url).href;
        } catch { image = undefined; }
      }
      if (image) {
        try { new URL(image); }
        catch { image = undefined; }
      }

      if (title && link) {
        articles.push({
          source: site.name,
          title: title.replace(/\s+/g, ' '),
          link,
          image,
          date,
        });
      }
    });

    console.log(`✅ ${articles.length} articles — ${site.name}`);
    return { source: site.name, articles };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ ${site.name}: ${error.message} (status: ${error.response?.status ?? 'N/A'})`);
    } else {
      console.error(`❌ ${site.name}:`, error instanceof Error ? error.message : String(error));
    }
    // On ne plante pas tout le GET : on retourne un tableau vide pour cette source
    return { source: site.name, articles: [] };
  }
}

// ─── Handler GET ──────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // Toutes les sources en parallèle → temps total ≈ max(sources) au lieu de Σ(sources)
    // C'est la correction principale du problème de 504 en production.
    const results = await Promise.all(sources.map(scrapeWebsite));

    const allArticles = results.flatMap(r => r.articles);

    // Dédoublonnage par URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.link, a])).values()
    );

    return NextResponse.json(
      { success: true, count: uniqueArticles.length, articles: uniqueArticles },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma':  'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error('🔥 Global error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        articles: [],
      },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
