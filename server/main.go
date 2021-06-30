package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/static"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"

	"inventory/models"
	"inventory/handlers"
	"inventory/handlers/part"
	"inventory/handlers/storage"
	"inventory/handlers/label"
)

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&models.Part{})
	db.AutoMigrate(&models.Storage{})
	db.AutoMigrate(&models.Link{})
}

func main() {
	dsn := "host=localhost port=5432 user=root dbname=testdb password=root sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
	Migrate(db)

	env := &handlers.Env{DB: db}

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Host react ui
	router.Use(static.Serve("/", static.LocalFile("../ui-dist", false)))
	router.NoRoute(func(c *gin.Context) {
		c.File("../ui-dist/index.html")
	})

	v1 := router.Group("/v1")
	{
		p := v1.Group("part")
		{
			p.GET("list", part.FetchAll(env))
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

		v1.GET("label/:id", label.Generate(env))
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
