package storage

import (
	"net/http"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"inventory/handlers"
	"inventory/models"
)

func FetchAll(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var storages []models.Storage
		env.DB.Order("name ASC").Find(&storages)

		if len(storages) <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		for i, storage := range storages {
			storages[i].PartCount = env.DB.Model(&storage).Association("Parts").Count()
		}


		c.JSON(http.StatusOK, gin.H{"data": storages})
	}
}

func Fetch(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		partID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(partID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var storage models.Storage
		env.DB.Preload("Parts", func(db *gorm.DB) *gorm.DB {
			return db.Order("parts.name ASC")
		}).First(&storage, id)
		Nil := models.ID{uuid.Nil}
		if storage.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": storage})
	}
}

func Create(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var storage models.Storage
		if err := c.ShouldBindJSON(&storage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := env.DB.Save(&storage).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		env.Hub.Broadcast <- []byte("storage:create")

		c.JSON(http.StatusCreated, gin.H{"message": "Storage created successfully!", "data": storage})
	}
}

func Delete(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		storageID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(storageID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var storage models.Storage
		env.DB.Preload("Parts").First(&storage, id)
		Nil := models.ID{uuid.Nil}
		if storage.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		if err := env.DB.Delete(&storage).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		env.Hub.Broadcast <- []byte("storage:delete")

		c.JSON(http.StatusOK, gin.H{"message": "Storage deleted successfully!", "data": storage})
	}
}

func Update(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		storageID := c.Param("id")

		// Convert the string id to uuid
		id, err := uuid.FromBytes(base58.Decode(storageID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Make sure the entry exist
		var count int64
		env.DB.Model(&models.Storage{}).Where("id = ?", id).Count(&count)
		if count <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		// Convert the provided JSON to struct
		var storage models.Storage
		if err := c.ShouldBindJSON(&storage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Make sure that the ID is set to the correct value
		storage.ID = models.ID{id}

		// Update storage
		if err := env.DB.Omit("Parts", "ID").Updates(&storage).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Load the updated entry
		if err := env.DB.Preload("Parts").First(&storage, id).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		env.Hub.Broadcast <- []byte("storage:update")

		// Return the updated entry
		c.JSON(http.StatusOK, gin.H{"message": "Storage updated successfully!", "data": storage})
	}
}
