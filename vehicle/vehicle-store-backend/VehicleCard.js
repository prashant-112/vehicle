import React from 'react';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onClick, onBookmarkToggle, isBookmarked }) => {
  const handleBookmarkClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    onBookmarkToggle();
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

  const getAvailabilityStatus = () => {
    return vehicle.availability ? 'Available' : 'Sold Out';
  };

  return (
    <div 
      className={`vehicle-card ${!vehicle.availability ? 'unavailable' : ''}`}
      onClick={onClick}
    >
      <div className="vehicle-card-image">
        <img
          src={vehicle.thumbnail_url || '/images/placeholder-car.jpg'}
          alt={`${vehicle.brand?.name} ${vehicle.name}`}
          onError={(e) => {
            e.target.src = '/images/placeholder-car.jpg';
          }}
        />
        <button
          className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmarkClick}
          title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
        <div className="availability-badge">
          <span className={`status ${vehicle.availability ? 'available' : 'unavailable'}`}>
            {getAvailabilityStatus()}
          </span>
        </div>
      </div>

      <div className="vehicle-card-content">
        <div className="vehicle-header">
          <h3 className="vehicle-title">
            {vehicle.brand?.name} {vehicle.name}
          </h3>
          <span className="vehicle-model">{vehicle.model}</span>
        </div>

        <div className="vehicle-price">
          <span className="price">{formatPrice(vehicle.price)}</span>
          <span className="year">{vehicle.year}</span>
        </div>

        <div className="vehicle-details">
          <div className="detail-item">
            <span className="detail-icon">{getFuelTypeIcon(vehicle.fuel_type)}</span>
            <span className="detail-text">{vehicle.fuel_type}</span>
          </div>
          
          {vehicle.mileage && (
            <div className="detail-item">
              <span className="detail-icon">📊</span>
              <span className="detail-text">
                {vehicle.mileage} {vehicle.fuel_type === 'Electric' ? 'mi range' : 'mpg'}
              </span>
            </div>
          )}

          {vehicle.engine_specs && (
            <div className="detail-item">
              <span className="detail-icon">🔧</span>
              <span className="detail-text">{vehicle.engine_specs}</span>
            </div>
          )}
        </div>

        <div className="vehicle-features">
          {vehicle.exterior_color && (
            <span className="feature-tag">
              🎨 {vehicle.exterior_color}
            </span>
          )}
          {vehicle.transmission && (
            <span className="feature-tag">
              ⚙️ {vehicle.transmission}
            </span>
          )}
        </div>

        <div className="card-footer">
          <div className="financing-info">
            {vehicle.financing_rate && (
              <span className="financing-rate">
                {vehicle.financing_rate}% APR
              </span>
            )}
            {vehicle.warranty_years && (
              <span className="warranty">
                {vehicle.warranty_years}yr warranty
              </span>
            )}
          </div>
          
          <button className="view-details-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;