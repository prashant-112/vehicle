import React, { useState } from 'react';
import BookingForm from './BookingForm';
import './VehicleModal.css';

const VehicleModal = ({ vehicle, isBookmarked, onClose, onBookmarkToggle }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFuelTypeIcon = (fuelType) => {
    switch (fuelType.toLowerCase()) {
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="vehicle-modal">
        <div className="modal-header">
          <h2>{vehicle.brand?.name} {vehicle.name} {vehicle.model}</h2>
          <div className="modal-actions">
            <button
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={onBookmarkToggle}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              {isBookmarked ? '❤️ Bookmarked' : '🤍 Bookmark'}
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className="vehicle-image-section">
            <img
              src={vehicle.thumbnail_url || '/images/placeholder-car.jpg'}
              alt={`${vehicle.brand?.name} ${vehicle.name}`}
              onError={(e) => {
                e.target.src = '/images/placeholder-car.jpg';
              }}
            />
            <div className="availability-status">
              <span className={`status ${vehicle.availability ? 'available' : 'unavailable'}`}>
                {vehicle.availability ? 'Available' : 'Sold Out'}
              </span>
            </div>
          </div>

          <div className="vehicle-details-section">
            <div className="price-section">
              <div className="price">{formatPrice(vehicle.price)}</div>
              <div className="year-model">{vehicle.year} Model</div>
            </div>

            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-icon">{getFuelTypeIcon(vehicle.fuel_type)}</span>
                <div className="spec-content">
                  <span className="spec-label">Fuel Type</span>
                  <span className="spec-value">{vehicle.fuel_type}</span>
                </div>
              </div>

              {vehicle.engine_specs && (
                <div className="spec-item">
                  <span className="spec-icon">🔧</span>
                  <div className="spec-content">
                    <span className="spec-label">Engine</span>
                    <span className="spec-value">{vehicle.engine_specs}</span>
                  </div>
                </div>
              )}

              {vehicle.transmission && (
                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-content">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{vehicle.transmission}</span>
                  </div>
                </div>
              )}

              {vehicle.mileage && (
                <div className="spec-item">
                  <span className="spec-icon">📊</span>
                  <div className="spec-content">
                    <span className="spec-label">Efficiency</span>
                    <span className="spec-value">
                      {vehicle.mileage} {vehicle.fuel_type === 'Electric' ? 'mi range' : 'mpg'}
                    </span>
                  </div>
                </div>
              )}

              {vehicle.exterior_color && (
                <div className="spec-item">
                  <span className="spec-icon">🎨</span>
                  <div className="spec-content">
                    <span className="spec-label">Exterior Color</span>
                    <span className="spec-value">{vehicle.exterior_color}</span>
                  </div>
                </div>
              )}

              {vehicle.interior_color && (
                <div className="spec-item">
                  <span className="spec-icon">🪑</span>
                  <div className="spec-content">
                    <span className="spec-label">Interior</span>
                    <span className="spec-value">{vehicle.interior_color}</span>
                  </div>
                </div>
              )}
            </div>

            {vehicle.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{vehicle.description}</p>
              </div>
            )}

            {vehicle.safety_features && (
              <div className="safety-section">
                <h3>Safety Features</h3>
                <p>{vehicle.safety_features}</p>
              </div>
            )}

            <div className="financing-section">
              <h3>Financing & Warranty</h3>
              <div className="financing-grid">
                {vehicle.financing_rate && (
                  <div className="financing-item">
                    <span className="financing-label">Financing Rate</span>
                    <span className="financing-value">{vehicle.financing_rate}% APR</span>
                  </div>
                )}
                {vehicle.warranty_years && (
                  <div className="financing-item">
                    <span className="financing-label">Warranty</span>
                    <span className="financing-value">{vehicle.warranty_years} years</span>
                  </div>
                )}
              </div>
            </div>

            {vehicle.dealer_info && (
              <div className="dealer-section">
                <h3>Dealer Information</h3>
                <p>{vehicle.dealer_info}</p>
              </div>
            )}

            <div className="action-section">
              {vehicle.availability ? (
                <button
                  className="book-now-btn"
                  onClick={() => setShowBookingForm(true)}
                >
                  📞 Book Test Drive
                </button>
              ) : (
                <button className="unavailable-btn" disabled>
                  Vehicle Unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <BookingForm
            vehicle={vehicle}
            onClose={() => setShowBookingForm(false)}
            onSuccess={() => {
              setShowBookingForm(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleModal;