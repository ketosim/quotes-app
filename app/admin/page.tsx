'use client';

import { useState, useEffect } from 'react';

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

  // Fetch all quotes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing quote
        await fetch(`/api/quotes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Add new quote
        await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      // Refresh quotes list
      await fetchQuotes();
      
      // Reset form
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
      await fetch(`/api/quotes/${id}`, {
        method: 'DELETE'
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Quotes</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Add New Quote
          </button>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl mb-4">
              {editingId ? 'Edit Quote' : 'Add New Quote'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-white"
                  placeholder="e.g., On Passion"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-white"
                  placeholder="e.g., Steve Jobs"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Tag (optional)</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-white"
                  placeholder="e.g., motivation, wisdom"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Quote *</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({...formData, quote: e.target.value})}
                  className="w-full bg-gray-700 px-3 py-2 rounded h-32 text-white"
                  placeholder="Enter the quote..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  {editingId ? 'Update' : 'Add'} Quote
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quotes List */}
        <div className="space-y-4">
          <h2 className="text-xl mb-4">All Quotes ({quotes.length})</h2>
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {quote.title && (
                    <h3 className="text-lg font-semibold mb-1">{quote.title}</h3>
                  )}
                  <p className="text-gray-300 mb-2">"{quote.quote}"</p>
                  <p className="text-sm text-gray-400">— {quote.author}</p>
                  {quote.tag && (
                    <p className="text-xs text-gray-500 mt-1">#{quote.tag}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Shown {quote.timesShown} times | Last: {new Date(quote.lastShown).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(quote)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
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