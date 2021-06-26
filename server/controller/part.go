package controller

import (
	"net/http"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/config"
	"inventory/model"
)

type getPart struct {
	model.Part
	Storage *model.Storage `json:"storage,omitempty"`
	Links []string `json:"links,omitempty"`
}

type createPart struct {
	*model.Part
	Links *[]string `json:"links"`
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
		Nil := model.ID{uuid.Nil}
		gp := getPart{Part: part}
		if part.Storage != Nil {
			config.GetDB().First(&gp.Storage, part.Storage)
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

	gp := getPart{Part: part}
	if part.Storage != Nil {
		config.GetDB().First(&gp.Storage, part.Storage)
	}
	config.GetDB().Model(&model.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)

	c.JSON(http.StatusOK, gin.H{"data": gp})
}

func CreatePart(c *gin.Context) {
	var part model.Part
	var links []string
	if err := c.ShouldBindJSON(&createPart{&part, &links}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.GetDB().Save(&part)

	// Create all the attached links
	for _, link := range links {
		if (len(link) > 0) {
			config.GetDB().Save(&model.Link{Url: link, Part: part.ID})
		}
	}

	Nil := model.ID{uuid.Nil}
	gp := getPart{Part: part, Links: links}
	if part.Storage != Nil {
		config.GetDB().First(&gp.Storage, part.Storage)
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

	gp := getPart{Part: part}
	if part.Storage != Nil {
		config.GetDB().First(&gp.Storage, part.Storage)
	}

	// Remove all links associated with this part
	config.GetDB().Model(&model.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)
	config.GetDB().Model(&model.Link{}).Where("part = ?", part.ID).Delete(&model.Part{})

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
	var links []string
	if err := c.ShouldBindJSON(&createPart{&newPart, &links}); err != nil {
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

	// Delete all existsing links and create submitted links
	// This does mean that we have to recreate link if they do not changes,
	// not sure if this is a big deal
	config.GetDB().Model(&model.Link{}).Where("part = ?", part.ID).Delete(&model.Part{})
	for _, link := range links {
		if (len(link) > 0) {
			config.GetDB().Save(&model.Link{Url: link, Part: part.ID})
		}
	}

	config.GetDB().First(&part, id)

	gp := getPart{Part: part, Links: links}
	if part.Storage != Nil {
		config.GetDB().First(&gp.Storage, part.Storage)
	}
	config.GetDB().Model(&model.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)

	c.JSON(http.StatusOK, gin.H{"message": "Part updated successfully!", "data": gp})
}
