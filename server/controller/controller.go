package controller

import (
	"encoding/base64"
	"encoding/json"

	"net/http"
	"os/exec"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/config"
	"inventory/model"
)

type getPart struct {
	model.Part
	Storage *model.Storage `json:"storage,omitempty"`
}

func FetchAllPart(c *gin.Context) {
	var parts []model.Part
	config.GetDB().Find(&parts)

	if len(parts) <= 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No parts found!"})
		return
	}

	var getParts []getPart
	for _, part := range parts {
		var gp getPart
		Nil := model.ID{uuid.Nil}
		if part.Storage == Nil {
			gp = getPart{Part: part}
		} else {
			var storage model.Storage
			config.GetDB().First(&storage, part.Storage);
			gp = getPart{Part: part, Storage: &storage}
		}

		getParts = append(getParts, gp)
	}

	c.JSON(http.StatusOK, gin.H{"data": getParts})
}

func FetchPart(c *gin.Context) {
	partID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(partID))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var part model.Part
	config.GetDB().First(&part, id)

	Nil := model.ID{uuid.Nil}
	if part.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
		return
	}

	var gp getPart
	if part.Storage == Nil {
		gp = getPart{Part: part}
	} else {
		var storage model.Storage
		config.GetDB().First(&storage, part.Storage);
		gp = getPart{Part: part, Storage: &storage}
	}

	c.JSON(http.StatusOK, gin.H{"data": gp})
}

func CreatePart(c *gin.Context) {
	var part model.Part
	if err := c.ShouldBindJSON(&part); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	part.ID = model.ID{uuid.New()}
	config.GetDB().Save(&part)

	var gp getPart
	Nil := model.ID{uuid.Nil}
	if part.Storage == Nil {
		gp = getPart{Part: part}
	} else {
		var storage model.Storage
		config.GetDB().First(&storage, part.Storage);
		gp = getPart{Part: part, Storage: &storage}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Part created successfully!", "data": gp})
}

func DeletePart(c *gin.Context) {
	partID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(partID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var part model.Part
	config.GetDB().First(&part, id)

	Nil := model.ID{uuid.Nil}
	if part.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
		return
	}

	var gp getPart
	if part.Storage == Nil {
		gp = getPart{Part: part}
	} else {
		var storage model.Storage
		config.GetDB().First(&storage, part.Storage);
		gp = getPart{Part: part, Storage: &storage}
	}

	config.GetDB().Delete(&part)
	c.JSON(http.StatusOK, gin.H{"message": "Part deleted successfully!", "data": gp})
}

func UpdatePart(c *gin.Context) {
	partID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(partID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var newPart model.Part
	if err := c.ShouldBindJSON(&newPart); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var part model.Part
	config.GetDB().First(&part, id)

	Nil := model.ID{uuid.Nil}
	if part.ID == Nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
		return
	}

	config.GetDB().Model(&part).Select("*").Omit("id").Updates(newPart)

	config.GetDB().First(&part, id)

	var gp getPart
	if part.Storage == Nil {
		gp = getPart{Part: part}
	} else {
		var storage model.Storage
		config.GetDB().First(&storage, part.Storage);
		gp = getPart{Part: part, Storage: &storage}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Part updated successfully!", "data": gp})
}

func CreateLabelPart(c *gin.Context) {
	partID := c.Param("id")

	id, err := uuid.FromBytes(base58.Decode(partID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var part model.Part
	config.GetDB().First(&part, id)

	j, err := json.Marshal(part)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := exec.Command("../label/env/bin/python", "../label/label.py", "item", string(j))
	png64, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	png, err := base64.StdEncoding.Strict().DecodeString(string(png64))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.Data(http.StatusOK, "image/png", png)
}

func FetchAllStorage(c *gin.Context) {
	var storages []model.Storage
	config.GetDB().Find(&storages)

	if len(storages) <= 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No storage found!"})
		return
	}

	type getStorage struct {
		model.Storage
		PartCount int64 `json:"partCount"`
	}
	var gs []getStorage
	for _, storage := range storages {
		var count int64
		config.GetDB().Model(&model.Part{}).Where("storage = ?", storage.ID).Count(&count);

		gs = append(gs, getStorage{storage, count})
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

	gs := struct{
		model.Storage
		Parts []model.Part `json:"parts,omitempty"`
	}{storage, nil}
	config.GetDB().Where("storage = ?", storage.ID).Find(&gs.Parts)

	c.JSON(http.StatusOK, gin.H{"data": gs})
}

func CreateStorage(c *gin.Context) {
	var storage model.Storage
	if err := c.ShouldBindJSON(&storage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	storage.ID = model.ID{uuid.New()}
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

	gs := struct{
		model.Storage
		Parts []model.Part `json:"parts,omitempty"`
	}{storage, nil}
	config.GetDB().Where("storage = ?", storage.ID).Find(&gs.Parts)

	c.JSON(http.StatusOK, gin.H{"message": "Storage updated successfully!", "data": gs})
}
