package main

import (
	"net/http"

	"vehicle-store-backend/internal/database"
	"vehicle-store-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateBooking handles POST /api/bookings
func CreateBooking(c *gin.Context) {
	var booking models.Booking

	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify vehicle exists and is available
	var vehicle models.Vehicle
	if err := database.DB.First(&vehicle, booking.VehicleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	if !vehicle.Availability {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vehicle is not available for booking"})
		return
	}

	// Set default status
	if booking.Status == "" {
		booking.Status = "pending"
	}

	if err := database.DB.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	// Fetch the created booking with vehicle and brand information
	database.DB.Preload("Vehicle.Brand").First(&booking, booking.ID)

	c.JSON(http.StatusCreated, booking)
}

// GetBookings handles GET /api/admin/bookings
func GetBookings(c *gin.Context) {
	var bookings []models.Booking

	// Parse query parameters for filtering
	status := c.Query("status")

	query := database.DB.Preload("Vehicle.Brand")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// GetBookingByID handles GET /api/admin/bookings/:id
func GetBookingByID(c *gin.Context) {
	id := c.Param("id")
	var booking models.Booking

	if err := database.DB.Preload("Vehicle.Brand").First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, booking)
}

// UpdateBookingStatus handles PUT /api/admin/bookings/:id
func UpdateBookingStatus(c *gin.Context) {
	id := c.Param("id")
	var booking models.Booking

	if err := database.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var updateData struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate status values
	validStatuses := map[string]bool{
		"pending":   true,
		"contacted": true,
		"completed": true,
		"cancelled": true,
	}

	if !validStatuses[updateData.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	booking.Status = updateData.Status

	if err := database.DB.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking status"})
		return
	}

	// Fetch the updated booking with vehicle and brand information
	database.DB.Preload("Vehicle.Brand").First(&booking, booking.ID)

	c.JSON(http.StatusOK, booking)
}

// DeleteBooking handles DELETE /api/admin/bookings/:id
func DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	var booking models.Booking

	if err := database.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	if err := database.DB.Delete(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}
