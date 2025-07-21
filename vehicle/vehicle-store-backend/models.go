package main

import (
	"time"
)

// Brand represents a vehicle brand
type Brand struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null;unique"`
	LogoURL     string    `json:"logo_url"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Vehicles    []Vehicle `json:"vehicles,omitempty" gorm:"foreignKey:BrandID"`
}

// Vehicle represents a vehicle in the inventory
type Vehicle struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	BrandID        uint      `json:"brand_id" gorm:"not null"`
	Brand          Brand     `json:"brand" gorm:"foreignKey:BrandID"`
	Name           string    `json:"name" gorm:"not null"`
	Model          string    `json:"model"`
	Year           int       `json:"year" gorm:"not null"`
	Price          float64   `json:"price" gorm:"not null"`
	FuelType       string    `json:"fuel_type" gorm:"not null"` // Petrol, Diesel, Electric, Hybrid
	ThumbnailURL   string    `json:"thumbnail_url"`
	Description    string    `json:"description"`
	EngineSpecs    string    `json:"engine_specs"`
	Transmission   string    `json:"transmission"`
	Mileage        int       `json:"mileage"`
	ExteriorColor  string    `json:"exterior_color"`
	InteriorColor  string    `json:"interior_color"`
	SafetyFeatures string    `json:"safety_features"`
	FinancingRate  float64   `json:"financing_rate"`
	WarrantyYears  int       `json:"warranty_years"`
	DealerInfo     string    `json:"dealer_info"`
	Availability   bool      `json:"availability" gorm:"default:true"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Bookings       []Booking `json:"bookings,omitempty" gorm:"foreignKey:VehicleID"`
}

// Booking represents a customer booking request
type Booking struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	VehicleID     uint      `json:"vehicle_id" gorm:"not null"`
	Vehicle       Vehicle   `json:"vehicle" gorm:"foreignKey:VehicleID"`
	CustomerName  string    `json:"customer_name" gorm:"not null"`
	CustomerEmail string    `json:"customer_email" gorm:"not null"`
	CustomerPhone string    `json:"customer_phone"`
	Message       string    `json:"message"`
	Status        string    `json:"status" gorm:"default:'pending'"` // pending, contacted, completed, cancelled
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// VehicleFilter represents filter parameters for vehicle queries
type VehicleFilter struct {
	BrandID      uint    `json:"brand_id,omitempty"`
	FuelType     string  `json:"fuel_type,omitempty"`
	MinPrice     float64 `json:"min_price,omitempty"`
	MaxPrice     float64 `json:"max_price,omitempty"`
	Search       string  `json:"search,omitempty"`
	Limit        int     `json:"limit,omitempty"`
	Offset       int     `json:"offset,omitempty"`
	Availability bool    `json:"availability,omitempty"`
}

// Analytics represents basic inventory analytics
type Analytics struct {
	TotalVehicles    int64              `json:"total_vehicles"`
	VehiclesByBrand  map[string]int64   `json:"vehicles_by_brand"`
	VehiclesByFuel   map[string]int64   `json:"vehicles_by_fuel"`
	TotalBookings    int64              `json:"total_bookings"`
	BookingsByStatus map[string]int64   `json:"bookings_by_status"`
	AveragePrice     float64            `json:"average_price"`
	PriceRange       map[string]float64 `json:"price_range"`
}
