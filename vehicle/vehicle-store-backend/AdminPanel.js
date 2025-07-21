import React, { useState, useEffect } from 'react';
import { vehicleAPI, brandAPI, bookingAPI, analyticsAPI } from '../services/api';
import { demoBrands, demoVehicles, demoAnalytics } from './DemoData';
import LoadingSpinner from './LoadingSpinner';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAnalytics();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
      fetchBrands();
    } else if (activeTab === 'brands') {
      fetchBrands();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getSummary();
      setAnalytics(response.data);
    } catch (err) {
      console.log('Using demo analytics data');
      setAnalytics(demoAnalytics);
      setError('Backend not available - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getVehicles({ limit: 100 });
      setVehicles(response.data.vehicles || []);
    } catch (err) {
      console.log('Using demo vehicles data');
      setVehicles(demoVehicles);
      setError('Backend not available - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandAPI.getBrands();
      setBrands(response.data);
    } catch (err) {
      console.log('Using demo brands data');
      setBrands(demoBrands);
      setError('Backend not available - showing demo data');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleAPI.deleteVehicle(id);
        fetchVehicles();
      } catch (err) {
        setError('Failed to delete vehicle');
      }
    }
  };

  const handleDeleteBrand = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await brandAPI.deleteBrand(id);
        fetchBrands();
      } catch (err) {
        setError('Failed to delete brand');
      }
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await bookingAPI.updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'contacted': return 'status-contacted';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Admin Panel</h1>
        <p>Manage your vehicle inventory, bookings, and analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          🚗 Vehicles
        </button>
        <button
          className={`tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          🏷️ Brands
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📞 Bookings
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-error-btn">✕</button>
        </div>
      )}

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            {loading ? (
              <LoadingSpinner message="Loading analytics..." />
            ) : analytics ? (
              <div className="analytics-grid">
                <div className="stat-card">
                  <h3>Total Vehicles</h3>
                  <p className="stat-number">{analytics.total_vehicles}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Bookings</h3>
                  <p className="stat-number">{analytics.total_bookings}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Price</h3>
                  <p className="stat-number">{formatPrice(analytics.average_price)}</p>
                </div>
                <div className="stat-card">
                  <h3>Price Range</h3>
                  <p className="stat-range">
                    {formatPrice(analytics.price_range?.min)} - {formatPrice(analytics.price_range?.max)}
                  </p>
                </div>

                <div className="chart-card">
                  <h3>Vehicles by Brand</h3>
                  <div className="chart-data">
                    {Object.entries(analytics.vehicles_by_brand || {}).map(([brand, count]) => (
                      <div key={brand} className="chart-item">
                        <span className="chart-label">{brand}</span>
                        <div className="chart-bar">
                          <div 
                            className="chart-fill" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.vehicles_by_brand))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="chart-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Vehicles by Fuel Type</h3>
                  <div className="chart-data">
                    {Object.entries(analytics.vehicles_by_fuel || {}).map(([fuel, count]) => (
                      <div key={fuel} className="chart-item">
                        <span className="chart-label">{fuel}</span>
                        <div className="chart-bar">
                          <div 
                            className="chart-fill" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.vehicles_by_fuel))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="chart-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Bookings by Status</h3>
                  <div className="chart-data">
                    {Object.entries(analytics.bookings_by_status || {}).map(([status, count]) => (
                      <div key={status} className="chart-item">
                        <span className="chart-label">{status}</span>
                        <div className="chart-bar">
                          <div 
                            className="chart-fill" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.bookings_by_status))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="chart-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No analytics data available</div>
            )}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="vehicles-tab">
            <div className="tab-header">
              <h2>Vehicle Management</h2>
              <button
                onClick={() => setShowVehicleForm(true)}
                className="add-btn"
              >
                + Add Vehicle
              </button>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading vehicles..." />
            ) : (
              <div className="vehicles-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Brand</th>
                      <th>Name</th>
                      <th>Year</th>
                      <th>Price</th>
                      <th>Fuel Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td>
                          <img
                            src={vehicle.thumbnail_url || '/images/placeholder-car.jpg'}
                            alt={vehicle.name}
                            className="vehicle-thumbnail"
                            onError={(e) => {
                              e.target.src = '/images/placeholder-car.jpg';
                            }}
                          />
                        </td>
                        <td>{vehicle.brand?.name}</td>
                        <td>{vehicle.name} {vehicle.model}</td>
                        <td>{vehicle.year}</td>
                        <td>{formatPrice(vehicle.price)}</td>
                        <td>{vehicle.fuel_type}</td>
                        <td>
                          <span className={`status-badge ${vehicle.availability ? 'available' : 'unavailable'}`}>
                            {vehicle.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setShowVehicleForm(true);
                            }}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="brands-tab">
            <div className="tab-header">
              <h2>Brand Management</h2>
              <button
                onClick={() => setShowBrandForm(true)}
                className="add-btn"
              >
                + Add Brand
              </button>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading brands..." />
            ) : (
              <div className="brands-grid">
                {brands.map(brand => (
                  <div key={brand.id} className="brand-card">
                    <img
                      src={brand.logo_url || '/images/placeholder-logo.png'}
                      alt={brand.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-logo.png';
                      }}
                    />
                    <h3>{brand.name}</h3>
                    <p>{brand.description}</p>
                    <div className="brand-actions">
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setShowBrandForm(true);
                        }}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <div className="tab-header">
              <h2>Booking Management</h2>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading bookings..." />
            ) : (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{formatDate(booking.created_at)}</td>
                        <td>{booking.customer_name}</td>
                        <td>
                          {booking.vehicle?.brand?.name} {booking.vehicle?.name}
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{booking.customer_email}</div>
                            {booking.customer_phone && (
                              <div>{booking.customer_phone}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className={`status-select ${getStatusBadgeClass(booking.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          {booking.message && (
                            <button
                              onClick={() => alert(booking.message)}
                              className="view-message-btn"
                            >
                              View Message
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <VehicleForm
          vehicle={editingVehicle}
          brands={brands}
          onClose={() => {
            setShowVehicleForm(false);
            setEditingVehicle(null);
          }}
          onSuccess={() => {
            setShowVehicleForm(false);
            setEditingVehicle(null);
            fetchVehicles();
          }}
        />
      )}

      {/* Brand Form Modal */}
      {showBrandForm && (
        <BrandForm
          brand={editingBrand}
          onClose={() => {
            setShowBrandForm(false);
            setEditingBrand(null);
          }}
          onSuccess={() => {
            setShowBrandForm(false);
            setEditingBrand(null);
            fetchBrands();
          }}
        />
      )}
    </div>
  );
};

// Vehicle Form Component
const VehicleForm = ({ vehicle, brands, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand_id: vehicle?.brand_id || '',
    name: vehicle?.name || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    price: vehicle?.price || '',
    fuel_type: vehicle?.fuel_type || 'Petrol',
    thumbnail_url: vehicle?.thumbnail_url || '',
    description: vehicle?.description || '',
    engine_specs: vehicle?.engine_specs || '',
    transmission: vehicle?.transmission || '',
    mileage: vehicle?.mileage || '',
    exterior_color: vehicle?.exterior_color || '',
    interior_color: vehicle?.interior_color || '',
    safety_features: vehicle?.safety_features || '',
    financing_rate: vehicle?.financing_rate || '',
    warranty_years: vehicle?.warranty_years || '',
    dealer_info: vehicle?.dealer_info || '',
    availability: vehicle?.availability !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        brand_id: parseInt(formData.brand_id),
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        financing_rate: formData.financing_rate ? parseFloat(formData.financing_rate) : 0,
        warranty_years: formData.warranty_years ? parseInt(formData.warranty_years) : 0,
      };

      if (vehicle) {
        await vehicleAPI.updateVehicle(vehicle.id, submitData);
      } else {
        await vehicleAPI.createVehicle(submitData);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="form-modal">
        <div className="form-header">
          <h2>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Brand *</label>
              <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} required>
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input name="model" value={formData.model} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Year *</label>
              <input name="year" type="number" value={formData.year} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Fuel Type *</label>
              <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange} required>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Thumbnail URL</label>
              <input name="thumbnail_url" value={formData.thumbnail_url} onChange={handleInputChange} />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>

            <div className="form-group">
              <label>Engine Specs</label>
              <input name="engine_specs" value={formData.engine_specs} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Transmission</label>
              <input name="transmission" value={formData.transmission} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Mileage</label>
              <input name="mileage" type="number" value={formData.mileage} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Exterior Color</label>
              <input name="exterior_color" value={formData.exterior_color} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Interior Color</label>
              <input name="interior_color" value={formData.interior_color} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Financing Rate (%)</label>
              <input name="financing_rate" type="number" step="0.1" value={formData.financing_rate} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Warranty (Years)</label>
              <input name="warranty_years" type="number" value={formData.warranty_years} onChange={handleInputChange} />
            </div>

            <div className="form-group full-width">
              <label>Safety Features</label>
              <textarea name="safety_features" value={formData.safety_features} onChange={handleInputChange} rows="2" />
            </div>

            <div className="form-group full-width">
              <label>Dealer Info</label>
              <textarea name="dealer_info" value={formData.dealer_info} onChange={handleInputChange} rows="2" />
            </div>

            <div className="form-group">
              <label>
                <input 
                  name="availability" 
                  type="checkbox" 
                  checked={formData.availability} 
                  onChange={handleInputChange} 
                />
                Available for sale
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand Form Component
const BrandForm = ({ brand, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    logo_url: brand?.logo_url || '',
    description: brand?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (brand) {
        await brandAPI.updateBrand(brand.id, formData);
      } else {
        await brandAPI.createBrand(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="form-modal brand-form-modal">
        <div className="form-header">
          <h2>{brand ? 'Edit Brand' : 'Add New Brand'}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label>Brand Name *</label>
            <input name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input name="logo_url" value={formData.logo_url} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (brand ? 'Update Brand' : 'Add Brand')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;