package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// TODO: Import and call your database.Connect(), database.Migrate(), and database.SeedData() here
	// TODO: Register your API routes (handlers) here

	r := gin.Default()

	// Example CORS middleware (allow all for dev)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Next()
	})

	// TODO: Register your actual API routes here
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	log.Println("Server running on :8080")
	r.Run(":8080")
}
