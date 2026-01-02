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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <p className="text-xl font-light">Gethering thoughts...</p>
      </div>
    );
  }

  if (!currentQuote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl mb-4">No quotes available</p>
          <a href="/admin" className="text-blue-400 underline">
            Add your first quote
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6 cursor-pointer select-none"
      onClick={handleTap}
    >
      <div className="max-w-3xl w-full space-y-8">
        {/* Title */}
        {currentQuote.title && (
          <h2 className="text-lg md:text-xl text-gray-400 text-center font-light tracking-wide">
            {currentQuote.title}
          </h2>
        )}
        
       {/* Quote */}
        <blockquote className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-center">
          {currentQuote.quote}
        </blockquote>

        {/* Author */}
        <p className="text-xl md:text-2xl text-gray-300 text-center font-light">
          — {currentQuote.author}
        </p>
        
        {/* Tag */}
        {currentQuote.tag && (
          <p className="text-sm text-gray-500 text-center tracking-wider uppercase">
            {currentQuote.tag}
          </p>
        )}
        
        {/* Tap instruction */}
        <p className="text-sm text-gray-600 text-center mt-12 font-light animate-pulse">
          Tap anywhere for next quote
        </p>
      </div>
    </div>
  );
}