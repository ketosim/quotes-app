'use client';

import { useState, useEffect } from 'react';

interface Quote {
  id: string;
  quote: string;
  author: string;
  title: string;
  tag: string;
}

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNextQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quotes/next');
      const data = await response.json();
      setCurrentQuote(data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuote();
  }, []);

  const handleTap = () => {
    fetchNextQuote();
  };

  if (loading && !currentQuote) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!currentQuote) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">No quotes available</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6"
      onClick={handleTap}
    >
      <div className="max-w-2xl w-full space-y-6 text-center">
        <p className="text-3xl md:text-4xl leading-relaxed">
          "{currentQuote.quote}"
        </p>
        <p className="text-xl text-gray-400">
          — {currentQuote.author}
        </p>
        {currentQuote.tag && (
          <p className="text-sm text-gray-500">
            #{currentQuote.tag}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-8">
          Tap anywhere for next quote
        </p>
      </div>
    </div>
  );
}