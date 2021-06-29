package label

import (
	"encoding/base64"
	"encoding/json"

	"net/http"
	"os/exec"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/models"
	"inventory/handlers"
)

func Generate(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		partID := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(partID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var part models.Part
		env.DB.First(&part, id)

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
}
