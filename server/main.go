package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"inventory/handlers/label"
	"inventory/handlers/part"
	"inventory/handlers/storage"
	"inventory/models"
)

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&models.Part{})
	db.AutoMigrate(&models.Storage{})
	db.AutoMigrate(&models.Link{})
}

func main() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "testdb"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "root"
	}

	dbPass := os.Getenv("DB_PASS")
	if dbPass == "" {
		dbPass = "root"
	}

	dsn := fmt.Sprintf("host=%v port=%v dbname=%v user=%v password=%v sslmode=disable", dbHost, dbPort, dbName, dbUser, dbPass)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
	Migrate(db)

	router := gin.Default()

	// Host react ui
	router.Use(static.Serve("/", static.LocalFile("ui", false)))
	router.NoRoute(func(c *gin.Context) {
		c.File("ui/index.html")
	})

	partServer := part.NewPartServer(&part.Server{DB: db})
	router.POST(partServer.PathPrefix() + "*w", gin.WrapH(partServer))

	storageServer := storage.NewStorageServer(&storage.Server{DB: db})
	router.POST(storageServer.PathPrefix() + "*w", gin.WrapH(storageServer))

	labelServer := label.NewLabelServer(&label.Server{DB: db, PythonPath: os.Getenv("INVENTORY_PYTHON_PATH"), PrintPath: os.Getenv("INVENTORY_PRINT_PATH")})
	router.POST(labelServer.PathPrefix() + "*w", gin.WrapH(labelServer))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Starting server on port:", port)

	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
