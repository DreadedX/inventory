package storage

import (
	"net/http"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/models"
	"inventory/handlers"
)

type getStorage struct {
	models.Storage
	Parts []models.Part `json:"parts,omitempty"`
	PartCount int64 `json:"partCount,omitempty"`
}

func FetchAll(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var storages []models.Storage
		env.DB.Find(&storages)

		if len(storages) <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		var gs []getStorage
		for _, storage := range storages {
			var count int64
			env.DB.Model(&models.Part{}).Where("storage = ?", storage.ID).Count(&count);

			gs = append(gs, getStorage{Storage: storage, PartCount: count})
		}

		c.JSON(http.StatusOK, gin.H{"data": gs})
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
		env.DB.First(&storage, id)

		Nil := models.ID{uuid.Nil}
		if storage.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		gs := getStorage{Storage: storage}
		env.DB.Where("storage = ?", storage.ID).Find(&gs.Parts)
		gs.PartCount = int64(len(gs.Parts))

		c.JSON(http.StatusOK, gin.H{"data": gs})
	}
}

func Create(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var storage models.Storage
		if err := c.ShouldBindJSON(&storage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		env.DB.Save(&storage)
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
		env.DB.First(&storage, id)

		Nil := models.ID{uuid.Nil}
		if storage.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		var parts []models.Part
		env.DB.Where("storage = ?", storage.ID).Find(&parts)
		for _, part := range parts {
			env.DB.Model(&part).Update("storage", models.ID{uuid.Nil})
		}

		env.DB.Delete(&storage)
		c.JSON(http.StatusOK, gin.H{"message": "Storage deleted successfully!", "data": storage})
	}
}

func Update(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		storageID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(storageID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var newStorage models.Storage
		if err := c.ShouldBindJSON(&newStorage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var storage models.Storage
		env.DB.First(&storage, id)

		Nil := models.ID{uuid.Nil}
		if storage.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
			return
		}

		env.DB.Model(&storage).Select("*").Omit("id").Updates(newStorage)

		env.DB.First(&storage, id)

		gs := getStorage{Storage: storage}
		env.DB.Where("storage = ?", storage.ID).Find(&gs.Parts)
		gs.PartCount = int64(len(gs.Parts))

		c.JSON(http.StatusOK, gin.H{"message": "Storage updated successfully!", "data": gs})
	}
}
