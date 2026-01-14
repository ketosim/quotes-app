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
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased'        
      }}
    >
      {/* Main content */}
      <div 
        onClick={handleTap}
        style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: 'max(4rem, calc(env(safe-area-inset-top) + 2rem))',
          paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 5rem))',
          cursor: isEditing ? 'default' : 'pointer',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        {!isEditing ? (
          // Display mode
          <div style={{ maxWidth: '48rem', width: '100%' }}>
            {currentQuote.title && (
              <h2 
                style={{ 
                  fontSize: '0.875rem',
                  color: 'rgb(156, 163, 175)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-lora)',
                  letterSpacing: '0.025em',
                  marginBottom: '1.5rem',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                {currentQuote.title}
              </h2>
            )}
            
            <blockquote 
              style={{ 
                fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                lineHeight: '1.6',
                textAlign: 'center',
                color: 'white',
                fontFamily: 'Georgia, serif',
                WebkitFontSmoothing: 'antialiased',
                textRendering: 'optimizeLegibility',
                marginBottom: '1.5rem'
              }}
            >
              {currentQuote.quote}
            </blockquote>

            <p 
              style={{ 
                fontSize: '1.25rem',
                color: 'rgb(209, 213, 219)',
                textAlign: 'center',
                fontFamily: 'var(--font-lora)',
                WebkitFontSmoothing: 'antialiased',
                marginBottom: '1.5rem'
              }}
            >
              — {currentQuote.author}
            </p>
            
            {currentQuote.tag && (
              <p style={{ 
                fontSize: '0.875rem',
                color: 'rgb(107, 114, 128)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-lora)'
              }}>
                {currentQuote.tag}
              </p>
            )}
          </div>
        ) : (
          // Edit mode
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '42rem', width: '100%' }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgb(156, 163, 175)',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-inter)'
              }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Quote title"
                style={{ 
                  width: '100%',
                  background: 'rgb(31, 41, 55)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgb(55, 65, 81)',
                  outline: 'none',
                  fontSize: '16px',
                  fontFamily: 'var(--font-inter)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgb(156, 163, 175)',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-inter)'
              }}>
                Author *
              </label>
              <input
                type="text"
                value={editForm.author}
                onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                placeholder="Author name"
                required
                style={{ 
                  width: '100%',
                  background: 'rgb(31, 41, 55)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgb(55, 65, 81)',
                  outline: 'none',
                  fontSize: '16px',
                  fontFamily: 'var(--font-inter)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgb(156, 163, 175)',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-inter)'
              }}>
                Tag (optional)
              </label>
              <input
                type="text"
                value={editForm.tag}
                onChange={(e) => setEditForm({...editForm, tag: e.target.value})}
                placeholder="e.g., motivation, wisdom"
                style={{ 
                  width: '100%',
                  background: 'rgb(31, 41, 55)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgb(55, 65, 81)',
                  outline: 'none',
                  fontSize: '16px',
                  fontFamily: 'var(--font-inter)'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgb(156, 163, 175)',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-inter)'
              }}>
                Quote *
              </label>
              <textarea
                value={editForm.quote}
                onChange={(e) => setEditForm({...editForm, quote: e.target.value})}
                placeholder="Quote text"
                required
                style={{ 
                  width: '100%',
                  background: 'rgb(31, 41, 55)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgb(55, 65, 81)',
                  outline: 'none',
                  fontSize: '16px',
                  minHeight: '200px',
                  resize: 'none',
                  fontFamily: 'var(--font-inter)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons at bottom center - with inline styles */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.6), transparent)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        {!isEditing ? (
          <>
            <button
              onClick={handleEdit}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                fontFamily: 'var(--font-inter)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                fontFamily: 'var(--font-inter)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#f87171';
              }}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                fontFamily: 'var(--font-inter)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
            >
              ✓ Save
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                fontFamily: 'var(--font-inter)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}