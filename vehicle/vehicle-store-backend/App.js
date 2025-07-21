import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import VehicleStore from './components/VehicleStore';
import AdminPanel from './components/AdminPanel';
import BookmarkPanel from './components/BookmarkPanel';

function App() {
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('vehicle-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('vehicle-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (vehicle) => {
    setBookmarks(prev => {
      const exists = prev.find(item => item.id === vehicle.id);
      if (!exists) {
        return [...prev, vehicle];
      }
      return prev;
    });
  };

  const removeBookmark = (vehicleId) => {
    setBookmarks(prev => prev.filter(item => item.id !== vehicleId));
  };

  const isBookmarked = (vehicleId) => {
    return bookmarks.some(item => item.id === vehicleId);
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-container">
            <h1>
              <Link to="/" className="logo-link">
                🚗 Multi-Brand Vehicle Store
              </Link>
            </h1>
            <nav className="main-nav">
              <Link to="/" className="nav-link">Browse Vehicles</Link>
              <Link to="/bookmarks" className="nav-link">
                Bookmarks ({bookmarks.length})
              </Link>
              <Link to="/admin" className="nav-link admin-link">Admin Panel</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <VehicleStore 
                  bookmarks={bookmarks}
                  addBookmark={addBookmark}
                  removeBookmark={removeBookmark}
                  isBookmarked={isBookmarked}
                />
              } 
            />
            <Route 
              path="/bookmarks" 
              element={
                <BookmarkPanel 
                  bookmarks={bookmarks}
                  removeBookmark={removeBookmark}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-container">
            <p>&copy; 2024 Multi-Brand Vehicle Store. All rights reserved.</p>
            <p>Browse, bookmark, and book your dream vehicle!</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;