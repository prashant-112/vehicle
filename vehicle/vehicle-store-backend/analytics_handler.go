package main

import (
	"net/http"

	"vehicle-store-backend/internal/database"
	"vehicle-store-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetAnalytics handles GET /api/analytics/summary
func GetAnalytics(c *gin.Context) {
	var analytics models.Analytics

	// Get total vehicles count
	database.DB.Model(&models.Vehicle{}).Count(&analytics.TotalVehicles)

	// Get vehicles by brand
	analytics.VehiclesByBrand = make(map[string]int64)
	var brandStats []struct {
		BrandName string `json:"brand_name"`
		Count     int64  `json:"count"`
	}

	database.DB.Model(&models.Vehicle{}).
		Select("brands.name as brand_name, COUNT(vehicles.id) as count").
		Joins("JOIN brands ON brands.id = vehicles.brand_id").
		Group("brands.name").
		Scan(&brandStats)

	for _, stat := range brandStats {
		analytics.VehiclesByBrand[stat.BrandName] = stat.Count
	}

	// Get vehicles by fuel type
	analytics.VehiclesByFuel = make(map[string]int64)
	var fuelStats []struct {
		FuelType string `json:"fuel_type"`
		Count    int64  `json:"count"`
	}

	database.DB.Model(&models.Vehicle{}).
		Select("fuel_type, COUNT(*) as count").
		Group("fuel_type").
		Scan(&fuelStats)

	for _, stat := range fuelStats {
		analytics.VehiclesByFuel[stat.FuelType] = stat.Count
	}

	// Get total bookings count
	database.DB.Model(&models.Booking{}).Count(&analytics.TotalBookings)

	// Get bookings by status
	analytics.BookingsByStatus = make(map[string]int64)
	var bookingStats []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}

	database.DB.Model(&models.Booking{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&bookingStats)

	for _, stat := range bookingStats {
		analytics.BookingsByStatus[stat.Status] = stat.Count
	}

	// Get average price
	var avgPrice struct {
		Average float64 `json:"average"`
	}
	database.DB.Model(&models.Vehicle{}).
		Select("AVG(price) as average").
		Scan(&avgPrice)
	analytics.AveragePrice = avgPrice.Average

	// Get price range
	analytics.PriceRange = make(map[string]float64)
	var priceRange struct {
		MinPrice float64 `json:"min_price"`
		MaxPrice float64 `json:"max_price"`
	}
	database.DB.Model(&models.Vehicle{}).
		Select("MIN(price) as min_price, MAX(price) as max_price").
		Scan(&priceRange)

	analytics.PriceRange["min"] = priceRange.MinPrice
	analytics.PriceRange["max"] = priceRange.MaxPrice

	c.JSON(http.StatusOK, analytics)
}

// GetPopularVehicles handles GET /api/analytics/popular-vehicles
func GetPopularVehicles(c *gin.Context) {
	var popularVehicles []struct {
		VehicleID    uint    `json:"vehicle_id"`
		VehicleName  string  `json:"vehicle_name"`
		BrandName    string  `json:"brand_name"`
		BookingCount int64   `json:"booking_count"`
		Price        float64 `json:"price"`
	}

	database.DB.Model(&models.Booking{}).
		Select("vehicles.id as vehicle_id, vehicles.name as vehicle_name, brands.name as brand_name, COUNT(bookings.id) as booking_count, vehicles.price").
		Joins("JOIN vehicles ON vehicles.id = bookings.vehicle_id").
		Joins("JOIN brands ON brands.id = vehicles.brand_id").
		Group("vehicles.id, vehicles.name, brands.name, vehicles.price").
		Order("booking_count DESC").
		Limit(10).
		Scan(&popularVehicles)

	c.JSON(http.StatusOK, gin.H{
		"popular_vehicles": popularVehicles,
	})
}

// GetBookingTrends handles GET /api/analytics/booking-trends
func GetBookingTrends(c *gin.Context) {
	var trends []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}

	database.DB.Model(&models.Booking{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Group("DATE(created_at)").
		Order("date DESC").
		Limit(30).
		Scan(&trends)

	c.JSON(http.StatusOK, gin.H{
		"booking_trends": trends,
	})
}

// GetInventoryStatus handles GET /api/analytics/inventory-status
func GetInventoryStatus(c *gin.Context) {
	var availableCount, unavailableCount int64

	database.DB.Model(&models.Vehicle{}).Where("availability = ?", true).Count(&availableCount)
	database.DB.Model(&models.Vehicle{}).Where("availability = ?", false).Count(&unavailableCount)

	// Get low stock alerts (vehicles with high booking demand)
	var highDemandVehicles []struct {
		VehicleID    uint   `json:"vehicle_id"`
		VehicleName  string `json:"vehicle_name"`
		BrandName    string `json:"brand_name"`
		BookingCount int64  `json:"booking_count"`
	}

	database.DB.Model(&models.Booking{}).
		Select("vehicles.id as vehicle_id, vehicles.name as vehicle_name, brands.name as brand_name, COUNT(bookings.id) as booking_count").
		Joins("JOIN vehicles ON vehicles.id = bookings.vehicle_id").
		Joins("JOIN brands ON brands.id = vehicles.brand_id").
		Where("bookings.status IN (?)", []string{"pending", "contacted"}).
		Group("vehicles.id, vehicles.name, brands.name").
		Having("COUNT(bookings.id) > 2").
		Order("booking_count DESC").
		Scan(&highDemandVehicles)

	c.JSON(http.StatusOK, gin.H{
		"available_vehicles":   availableCount,
		"unavailable_vehicles": unavailableCount,
		"high_demand_vehicles": highDemandVehicles,
	})
}
