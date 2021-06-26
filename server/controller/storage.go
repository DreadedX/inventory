package controller

import (
	"net/http"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/config"
	"inventory/model"
)

type getStorage struct {
	model.Storage
	Parts []model.Part `json:"parts,omitempty"`
	PartCount int64 `json:"partCount,omitempty"`
}

func FetchAllStorage(c *gin.Context) {
	var storages []model.Storage
	config.GetDB().Find(&storages)

	if len(storages) <= 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
		return
	}

	var gs []getStorage
	for _, storage := range storages {
		var count int64
		config.GetDB().Model(&model.Part{}).Where("storage = ?", storage.ID).Count(&count);

		gs = append(gs, getStorage{Storage: storage, PartCount: count})
	}

	c.JSON(http.StatusOK, gin.H{"data": gs})
}

func FetchStorage(c *gin.Context) {
	partID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(partID))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var storage model.Storage
	config.GetDB().First(&storage, id)

	Nil := model.ID{uuid.Nil}
	if storage.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
		return
	}

	gs := getStorage{Storage: storage}
	config.GetDB().Where("storage = ?", storage.ID).Find(&gs.Parts)
	gs.PartCount = int64(len(gs.Parts))

	c.JSON(http.StatusOK, gin.H{"data": gs})
}

func CreateStorage(c *gin.Context) {
	var storage model.Storage
	if err := c.ShouldBindJSON(&storage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.GetDB().Save(&storage)
	c.JSON(http.StatusCreated, gin.H{"message": "Storage created successfully!", "data": storage})
}

func DeleteStorage(c *gin.Context) {
	storageID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(storageID))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var storage model.Storage
	config.GetDB().First(&storage, id)

	Nil := model.ID{uuid.Nil}
	if storage.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
		return
	}

	var parts []model.Part
	config.GetDB().Where("storage = ?", storage.ID).Find(&parts)
	for _, part := range parts {
		config.GetDB().Model(&part).Update("storage", model.ID{uuid.Nil})
	}

	config.GetDB().Delete(&storage)
	c.JSON(http.StatusOK, gin.H{"message": "Storage deleted successfully!", "data": storage})
}

func UpdateStorage(c *gin.Context) {
	storageID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(storageID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var newStorage model.Storage
	if err := c.ShouldBindJSON(&newStorage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var storage model.Storage
	config.GetDB().First(&storage, id)

	Nil := model.ID{uuid.Nil}
	if storage.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
		return
	}

	config.GetDB().Model(&storage).Select("*").Omit("id").Updates(newStorage)

	config.GetDB().First(&storage, id)

	gs := getStorage{Storage: storage}
	config.GetDB().Where("storage = ?", storage.ID).Find(&gs.Parts)
	gs.PartCount = int64(len(gs.Parts))

	c.JSON(http.StatusOK, gin.H{"message": "Storage updated successfully!", "data": gs})
}
