'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from './components/UI/navbar';
import Hero from './components/pages/home/hero';
import NewsCard from './components/UI/NewsCard';
import Footer from './components/UI/footer';

interface Article {
  image?: string;
  title: string;
  source: string;
  date: string;
  link: string;
}

const INITIAL_DISPLAY_COUNT = 6;

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtrage des articles selon la recherche (titre + source)
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase().trim();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  // Réinitialise le nombre visible quand la recherche change
  useEffect(() => {
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }, [searchQuery]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + INITIAL_DISPLAY_COUNT);
  };

  const handleExplore = () => {
    articlesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Scroll vers les articles lors d'une recherche active
    if (query.trim()) {
      articlesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onSearch={handleSearch} />
      <Hero onExplore={handleExplore} />

      <div ref={articlesRef} className="flex-grow max-w-7xl mx-auto px-6 py-12">

        {/* En-tête de section */}
        {searchQuery.trim() ? (
          <h2 className="text-center text-gray-600 mb-8">
            {filteredArticles.length === 0
              ? `Aucun article trouvé pour « ${searchQuery} »`
              : `${filteredArticles.length} résultat${filteredArticles.length > 1 ? 's' : ''} pour « ${searchQuery} »`}
          </h2>
        ) : (
          <h2 className="text-center text-gray-600 mb-8">
            Explore the latest RSE news and trends from trusted sources.
          </h2>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-r-transparent mb-4" />
            <p className="text-gray-500">Loading RSE news...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-gray-500">
            {searchQuery.trim()
              ? `Aucun article ne correspond à votre recherche.`
              : 'No articles available.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(0, visibleCount).map((article, index) => (
              <a href={article.link} target="_blank" rel="noopener noreferrer" key={index}>
                <NewsCard
                  image={article.image || 'https://via.placeholder.com/400'}
                  title={article.title}
                  source={article.source || 'Unknown'}
                  date={article.date || 'N/A'}
                />
              </a>
            ))}
          </div>
        )}

        {visibleCount < filteredArticles.length && (
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
