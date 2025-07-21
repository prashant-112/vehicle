import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, brands, fuelTypes, onFilterChange, onClearFilters, loading }) => {
  const handleInputChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    handleInputChange('search', e.target.value);
  };

  const handleBrandChange = (e) => {
    handleInputChange('brandId', e.target.value);
  };

  const handleFuelTypeChange = (e) => {
    handleInputChange('fuelType', e.target.value);
  };

  const handleMinPriceChange = (e) => {
    handleInputChange('minPrice', e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    handleInputChange('maxPrice', e.target.value);
  };

  const hasActiveFilters = filters.brandId || filters.fuelType || filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filter Vehicles</h3>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="clear-all-btn">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search vehicles, brands..."
          value={filters.search}
          onChange={handleSearchChange}
          className="filter-input"
        />
      </div>

      {/* Brand Filter */}
      <div className="filter-group">
        <label htmlFor="brand">Brand</label>
        <select
          id="brand"
          value={filters.brandId}
          onChange={handleBrandChange}
          className="filter-select"
          disabled={loading}
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Fuel Type Filter */}
      <div className="filter-group">
        <label htmlFor="fuelType">Fuel Type</label>
        <select
          id="fuelType"
          value={filters.fuelType}
          onChange={handleFuelTypeChange}
          className="filter-select"
        >
          <option value="">All Fuel Types</option>
          {fuelTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleMinPriceChange}
            className="filter-input price-input"
            min="0"
          />
          <span className="price-separator">to</span>
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleMaxPriceChange}
            className="filter-input price-input"
            min="0"
          />
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="filter-group">
        <label>Quick Filters</label>
        <div className="quick-filters">
          <button
            onClick={() => handleInputChange('fuelType', 'Electric')}
            className={`quick-filter-btn ${filters.fuelType === 'Electric' ? 'active' : ''}`}
          >
            ⚡ Electric
          </button>
          <button
            onClick={() => handleInputChange('fuelType', 'Hybrid')}
            className={`quick-filter-btn ${filters.fuelType === 'Hybrid' ? 'active' : ''}`}
          >
            🌱 Hybrid
          </button>
          <button
            onClick={() => {
              handleInputChange('minPrice', '');
              handleInputChange('maxPrice', '30000');
            }}
            className={`quick-filter-btn ${filters.maxPrice === '30000' && !filters.minPrice ? 'active' : ''}`}
          >
            💰 Under $30k
          </button>
          <button
            onClick={() => {
              handleInputChange('minPrice', '40000');
              handleInputChange('maxPrice', '');
            }}
            className={`quick-filter-btn ${filters.minPrice === '40000' && !filters.maxPrice ? 'active' : ''}`}
          >
            ✨ Luxury ($40k+)
          </button>
        </div>
      </div>

      {/* Popular Brands */}
      <div className="filter-group">
        <label>Popular Brands</label>
        <div className="brand-quick-filters">
          {['Toyota', 'Honda', 'BMW', 'Tesla', 'Mercedes-Benz'].map(brandName => {
            const brand = brands.find(b => b.name === brandName);
            if (!brand) return null;
            
            return (
              <button
                key={brand.id}
                onClick={() => handleInputChange('brandId', brand.id.toString())}
                className={`brand-filter-btn ${filters.brandId === brand.id.toString() ? 'active' : ''}`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;