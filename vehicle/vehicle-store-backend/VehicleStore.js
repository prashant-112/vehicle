import React, { useState, useEffect } from 'react';
import { vehicleAPI, brandAPI } from '../services/api';
import { demoBrands, demoVehicles } from './DemoData';
import VehicleGrid from './VehicleGrid';
import FilterSidebar from './FilterSidebar';
import VehicleModal from './VehicleModal';
import LoadingSpinner from './LoadingSpinner';
import './VehicleStore.css';

const VehicleStore = ({ bookmarks, addBookmark, removeBookmark, isBookmarked }) => {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    brandId: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
  });

  // Fuel type options
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  useEffect(() => {
    fetchBrands();
    fetchVehicles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVehicles();
  }, [filters, pagination.offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBrands = async () => {
    try {
      const response = await brandAPI.getBrands();
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      console.log('Using demo data for brands');
      setBrands(demoBrands);
      setError('Backend not available - showing demo data');
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const filterParams = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
      };
      
      // Remove empty filter values
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === '') {
          delete filterParams[key];
        }
      });

      const response = await vehicleAPI.getVehicles(filterParams);
      setVehicles(response.data.vehicles || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
      }));
      setError('');
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      console.log('Using demo data for vehicles');
      
      // Filter demo vehicles based on current filters
      let filteredVehicles = [...demoVehicles];
      
      if (filters.brandId) {
        filteredVehicles = filteredVehicles.filter(v => v.brand_id.toString() === filters.brandId.toString());
      }
      if (filters.fuelType) {
        filteredVehicles = filteredVehicles.filter(v => v.fuel_type === filters.fuelType);
      }
      if (filters.minPrice) {
        filteredVehicles = filteredVehicles.filter(v => v.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filteredVehicles = filteredVehicles.filter(v => v.price <= parseFloat(filters.maxPrice));
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredVehicles = filteredVehicles.filter(v =>
          v.name.toLowerCase().includes(searchTerm) ||
          v.brand.name.toLowerCase().includes(searchTerm)
        );
      }
      
      setVehicles(filteredVehicles);
      setPagination(prev => ({
        ...prev,
        total: filteredVehicles.length,
      }));
      setError('Backend not available - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
  };

  const handleBookmarkToggle = (vehicle) => {
    if (isBookmarked(vehicle.id)) {
      removeBookmark(vehicle.id);
    } else {
      addBookmark(vehicle);
    }
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      brandId: '',
      fuelType: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    });
  };

  if (loading && vehicles.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="vehicle-store">
      <div className="store-header">
        <h2>Browse Our Vehicle Collection</h2>
        <p>Find your perfect vehicle from our extensive multi-brand inventory</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchVehicles} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="store-layout">
        <FilterSidebar
          filters={filters}
          brands={brands}
          fuelTypes={fuelTypes}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          loading={loading}
        />

        <div className="main-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                {pagination.total} vehicles found
              </span>
              {(filters.brandId || filters.fuelType || filters.search || filters.minPrice || filters.maxPrice) && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear all filters
                </button>
              )}
            </div>
            {loading && <LoadingSpinner size="small" />}
          </div>

          <VehicleGrid
            vehicles={vehicles}
            onVehicleClick={handleVehicleClick}
            onBookmarkToggle={handleBookmarkToggle}
            isBookmarked={isBookmarked}
            loading={loading}
          />

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                disabled={pagination.offset === 0}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {showModal && selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          isBookmarked={isBookmarked(selectedVehicle.id)}
          onClose={handleCloseModal}
          onBookmarkToggle={() => handleBookmarkToggle(selectedVehicle)}
        />
      )}
    </div>
  );
};

export default VehicleStore;