'use client';

import { useState, useEffect } from 'react';

interface Quote {
  id: string;
  quote: string;
  author: string;
  title: string;
  tag?: string;
}

export default function ManagePage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  
  // Filters
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  
  // Bulk actions
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, authors: 0, books: 0 });

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotes, selectedAuthor, selectedBook, searchText]);

  const loadQuotes = async () => {
    setLoading(true);
    const res = await fetch('/api/quotes/all');
    const data = await res.json();
    setQuotes(data);
    
    // Extract unique authors and books
    const uniqueAuthors = [...new Set(data.map((q: Quote) => q.author))].sort();
    const uniqueBooks = [...new Set(data.map((q: Quote) => q.title))].sort();
    
    setAuthors(uniqueAuthors);
    setBooks(uniqueBooks);
    
    setStats({
      total: data.length,
      authors: uniqueAuthors.length,
      books: uniqueBooks.length
    });
    
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = quotes;
    
    if (selectedAuthor) {
      filtered = filtered.filter(q => q.author === selectedAuthor);
    }
    
    if (selectedBook) {
      filtered = filtered.filter(q => q.title === selectedBook);
    }
    
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(q => 
        q.quote.toLowerCase().includes(search) ||
        q.author.toLowerCase().includes(search) ||
        q.title.toLowerCase().includes(search)
      );
    }
    
    setFilteredQuotes(filtered);
  };

  const clearFilters = () => {
    setSelectedAuthor('');
    setSelectedBook('');
    setSearchText('');
    setSelectedQuotes(new Set());
  };

  const toggleQuoteSelection = (id: string) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuotes(newSelected);
  };

  const selectAll = () => {
    setSelectedQuotes(new Set(filteredQuotes.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedQuotes(new Set());
  };

  const bulkDelete = async () => {
    if (selectedQuotes.size === 0) return;
    
    if (!confirm(`Delete ${selectedQuotes.size} quotes?`)) return;
    
    for (const id of selectedQuotes) {
      await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    }
    
    setSelectedQuotes(new Set());
    loadQuotes();
  };

  const exportFiltered = () => {
    const csv = filteredQuotes
      .map(q => `"${q.quote.replace(/"/g, '""')}","${q.author}","${q.title}","${q.tag || ''}"`)
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-${selectedAuthor || selectedBook || 'filtered'}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quote Management</h1>
          <div className="space-x-4">
            <a href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Back to App
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Quotes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{stats.authors}</div>
            <div className="text-sm text-gray-600">Authors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.books}</div>
            <div className="text-sm text-gray-600">Books</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>

            {/* Book Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Books</option>
                {books.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Text
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search quotes..."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredQuotes.length} of {quotes.length} quotes
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredQuotes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Select All ({filteredQuotes.length})
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Deselect All
                </button>
              </div>
              
              <div className="space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedQuotes.size} selected
                </span>
                <button
                  onClick={exportFiltered}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Export Filtered
                </button>
                {selectedQuotes.size > 0 && (
                  <button
                    onClick={bulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Selected ({selectedQuotes.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quotes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredQuotes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No quotes match your filters
              </div>
            ) : (
              <div className="divide-y">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`p-4 hover:bg-gray-50 ${
                      selectedQuotes.has(quote.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedQuotes.has(quote.id)}
                        onChange={() => toggleQuoteSelection(quote.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-gray-800 mb-2">{quote.quote}</p>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{quote.author}</span>
                          {' — '}
                          <span className="italic">{quote.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}