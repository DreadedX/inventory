package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"inventory/config"
	"inventory/migration"
	"inventory/route"
)

func init() {
	db := config.Init()
	migration.Migrate(db)
}

func main() {
	gin.SetMode(gin.ReleaseMode)

	r := route.SetupRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
