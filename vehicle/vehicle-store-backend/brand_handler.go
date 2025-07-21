package main

import (
	"net/http"

	"vehicle-store-backend/internal/database"
	"vehicle-store-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetBrands handles GET /api/brands
func GetBrands(c *gin.Context) {
	var brands []models.Brand

	if err := database.DB.Find(&brands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch brands"})
		return
	}

	c.JSON(http.StatusOK, brands)
}

// GetBrandByID handles GET /api/brands/:id
func GetBrandByID(c *gin.Context) {
	id := c.Param("id")
	var brand models.Brand

	if err := database.DB.Preload("Vehicles").First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}

	c.JSON(http.StatusOK, brand)
}

// CreateBrand handles POST /api/admin/brands
func CreateBrand(c *gin.Context) {
	var brand models.Brand

	if err := c.ShouldBindJSON(&brand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create brand"})
		return
	}

	c.JSON(http.StatusCreated, brand)
}

// UpdateBrand handles PUT /api/admin/brands/:id
func UpdateBrand(c *gin.Context) {
	id := c.Param("id")
	var brand models.Brand

	if err := database.DB.First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}

	if err := c.ShouldBindJSON(&brand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update brand"})
		return
	}

	c.JSON(http.StatusOK, brand)
}

// DeleteBrand handles DELETE /api/admin/brands/:id
func DeleteBrand(c *gin.Context) {
	id := c.Param("id")
	var brand models.Brand

	if err := database.DB.First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}

	// Check if brand has vehicles
	var vehicleCount int64
	database.DB.Model(&models.Vehicle{}).Where("brand_id = ?", id).Count(&vehicleCount)

	if vehicleCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete brand with existing vehicles"})
		return
	}

	if err := database.DB.Delete(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete brand"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Brand deleted successfully"})
}
