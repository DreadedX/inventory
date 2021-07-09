package part

import (
	"net/http"
	"sort"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lithammer/fuzzysearch/fuzzy"

	"inventory/handlers"
	"inventory/models"
)

func FetchAll(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		search := c.Param("search")
		// @todo This does not properly deal with unicode
		search = search[1:]

		var parts []models.Part

		env.DB.Order("name ASC").Joins("Storage").Find(&parts)

		if len(search) > 0 {
			var values []string
			for _, part := range parts {
				v := part.Name + " " + part.Description + " " + part.Footprint
				if part.Storage != nil {
					v += part.Storage.Name
				}
				values = append(values, v)
			}
			ranks := fuzzy.RankFindNormalizedFold(search, values)

			sort.Sort(ranks)

			var temp []models.Part
			for _, rank := range ranks {
				temp = append(temp, parts[rank.OriginalIndex])
			}
			parts = temp
		}

		if len(parts) <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No parts found!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": parts})
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
		env.DB.Joins("Storage").Preload("Links").First(&part, id)
		Nil := models.ID{uuid.Nil}
		if part.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": part})
	}
}

func Create(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		var part models.Part
		if err := c.ShouldBindJSON(&part); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := env.DB.Save(&part).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := env.DB.Joins("Storage").Preload("Links").First(&part).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Part created successfully!", "data": part})
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
		env.DB.Joins("Storage").Preload("Links").First(&part, id)
		Nil := models.ID{uuid.Nil}
		if part.ID == Nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		if err := env.DB.Select("Links").Delete(&part).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Part deleted successfully!", "data": part})
	}
}


func Update(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		partID := c.Param("id")

		// Convert the string id to uuid
		id, err := uuid.FromBytes(base58.Decode(partID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Make sure the entry exist
		var count int64
		env.DB.Model(&models.Part{}).Where("id = ?", id).Count(&count)
		if count <= 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No part found!"})
			return
		}

		// Convert the provided JSON to struct
		var part models.Part
		if err := c.ShouldBindJSON(&part); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Make sure that the ID is set to the correct value
		part.ID = models.ID{id}

		// Update part
		if err := env.DB.Omit("Storage", "Links").Updates(&part).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// @todo Figure out a better way to update the links
		// Remove all existing links
		if err := env.DB.Where("part_id = ?", id).Delete(&models.Link{}).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Add all the links
		for i, link := range part.Links {
			if (len(link.Url) > 0) {
				part.Links[i].PartID = models.ID{id};
				if err := env.DB.Save(&part.Links[i]).Error; err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
			}
		}

		// Load the updated entry
		if err := env.DB.Joins("Storage").Preload("Links").First(&part, id).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Return the updated entry
		c.JSON(http.StatusOK, gin.H{"message": "Part updated successfully!", "data": part})
	}
}
