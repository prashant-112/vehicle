import React from 'react';
import VehicleCard from './VehicleCard';
import './VehicleGrid.css';

const VehicleGrid = ({ vehicles, onVehicleClick, onBookmarkToggle, isBookmarked, loading }) => {
  if (loading && vehicles.length === 0) {
    return (
      <div className="vehicle-grid-loading">
        <div className="loading-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="vehicle-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-price"></div>
                <div className="skeleton-line skeleton-details"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="no-vehicles">
        <div className="no-vehicles-content">
          <h3>No vehicles found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-grid">
      {vehicles.map(vehicle => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onClick={() => onVehicleClick(vehicle)}
          onBookmarkToggle={() => onBookmarkToggle(vehicle)}
          isBookmarked={isBookmarked(vehicle.id)}
        />
      ))}
    </div>
  );
};

export default VehicleGrid;