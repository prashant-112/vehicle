package main

import (
	"net/http"
	"strconv"
	"strings"

	"vehicle-store-backend/internal/database"
	"vehicle-store-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetVehicles handles GET /api/vehicles with filters
func GetVehicles(c *gin.Context) {
	var vehicles []models.Vehicle
	var filter models.VehicleFilter

	// Parse query parameters
	if brandID := c.Query("brand_id"); brandID != "" {
		if id, err := strconv.ParseUint(brandID, 10, 32); err == nil {
			filter.BrandID = uint(id)
		}
	}

	filter.FuelType = c.Query("fuel_type")
	filter.Search = c.Query("search")

	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			filter.MinPrice = price
		}
	}

	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			filter.MaxPrice = price
		}
	}

	// Default pagination
	filter.Limit = 20
	filter.Offset = 0

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil {
			filter.Limit = l
		}
	}

	if offset := c.Query("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil {
			filter.Offset = o
		}
	}

	// Build query
	query := database.DB.Preload("Brand")

	// Apply filters
	if filter.BrandID > 0 {
		query = query.Where("brand_id = ?", filter.BrandID)
	}

	if filter.FuelType != "" {
		query = query.Where("fuel_type = ?", filter.FuelType)
	}

	if filter.MinPrice > 0 {
		query = query.Where("price >= ?", filter.MinPrice)
	}

	if filter.MaxPrice > 0 {
		query = query.Where("price <= ?", filter.MaxPrice)
	}

	if filter.Search != "" {
		searchTerm := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Joins("JOIN brands ON brands.id = vehicles.brand_id").
			Where("LOWER(vehicles.name) LIKE ? OR LOWER(vehicles.model) LIKE ? OR LOWER(brands.name) LIKE ?",
				searchTerm, searchTerm, searchTerm)
	}

	// Apply availability filter (only show available vehicles by default)
	query = query.Where("availability = ?", true)

	// Execute query with pagination
	if err := query.Limit(filter.Limit).Offset(filter.Offset).Find(&vehicles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vehicles"})
		return
	}

	// Get total count for pagination
	var total int64
	countQuery := database.DB.Model(&models.Vehicle{})

	if filter.BrandID > 0 {
		countQuery = countQuery.Where("brand_id = ?", filter.BrandID)
	}
	if filter.FuelType != "" {
		countQuery = countQuery.Where("fuel_type = ?", filter.FuelType)
	}
	if filter.MinPrice > 0 {
		countQuery = countQuery.Where("price >= ?", filter.MinPrice)
	}
	if filter.MaxPrice > 0 {
		countQuery = countQuery.Where("price <= ?", filter.MaxPrice)
	}
	if filter.Search != "" {
		searchTerm := "%" + strings.ToLower(filter.Search) + "%"
		countQuery = countQuery.Joins("JOIN brands ON brands.id = vehicles.brand_id").
			Where("LOWER(vehicles.name) LIKE ? OR LOWER(vehicles.model) LIKE ? OR LOWER(brands.name) LIKE ?",
				searchTerm, searchTerm, searchTerm)
	}
	countQuery = countQuery.Where("availability = ?", true)

	countQuery.Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"vehicles": vehicles,
		"total":    total,
		"limit":    filter.Limit,
		"offset":   filter.Offset,
	})
}

// GetVehicleByID handles GET /api/vehicles/:id
func GetVehicleByID(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle

	if err := database.DB.Preload("Brand").First(&vehicle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	c.JSON(http.StatusOK, vehicle)
}

// CreateVehicle handles POST /api/admin/vehicles
func CreateVehicle(c *gin.Context) {
	var vehicle models.Vehicle

	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vehicle"})
		return
	}

	// Fetch the created vehicle with brand information
	database.DB.Preload("Brand").First(&vehicle, vehicle.ID)

	c.JSON(http.StatusCreated, vehicle)
}

// UpdateVehicle handles PUT /api/admin/vehicles/:id
func UpdateVehicle(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle

	if err := database.DB.First(&vehicle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle"})
		return
	}

	// Fetch the updated vehicle with brand information
	database.DB.Preload("Brand").First(&vehicle, vehicle.ID)

	c.JSON(http.StatusOK, vehicle)
}

// DeleteVehicle handles DELETE /api/admin/vehicles/:id
func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle

	if err := database.DB.First(&vehicle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	if err := database.DB.Delete(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted successfully"})
}
