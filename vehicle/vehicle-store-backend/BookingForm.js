import React, { useState } from 'react';
import { bookingAPI } from '../services/api';
import './BookingForm.css';

const BookingForm = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingData = {
        vehicle_id: vehicle.id,
        ...formData
      };

      await bookingAPI.createBooking(bookingData);
      setSuccess(true);
      
      // Show success message for 2 seconds, then close
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error || 'Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  if (success) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="booking-form-modal success-modal">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>Booking Request Submitted!</h2>
            <p>Thank you for your interest in the {vehicle.brand?.name} {vehicle.name}.</p>
            <p>Our team will contact you soon to schedule your test drive.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="booking-form-modal">
        <div className="booking-form-header">
          <h2>Book Test Drive</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="vehicle-summary">
          <img
            src={vehicle.thumbnail_url || '/images/placeholder-car.jpg'}
            alt={`${vehicle.brand?.name} ${vehicle.name}`}
            onError={(e) => {
              e.target.src = '/images/placeholder-car.jpg';
            }}
          />
          <div className="summary-details">
            <h3>{vehicle.brand?.name} {vehicle.name} {vehicle.model}</h3>
            <p className="summary-price">{formatPrice(vehicle.price)}</p>
            <p className="summary-specs">{vehicle.year} • {vehicle.fuel_type}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="customer_name">Full Name *</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer_email">Email Address *</label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer_phone">Phone Number</label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us about your interests, preferred test drive time, or any questions you have..."
            />
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

        <div className="booking-disclaimer">
          <p>
            <strong>Note:</strong> This is a booking request. Our team will contact you 
            to confirm availability and schedule your test drive appointment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;