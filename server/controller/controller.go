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
