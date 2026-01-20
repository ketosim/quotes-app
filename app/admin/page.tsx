'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Quote {
  id: string;
  title: string;
  author: string;
  tag: string;
  quote: string;
  lastShown: string;
  timesShown: number;
}

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    tag: '',
    quote: ''
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [bulkText, setBulkText] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await fetch(`/api/quotes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      await fetchQuotes();
      setFormData({ title: '', author: '', tag: '', quote: '' });
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const handleEdit = (quote: Quote) => {
    setFormData({
      title: quote.title,
      author: quote.author,
      tag: quote.tag,
      quote: quote.quote
    });
    setEditingId(quote.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      await fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', author: '', tag: '', quote: '' });
  };

  const handleBulkUpload = async () => {
    try {
      const lines = bulkText.trim().split('\n');
      const quotes = lines.map(line => {
        const parts = line.split('","').map(p => p.replace(/"/g, ''));
        
        if (parts.length >= 2) {
          return {
            quote: parts[0],
            author: parts[1],
            title: parts[2] || '',
            tag: parts[3] || ''
          };
        }
        return null;
      }).filter(q => q !== null);

      const response = await fetch('/api/quotes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotes })
      });

      const result = await response.json();
      alert(`Success! Added ${result.created} quotes. ${result.errors} errors.`);
      
      if (result.created > 0) {
        await fetchQuotes();
        setBulkText('');
        setShowBulkUpload(false);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Failed to upload quotes');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ fontSize: '1.25rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))',
      color: 'white',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Manage Quotes</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgb(220, 38, 38)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(185, 28, 28)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(220, 38, 38)'}
            >
              Logout
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              style={{
                background: 'rgb(147, 51, 234)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(126, 34, 206)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(147, 51, 234)'}
            >
              Bulk Upload
            </button>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                background: 'rgb(37, 99, 235)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(29, 78, 216)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(37, 99, 235)'}
            >
              Add New Quote
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div style={{ background: 'rgb(31, 41, 55)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              {editingId ? 'Edit Quote' : 'Add New Quote'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Title (optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{
                    width: '100%',
                    background: 'rgb(55, 65, 81)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., On Passion"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  style={{
                    width: '100%',
                    background: 'rgb(55, 65, 81)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Steve Jobs"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tag (optional)</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  style={{
                    width: '100%',
                    background: 'rgb(55, 65, 81)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., motivation, wisdom"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Quote *</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({...formData, quote: e.target.value})}
                  style={{
                    width: '100%',
                    background: 'rgb(55, 65, 81)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    height: '8rem',
                    color: 'white',
                    border: 'none',
                    resize: 'vertical',
                    fontSize: '16px'
                  }}
                  placeholder="Enter the quote..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  style={{
                    background: 'rgb(22, 163, 74)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(21, 128, 61)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(22, 163, 74)'}
                >
                  {editingId ? 'Update' : 'Add'} Quote
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: 'rgb(75, 85, 99)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(55, 65, 81)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(75, 85, 99)'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Upload Form */}
        {showBulkUpload && (
          <div style={{ background: 'rgb(31, 41, 55)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Bulk Upload Quotes</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgb(156, 163, 175)', marginBottom: '1rem' }}>
              Paste quotes in CSV format (one per line):<br/>
              Format: &quot;quote&quot;,&quot;author&quot;,&quot;title&quot;,&quot;tag&quot;<br/>
              Example: &quot;To be or not to be&quot;,&quot;Shakespeare&quot;,&quot;Hamlet&quot;,&quot;philosophy&quot;
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgb(55, 65, 81)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                height: '16rem',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: 'none',
                resize: 'vertical'
              }}
              placeholder={'"Quote text","Author","Title","Tag"\n"Another quote","Another Author","Title","Tag"'}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={handleBulkUpload}
                style={{
                  background: 'rgb(22, 163, 74)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(21, 128, 61)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(22, 163, 74)'}
              >
                Upload Quotes
              </button>
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setBulkText('');
                }}
                style={{
                  background: 'rgb(75, 85, 99)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(55, 65, 81)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(75, 85, 99)'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quotes List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Quotes ({quotes.length})</h2>
          {quotes.map((quote) => (
            <div key={quote.id} style={{ background: 'rgb(31, 41, 55)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {quote.title && (
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{quote.title}</h3>
                  )}
                  <p style={{ color: 'rgb(209, 213, 219)', marginBottom: '0.5rem' }}>{quote.quote}</p>
                  <p style={{ fontSize: '0.875rem', color: 'rgb(156, 163, 175)' }}>— {quote.author}</p>
                  {quote.tag && (
                    <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', marginTop: '0.25rem' }}>#{quote.tag}</p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'rgb(75, 85, 99)', marginTop: '0.5rem' }}>
                    Shown {quote.timesShown} times | Last: {new Date(quote.lastShown).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEdit(quote)}
                    style={{
                      color: 'rgb(96, 165, 250)',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(147, 197, 253)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(96, 165, 250)'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    style={{
                      color: 'rgb(248, 113, 113)',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(252, 165, 165)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(248, 113, 113)'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}