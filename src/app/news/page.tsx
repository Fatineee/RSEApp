// app/news/page.tsx
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Article {
  source: string;
  title: string;
  link: string;
  image?: string;
  date?: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await fetch('/api/scrape-news', {
          cache: 'no-store',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading Super Atlas news...</h2>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-2xl">
        <h2 className="text-xl font-medium text-red-700">Error loading Super Atlas news</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Super Atlas RSE News</h1>
      
      {articles.length === 0 ? (
        <p className="text-lg text-gray-600">No articles found. Please try again later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <a 
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              key={`${article.source}-${index}`}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-100">
                {article.image ? (
                  <Image 
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={(e) => {
                      // Replace broken image with placeholder
                      const imgElement = e.currentTarget as HTMLImageElement;
                      imgElement.src = 'https://via.placeholder.com/800x450?text=No+Image+Available';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <p className="text-sm font-medium text-blue-600 mb-1">{article.source}</p>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h2>
                {article.date && (
                  <p className="text-sm text-gray-500 mt-2">{article.date}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
