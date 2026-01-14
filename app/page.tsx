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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Action buttons - fixed at top right corner */}
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        {!isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="bg-gray-800/90 hover:bg-gray-700 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-700 transition-all touch-manipulation"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-gray-800/90 hover:bg-red-900/80 backdrop-blur-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-700 transition-all touch-manipulation"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all touch-manipulation"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all touch-manipulation"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Main content */}
      <div 
        className="flex-1 flex items-center justify-center p-6 pt-24 select-none"
        onClick={handleTap}
        style={{ cursor: isEditing ? 'default' : 'pointer' }}
      >
        {!isEditing ? (
          // Display mode
          <div className="max-w-3xl w-full space-y-8">
            {currentQuote.title && (
              <h2 className="text-lg md:text-xl text-gray-400 text-center font-lora tracking-wide">
                {currentQuote.title}
              </h2>
            )}
            
            <blockquote 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-center text-gray-100"
              style={{ fontFamily: 'Georgia, serif' }}
            >
                {currentQuote.quote}
            </blockquote>

            <p className="text-xl md:text-2xl text-gray-300 text-center font-lora">
              — {currentQuote.author}
            </p>
            
            {currentQuote.tag && (
              <p className="text-sm text-gray-500 text-center tracking-wider uppercase font-lora">
                {currentQuote.tag}
              </p>
            )}
            
            <p className="text-sm text-gray-600 text-center mt-12 font-lora animate-pulse">
              Tap anywhere for next quote
            </p>
          </div>
        ) : (
          // Edit mode
          <div className="max-w-2xl w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-base"
                placeholder="Quote title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Author *</label>
              <input
                type="text"
                value={editForm.author}
                onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-base"
                placeholder="Author name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Tag (optional)</label>
              <input
                type="text"
                value={editForm.tag}
                onChange={(e) => setEditForm({...editForm, tag: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-base"
                placeholder="e.g., motivation, wisdom"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Quote *</label>
              <textarea
                value={editForm.quote}
                onChange={(e) => setEditForm({...editForm, quote: e.target.value})}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-base min-h-[200px]"
                placeholder="Quote text"
                required
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}