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

// @todo Integrate both of these functions into CreatePart/UpdatePart/DeletePart
func CreateLink(c *gin.Context) {
	var link model.Link
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	Nil := model.ID{uuid.Nil}
	if link.Part == Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Link needs to be associated with a part!"})
		return
	}

	config.GetDB().Save(&link)
	c.JSON(http.StatusCreated, gin.H{"message": "Link created successfully!", "data": link})
}

func DeleteLink(c *gin.Context) {
	id := c.Param("id")

	var link model.Link
	config.GetDB().First(&link, id)

	if link.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No link found!"})
		return
	}

	config.GetDB().Delete(&link)
	c.JSON(http.StatusOK, gin.H{"message": "Link deleted successfully!", "data": link})
}
