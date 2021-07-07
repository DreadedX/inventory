package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"inventory/handlers"
	"inventory/handlers/label"
	"inventory/handlers/part"
	"inventory/handlers/storage"
	"inventory/models"
	"inventory/socket"
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

	hub := socket.NewHub()
	go hub.Run()

	env := &handlers.Env{DB: db, Hub: hub}

	env.PythonPath = os.Getenv("INVENTORY_PYTHON_PATH")
	env.LabelPath = os.Getenv("INVENTORY_LABEL_PATH")
	if env.LabelPath == "" {
		env.LabelPath = "label/"
	}

	gin.SetMode(gin.TestMode)
	router := gin.Default()

	// This is just for testing socket stuff
	router.GET("/socket", func(c *gin.Context) {
		c.File("../socket.html")
	})

	// Host react ui
	router.Use(static.Serve("/", static.LocalFile("ui", false)))
	router.NoRoute(func(c *gin.Context) {
		c.File("ui/index.html")
	})

	v1 := router.Group("/v1")
	{
		p := v1.Group("part")
		{
			p.GET("list/*search", part.FetchAll(env))
			p.GET("get/:id", part.Fetch(env))
			p.POST("create", part.Create(env))
			p.PUT("update/:id", part.Update(env))
			p.DELETE("delete/:id", part.Delete(env))
		}

		s := v1.Group("storage")
		{
			s.GET("list", storage.FetchAll(env))
			s.GET("get/:id", storage.Fetch(env))
			s.POST("create", storage.Create(env))
			s.PUT("update/:id", storage.Update(env))
			s.DELETE("delete/:id", storage.Delete(env))
		}

		v1.GET("label/part/:id", label.PrintPart(env))
		v1.GET("label/part/:id/preview", label.PreviewPart(env))
		v1.GET("label/storage/:id", label.PrintStorage(env))
		v1.GET("label/storage/:id/preview", label.PreviewStorage(env))
	}

	router.GET("/ws", func(c *gin.Context) {
		socket.ServeWs(hub, c.Writer, c.Request)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Starting server on port:", port)

	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
