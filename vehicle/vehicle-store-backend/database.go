package main

import (
	"log"
	"os"

	"vehicle-store-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect initializes the database connection
func Connect() {
	var err error

	// Use SQLite database file
	dbPath := getEnv("DB_PATH", "vehicle_store.db")

	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

// Migrate runs database migrations
func Migrate() {
	err := DB.AutoMigrate(
		&models.Brand{},
		&models.Vehicle{},
		&models.Booking{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")
}

// SeedData populates the database with initial data
func SeedData() {
	// Check if brands already exist
	var count int64
	DB.Model(&models.Brand{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded")
		return
	}

	// Create sample brands
	brands := []models.Brand{
		{Name: "Toyota", LogoURL: "/images/brands/toyota.png", Description: "Quality and reliability leader"},
		{Name: "Honda", LogoURL: "/images/brands/honda.png", Description: "Innovation and efficiency"},
		{Name: "Ford", LogoURL: "/images/brands/ford.png", Description: "Built tough, built to last"},
		{Name: "BMW", LogoURL: "/images/brands/bmw.png", Description: "The ultimate driving machine"},
		{Name: "Mercedes-Benz", LogoURL: "/images/brands/mercedes.png", Description: "The best or nothing"},
		{Name: "Audi", LogoURL: "/images/brands/audi.png", Description: "Vorsprung durch Technik"},
		{Name: "Tesla", LogoURL: "/images/brands/tesla.png", Description: "Accelerating the world's transition to sustainable energy"},
		{Name: "Volkswagen", LogoURL: "/images/brands/volkswagen.png", Description: "Das Auto"},
	}

	for _, brand := range brands {
		DB.Create(&brand)
	}

	// Create sample vehicles
	vehicles := []models.Vehicle{
		{
			BrandID: 1, Name: "Camry", Model: "LE", Year: 2024, Price: 28750.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/toyota-camry-2024.jpg", Description: "Reliable midsize sedan",
			EngineSpecs: "2.5L 4-Cylinder", Transmission: "8-Speed Automatic", Mileage: 32,
			ExteriorColor: "Midnight Black", InteriorColor: "Black Fabric", SafetyFeatures: "Toyota Safety Sense 2.0",
			FinancingRate: 2.9, WarrantyYears: 3, DealerInfo: "Downtown Toyota - (555) 123-4567",
		},
		{
			BrandID: 1, Name: "Prius", Model: "LE", Year: 2024, Price: 27450.00, FuelType: "Hybrid",
			ThumbnailURL: "/images/vehicles/toyota-prius-2024.jpg", Description: "Most fuel-efficient hybrid",
			EngineSpecs: "1.8L Hybrid", Transmission: "CVT", Mileage: 58,
			ExteriorColor: "Blue Crush", InteriorColor: "Black SofTex", SafetyFeatures: "Toyota Safety Sense 2.0",
			FinancingRate: 2.4, WarrantyYears: 3, DealerInfo: "Downtown Toyota - (555) 123-4567",
		},
		{
			BrandID: 2, Name: "Civic", Model: "LX", Year: 2024, Price: 25200.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/honda-civic-2024.jpg", Description: "Compact car with style",
			EngineSpecs: "2.0L 4-Cylinder", Transmission: "CVT", Mileage: 35,
			ExteriorColor: "Sonic Gray", InteriorColor: "Black Cloth", SafetyFeatures: "Honda Sensing",
			FinancingRate: 3.1, WarrantyYears: 3, DealerInfo: "Metro Honda - (555) 234-5678",
		},
		{
			BrandID: 4, Name: "3 Series", Model: "330i", Year: 2024, Price: 45950.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/bmw-3series-2024.jpg", Description: "Ultimate sport sedan",
			EngineSpecs: "2.0L TwinPower Turbo", Transmission: "8-Speed Automatic", Mileage: 28,
			ExteriorColor: "Alpine White", InteriorColor: "Black Sensatec", SafetyFeatures: "BMW Active Guard",
			FinancingRate: 3.9, WarrantyYears: 4, DealerInfo: "Luxury BMW - (555) 345-6789",
		},
		{
			BrandID: 7, Name: "Model 3", Model: "Long Range", Year: 2024, Price: 47740.00, FuelType: "Electric",
			ThumbnailURL: "/images/vehicles/tesla-model3-2024.jpg", Description: "Premium electric sedan",
			EngineSpecs: "Dual Motor AWD", Transmission: "Single-Speed", Mileage: 358,
			ExteriorColor: "Pearl White", InteriorColor: "Black Premium", SafetyFeatures: "Autopilot Included",
			FinancingRate: 2.99, WarrantyYears: 4, DealerInfo: "Tesla Service Center - (555) 456-7890",
		},
		{
			BrandID: 3, Name: "F-150", Model: "XLT", Year: 2024, Price: 42970.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/ford-f150-2024.jpg", Description: "America's best-selling truck",
			EngineSpecs: "3.3L V6", Transmission: "10-Speed Automatic", Mileage: 24,
			ExteriorColor: "Oxford White", InteriorColor: "Medium Earth Gray", SafetyFeatures: "Ford Co-Pilot360",
			FinancingRate: 3.5, WarrantyYears: 3, DealerInfo: "Ford Country - (555) 567-8901",
		},
		{
			BrandID: 5, Name: "C-Class", Model: "C300", Year: 2024, Price: 47850.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/mercedes-c300-2024.jpg", Description: "Luxury redefined",
			EngineSpecs: "2.0L Turbo", Transmission: "9G-TRONIC", Mileage: 26,
			ExteriorColor: "Obsidian Black", InteriorColor: "Black Artico", SafetyFeatures: "Mercedes-Benz Intelligent Drive",
			FinancingRate: 4.2, WarrantyYears: 4, DealerInfo: "Mercedes-Benz Elite - (555) 678-9012",
		},
		{
			BrandID: 6, Name: "A4", Model: "Premium", Year: 2024, Price: 43800.00, FuelType: "Petrol",
			ThumbnailURL: "/images/vehicles/audi-a4-2024.jpg", Description: "Progressive luxury sedan",
			EngineSpecs: "2.0L TFSI", Transmission: "7-Speed S tronic", Mileage: 29,
			ExteriorColor: "Brilliant Black", InteriorColor: "Black Fine Nappa", SafetyFeatures: "Audi pre sense",
			FinancingRate: 3.8, WarrantyYears: 4, DealerInfo: "Audi Prestige - (555) 789-0123",
		},
	}

	for _, vehicle := range vehicles {
		DB.Create(&vehicle)
	}

	log.Println("Database seeded successfully")
}

// getEnv gets environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
