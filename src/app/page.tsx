'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from './components/UI/navbar';
import Hero from './components/pages/home/hero';
import NewsCard from './components/UI/NewsCard';
import Footer from './components/UI/footer';

interface Article {
  image?: string;
  title: string;
  source: string;  // ✅ Added source
  date: string;    // ✅ Added date
  link: string;
}

const INITIAL_DISPLAY_COUNT = 6; 

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articlesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await fetch('/api/scrape-news', { cache: 'no-store' });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + INITIAL_DISPLAY_COUNT);
  };

  const handleExplore = () => {
    articlesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero onExplore={handleExplore} />

      <div ref={articlesRef} className="flex-grow max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-center text-gray-600 mb-8">
          Explore the latest RSE news and trends from trusted sources.
        </h2>

        {loading ? (
          <div className="text-center">Loading RSE news...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : articles.length === 0 ? (
          <p className="text-center text-gray-500">No articles available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, visibleCount).map((article, index) => (
              <a href={article.link} target="_blank" rel="noopener noreferrer" key={index}>
                <NewsCard
                  image={article.image || 'https://via.placeholder.com/400'}
                  title={article.title}
                  source={article.source || 'Unknown'}  // ✅ Pass source
                  date={article.date || 'N/A'}         // ✅ Pass date
                />
              </a>
            ))}
          </div>
        )}

        {visibleCount < articles.length && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
