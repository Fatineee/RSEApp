// app/api/scrape-news/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
export const revalidate = 3600;

// Define source types
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

const sources: NewsSource[] = [
  { name: "Carenews", url: "https://www.carenews.com/rse", articleSelector: ".article", titleSelector: "h2", linkSelector: "a", imageSelector: "img" },
  { name: "Mediatico", url: "https://mediatico.fr/category/actualite/", articleSelector: ".post-list-archive__post__hero", titleSelector: "h4", linkSelector: "a", imageSelector: "img"},
  { name: "Green IT", url: "https://www.greenit.fr/", articleSelector: "article", titleSelector: ".h2", linkSelector: "a", imageSelector: "img" },
  { name: "L'Info Durable", url: "https://www.linfodurable.fr/aujourdhui/actualites", articleSelector: "article", titleSelector: "h2", linkSelector: "a", imageSelector: "img", dateSelector:"time.fs-14.color-grey-semidark" },
  { name: "Agence Déclic", url: "https://www.agence-declic.fr/categories/actualite-article-rse/", articleSelector: ".c-actualites__item", titleSelector: ".c-actualites__itemtitle", linkSelector: "a", imageSelector: "img", dateSelector:"span.c-actualites__itemdate" },
  { name: "Innovation24", url: "https://www.innovation24.news/category/rse/", articleSelector: ".post", titleSelector: ".entry-title", linkSelector: "a", imageSelector: "img", dateSelector: ".updated" },
  { name: "Ross Engineering", url: "https://www.ross-eng.com/news/", articleSelector: "article", titleSelector: "h2", linkSelector: "a", imageSelector: "img", dateSelector:".b-card__top--left" }
];


// Add random delay to avoid overwhelming the servers
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeWebsite(site: NewsSource): Promise<{source: string; articles: Article[]}> {
  try {
    // Rotate user agents to avoid being blocked
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Add a random delay between 1-3 seconds to avoid rate limiting
    await sleep(1000 + Math.random() * 2000);
    
    const { data } = await axios.get(site.url, {
      headers: {
        "User-Agent": randomUserAgent,
        "Referer": site.url,
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      timeout: 10000 // 10 second timeout
    });
    
    const $ = cheerio.load(data);
    const articles: Article[] = [];

    $(site.articleSelector).each((index, element) => {
      const title = $(element).find(site.titleSelector).text().trim() || 
                   $(element).find('h2, h3, .title').text().trim();
      
      let link = $(element).find(site.linkSelector).attr("href") || 
                $(element).find('a').attr("href");
      
      // Enhanced image extraction
      let image = undefined;
      const imgElement = $(element).find(site.imageSelector).first();
      
      // Try multiple attributes for image URL
      image = imgElement.attr("src") || 
              imgElement.attr("data-src") || 
              imgElement.attr("data-lazy-src") ||
              imgElement.parent().attr("data-bg") || // Some sites use background images
              imgElement.css("background-image")?.replace(/^url\(['"](.+)['"]\)/, '$1');

      // Handle lazy loading images
      if (!image) {
        const dataSrcset = imgElement.attr("data-srcset");
        if (dataSrcset) {
          // Get the first image from srcset
          image = dataSrcset.split(',')[0].split(' ')[0];
        }
      }

      const date = $(element).find(site.dateSelector || '.date, .post-date, .article-date, time').text().trim() || 
                  $(element).find('[datetime]').attr('datetime');

      // URL normalization
      if (link && !link.startsWith("http")) {
        try {
          link = new URL(link, site.url).href;
        } catch (e) {
          console.warn(`❗ Could not parse URL: ${link} from ${site.name} error :${e} `);
          return;
        }
      }
      
      if (image && !image.startsWith("http")) {
        try {
          // Remove any leading '//' from image path
          image = image.replace(/^\/\//, 'https://');
          if (!image.match(/^https?:\/\//)) {
            image = new URL(image, site.url).href;
          }
        } catch (e) {
          console.warn(`❗ Could not parse image URL: ${image} from ${site.name} error :${e}`);
          image = undefined;
        }
      }

      // Validate image URL
      if (image) {
        try {
          new URL(image);
        } catch (e) {
          console.warn(`❗ Invalid image URL: ${image} from ${site.name} error :${e}`);
          image = undefined;
        }
      }

      if (title && link) {
        articles.push({ 
          source: site.name, 
          title: title.replace(/\s+/g, ' '),
          link, 
          image,
          date 
        });
      }
    });

    console.log(`✅ Successfully scraped ${articles.length} articles from ${site.name}`);
    return { source: site.name, articles };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error scraping ${site.name}: ${error.message} - Status: ${error.response?.status || 'N/A'}`);
    } else {
      console.error(`❌ Error scraping ${site.name}:`, error instanceof Error ? error.message : String(error));
    }
    return { source: site.name, articles: [] }; // Return empty array on error
  }
}

export async function GET() {
  try {
    // Scrape in batches to avoid overwhelming the server
    const batchSize = 3;
    const results = [];
    
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(scrapeWebsite));
      results.push(...batchResults);
      
      // Add a delay between batches
      if (i + batchSize < sources.length) {
        await sleep(2000); // 2 seconds between batches
      }
    }

    // Flatten results to a single array of articles
    const allArticles = results.flatMap(site => site.articles);
    
    // Filter out any duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.link, article])).values()
    );
    
    return NextResponse.json({
      success: true,
      count: uniqueArticles.length,
      articles: uniqueArticles
    }, { status: 200 });
  } catch (error) {
    console.error('🔥 Global error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      articles: []
    }, { status: 500 });
  }
}