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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    tag: '',
    quote: ''
  });

  const fetchNextQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quotes/next');
      const data = await response.json();
      setCurrentQuote(data);
      setIsEditing(false);
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
    if (!isEditing) {
      fetchNextQuote();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQuote) return;
    
    setEditForm({
      title: currentQuote.title || '',
      author: currentQuote.author,
      tag: currentQuote.tag || '',
      quote: currentQuote.quote
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQuote) return;

    try {
      await fetch(`/api/quotes/${currentQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      setCurrentQuote({
        ...currentQuote,
        ...editForm
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote');
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentQuote) return;
    
    if (confirm('Delete this quote?')) {
      try {
        await fetch(`/api/quotes/${currentQuote.id}`, {
          method: 'DELETE'
        });
        fetchNextQuote();
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Failed to delete quote');
      }
    }
  };

  if (loading && !currentQuote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <p className="text-xl font-light">Gathering thoughts...</p>
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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col"
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* iOS Safe Area padding */}
      <div 
        className="fixed top-0 right-0 z-10 flex gap-3 p-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))'
        }}
      >
        {!isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white px-5 py-2.5 rounded-full text-base font-medium shadow-lg border border-gray-700 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-gray-800 hover:bg-red-900 active:bg-red-800 text-red-400 hover:text-red-300 px-5 py-2.5 rounded-full text-base font-medium shadow-lg border border-gray-700 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2.5 rounded-full text-base font-medium shadow-lg transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white px-6 py-2.5 rounded-full text-base font-medium shadow-lg transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Main content */}
      <div 
        className="flex-1 flex items-center justify-center px-6 py-8"
        onClick={handleTap}
        style={{ 
          cursor: isEditing ? 'default' : 'pointer',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          paddingTop: 'max(6rem, calc(env(safe-area-inset-top) + 4rem))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right))'
        }}
      >
        {!isEditing ? (
          // Display mode
          <div className="max-w-3xl w-full space-y-6">
            {currentQuote.title && (
              <h2 
                className="text-sm text-gray-400 text-right font-lora tracking-wide"
                style={{ WebkitFontSmoothing: 'antialiased' }}
              >
                {currentQuote.title}
              </h2>
            )}
            
            <blockquote 
              className="text-3xl sm:text-4xl md:text-5xl leading-relaxed text-center text-white"
              style={{ 
                fontFamily: 'Georgia, serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility'
              }}
            >
              {currentQuote.quote}
            </blockquote>

            <p 
              className="text-xl text-gray-300 text-center font-lora"
              style={{ WebkitFontSmoothing: 'antialiased' }}
            >
              — {currentQuote.author}
            </p>
            
            {currentQuote.tag && (
              <p className="text-sm text-gray-500 text-center tracking-wider uppercase font-lora">
                {currentQuote.tag}
              </p>
            )}
            
            <p className="text-sm text-gray-600 text-center mt-8 font-lora">
              Tap anywhere for next quote
            </p>
          </div>
        ) : (
          // Edit mode - iOS optimized
          <div 
            className="max-w-2xl w-full space-y-5" 
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-sans">Title (optional)</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none text-base font-sans"
                placeholder="Quote title"
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-sans">Author *</label>
              <input
                type="text"
                value={editForm.author}
                onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none text-base font-sans"
                placeholder="Author name"
                required
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-sans">Tag (optional)</label>
              <input
                type="text"
                value={editForm.tag}
                onChange={(e) => setEditForm({...editForm, tag: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none text-base font-sans"
                placeholder="e.g., motivation, wisdom"
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-sans">Quote *</label>
              <textarea
                value={editForm.quote}
                onChange={(e) => setEditForm({...editForm, quote: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none text-base min-h-[200px] font-sans resize-none"
                placeholder="Quote text"
                required
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}