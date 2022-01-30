package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"inventory/handlers/file"
	"inventory/handlers/label"
	"inventory/handlers/part"
	"inventory/handlers/printer"
	"inventory/handlers/storage"
	"inventory/models"
)

func initDatabase() *gorm.DB {
	dbHost, ok := os.LookupEnv("DB_HOST")
	if !ok {
		dbHost = "localhost"
	}

	dbPort, ok := os.LookupEnv("DB_PORT")
	if !ok {
		dbPort = "5432"
	}

	dbName, ok := os.LookupEnv("DB_NAME")
	if !ok {
		dbName = "testdb"
	}

	dbUser, ok := os.LookupEnv("DB_USER")
	if !ok {
		dbUser = "root"
	}

	dbPass, ok := os.LookupEnv("DB_PASS")
	if !ok {
		dbPass = "root"
	}

	dsn := fmt.Sprintf("host=%v port=%v dbname=%v user=%v password=%v sslmode=disable", dbHost, dbPort, dbName, dbUser, dbPass)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	db.AutoMigrate(&models.Part{})
	db.AutoMigrate(&models.Storage{})
	db.AutoMigrate(&models.Link{})
	db.AutoMigrate(&models.File{})

	return db
}

func initStorage() file.Storage {
	storageHost, ok := os.LookupEnv("STORAGE_HOST")
	if !ok {
		storageHost = "localhost:9000"
	}

	storageUser, ok := os.LookupEnv("STORAGE_USER")
	if !ok {
		storageUser = "testuser"
	}

	storagePass, ok := os.LookupEnv("STORAGE_PASS")
	if !ok {
		storagePass = "testuser"
	}

	storageSecureValue, ok := os.LookupEnv("STORAGE_SECURE")
	storageSecure := false
	if ok && storageSecureValue=="true" {
		storageSecure = true
	}

	var storage file.Storage
	storage.BucketName, ok = os.LookupEnv("STORAGE_BUCKET")
	if !ok {
		storage.BucketName = "inventory-files"
	}

	var err error
	storage.Client, err = minio.New(storageHost, &minio.Options{
		Creds:  credentials.NewStaticV4(storageUser, storagePass, ""),
		Secure: storageSecure,
	})
	if err != nil {
		panic(err)
	}


	exists, err := storage.Client.BucketExists(context.Background(), storage.BucketName)
	if err != nil {
		panic(err)
	}

	if !exists {
		err = storage.Client.MakeBucket(context.Background(), storage.BucketName, minio.MakeBucketOptions{})
		if err != nil {
			panic(err)
		}

		log.Printf("Created storage bucket %s\n", storage.BucketName)
	}

	return storage
}

func main() {
	db := initDatabase()
	store := initStorage()

	printerHost, ok := os.LookupEnv("PRINTER_HOST")
	if !ok {
		printerHost = "http://localhost:4000"
	}

	router := gin.Default()

	// Host react ui
	router.Use(static.Serve("/", static.LocalFile("ui", false)))
	router.NoRoute(func(c *gin.Context) {
		c.File("ui/index.html")
	})

	fileServerStruct := &file.Server{DB: db, Storage: &store}
	fileServer := file.NewFileServer(fileServerStruct)
	router.POST(fileServer.PathPrefix()+"*w", gin.WrapH(fileServer))
	router.GET("/file/:partId/:hash", fileServerStruct.Download)

	partServer := part.NewPartServer(&part.Server{DB: db, FileServer: fileServerStruct})
	router.POST(partServer.PathPrefix()+"*w", gin.WrapH(partServer))

	storageServer := storage.NewStorageServer(&storage.Server{DB: db})
	router.POST(storageServer.PathPrefix()+"*w", gin.WrapH(storageServer))


	printerClient := printer.NewPrinterProtobufClient(printerHost, &http.Client{})
	labelServer := label.NewLabelServer(&label.Server{DB: db, Printer: printerClient})
	router.POST(labelServer.PathPrefix()+"*w", gin.WrapH(labelServer))

	router.POST("/print", func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		content, err := file.Open()
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		buffer := make([]byte, file.Size)
		content.Read(buffer)

		_, err = printerClient.Print(context.Background(), &printer.Request{
			Image: buffer,
		})

		if err != nil {
			log.Println(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.Status(http.StatusOK)
	})

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "8080"
	}

	fmt.Println("Starting server on port:", port)

	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}
