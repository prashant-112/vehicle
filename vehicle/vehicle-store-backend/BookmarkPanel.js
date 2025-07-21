import React, { useState } from 'react';
import VehicleModal from './VehicleModal';
import './BookmarkPanel.css';

const BookmarkPanel = ({ bookmarks, removeBookmark }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
  };

  const handleRemoveBookmark = (vehicleId) => {
    removeBookmark(vehicleId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFuelTypeIcon = (fuelType) => {
    switch (fuelType?.toLowerCase()) {
      case 'electric':
        return '⚡';
      case 'hybrid':
        return '🌱';
      case 'diesel':
        return '⛽';
      case 'petrol':
      default:
        return '🚗';
    }
  };

  const getTotalValue = () => {
    return bookmarks.reduce((total, vehicle) => total + (vehicle.price || 0), 0);
  };

  const clearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to remove all bookmarks?')) {
      bookmarks.forEach(vehicle => removeBookmark(vehicle.id));
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="bookmark-panel">
        <div className="bookmark-header">
          <h2>Your Bookmarks</h2>
          <p>Save vehicles you're interested in for easy comparison</p>
        </div>
        
        <div className="empty-bookmarks">
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h3>No bookmarks yet</h3>
            <p>Browse our vehicle collection and bookmark the ones you like!</p>
            <a href="/" className="browse-btn">
              Browse Vehicles
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-panel">
      <div className="bookmark-header">
        <div className="header-info">
          <h2>Your Bookmarks</h2>
          <p>{bookmarks.length} vehicles saved</p>
        </div>
        <div className="header-actions">
          <div className="total-value">
            <span className="total-label">Total Value:</span>
            <span className="total-amount">{formatPrice(getTotalValue())}</span>
          </div>
          <button 
            onClick={clearAllBookmarks}
            className="clear-all-btn"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="bookmark-grid">
        {bookmarks.map(vehicle => (
          <div key={vehicle.id} className="bookmark-card">
            <div className="bookmark-image">
              <img
                src={vehicle.thumbnail_url || '/images/placeholder-car.jpg'}
                alt={`${vehicle.brand?.name} ${vehicle.name}`}
                onClick={() => handleVehicleClick(vehicle)}
                onError={(e) => {
                  e.target.src = '/images/placeholder-car.jpg';
                }}
              />
              <button
                className="remove-bookmark-btn"
                onClick={() => handleRemoveBookmark(vehicle.id)}
                title="Remove bookmark"
              >
                ✕
              </button>
            </div>

            <div className="bookmark-content">
              <div className="vehicle-info">
                <h3 
                  className="vehicle-title"
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  {vehicle.brand?.name} {vehicle.name}
                </h3>
                <p className="vehicle-model">{vehicle.model} • {vehicle.year}</p>
              </div>

              <div className="vehicle-price">
                <span className="price">{formatPrice(vehicle.price)}</span>
              </div>

              <div className="vehicle-specs">
                <div className="spec-item">
                  <span className="spec-icon">{getFuelTypeIcon(vehicle.fuel_type)}</span>
                  <span className="spec-text">{vehicle.fuel_type}</span>
                </div>
                
                {vehicle.mileage && (
                  <div className="spec-item">
                    <span className="spec-icon">📊</span>
                    <span className="spec-text">
                      {vehicle.mileage} {vehicle.fuel_type === 'Electric' ? 'mi' : 'mpg'}
                    </span>
                  </div>
                )}

                {vehicle.engine_specs && (
                  <div className="spec-item">
                    <span className="spec-icon">🔧</span>
                    <span className="spec-text">{vehicle.engine_specs}</span>
                  </div>
                )}
              </div>

              <div className="bookmark-actions">
                <button
                  onClick={() => handleVehicleClick(vehicle)}
                  className="view-details-btn"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRemoveBookmark(vehicle.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bookmark-footer">
        <div className="bookmark-stats">
          <div className="stat-item">
            <span className="stat-label">Vehicles Saved:</span>
            <span className="stat-value">{bookmarks.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Value:</span>
            <span className="stat-value">{formatPrice(getTotalValue())}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Price:</span>
            <span className="stat-value">
              {formatPrice(getTotalValue() / bookmarks.length)}
            </span>
          </div>
        </div>
        
        <div className="bookmark-tips">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Compare different vehicles side by side</li>
            <li>Share your bookmarks with family or friends</li>
            <li>Contact dealers directly for test drives</li>
          </ul>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {showModal && selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          isBookmarked={true}
          onClose={handleCloseModal}
          onBookmarkToggle={() => handleRemoveBookmark(selectedVehicle.id)}
        />
      )}
    </div>
  );
};

export default BookmarkPanel;