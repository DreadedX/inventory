package part

import (
	"net/http"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/models"
	"inventory/handlers"
)

type getPart struct {
	models.Part
	Storage *models.Storage `json:"storage,omitempty"`
	Links []string `json:"links,omitempty"`
}

type createPart struct {
	*models.Part
	Links *[]string `json:"links"`
}

func FetchAll(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var parts []models.Part
		env.DB.Find(&parts)

		if len(parts) <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No parts found!"})
			return
		}

		var getParts []getPart
		for _, part := range parts {
			Nil := models.ID{uuid.Nil}
			gp := getPart{Part: part}
			if part.Storage != Nil {
				env.DB.First(&gp.Storage, part.Storage)
			}

			getParts = append(getParts, gp)
		}

		c.JSON(http.StatusOK, gin.H{"data": getParts})
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

		var part models.Part
		env.DB.First(&part, id)

		Nil := models.ID{uuid.Nil}
		if part.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		gp := getPart{Part: part}
		if part.Storage != Nil {
			env.DB.First(&gp.Storage, part.Storage)
		}
		env.DB.Model(&models.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)

		c.JSON(http.StatusOK, gin.H{"data": gp})
	}
}

func Create(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var part models.Part
		var links []string
		if err := c.ShouldBindJSON(&createPart{&part, &links}); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		env.DB.Save(&part)

		// Create all the attached links
		for _, link := range links {
			if (len(link) > 0) {
				env.DB.Save(&models.Link{Url: link, Part: part.ID})
			}
		}

		Nil := models.ID{uuid.Nil}
		gp := getPart{Part: part, Links: links}
		if part.Storage != Nil {
			env.DB.First(&gp.Storage, part.Storage)
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Part created successfully!", "data": gp})
	}
}

func Delete(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		partID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(partID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var part models.Part
		env.DB.First(&part, id)

		Nil := models.ID{uuid.Nil}
		if part.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		gp := getPart{Part: part}
		if part.Storage != Nil {
			env.DB.First(&gp.Storage, part.Storage)
		}

		// Remove all links associated with this part
		env.DB.Model(&models.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)
		env.DB.Model(&models.Link{}).Where("part = ?", part.ID).Delete(&models.Part{})

		env.DB.Delete(&part)
		c.JSON(http.StatusOK, gin.H{"message": "Part deleted successfully!", "data": gp})
	}
}


func Update(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		partID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(partID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var newPart models.Part
		var links []string
		if err := c.ShouldBindJSON(&createPart{&newPart, &links}); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var part models.Part
		env.DB.First(&part, id)

		Nil := models.ID{uuid.Nil}
		if part.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		env.DB.Model(&part).Select("*").Omit("id").Updates(newPart)

		// Delete all existsing links and create submitted links
		// This does mean that we have to recreate link if they do not changes,
		// not sure if this is a big deal
		env.DB.Model(&models.Link{}).Where("part = ?", part.ID).Delete(&models.Part{})
		for _, link := range links {
			if (len(link) > 0) {
				env.DB.Save(&models.Link{Url: link, Part: part.ID})
			}
		}

		env.DB.First(&part, id)

		gp := getPart{Part: part, Links: links}
		if part.Storage != Nil {
			env.DB.First(&gp.Storage, part.Storage)
		}
		env.DB.Model(&models.Link{}).Where("part = ?", part.ID).Select("url").Find(&gp.Links)

		c.JSON(http.StatusOK, gin.H{"message": "Part updated successfully!", "data": gp})
	}
}
