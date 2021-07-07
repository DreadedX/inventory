package label

import (
	"encoding/base64"
	"encoding/json"

	"net/http"
	"os/exec"

	"github.com/btcsuite/btcutil/base58"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"inventory/handlers"
	"inventory/models"
)

func PreviewPart(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		idString := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(idString))
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

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "--preview", "part", string(j))
		png64, err := cmd.CombinedOutput()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		png, err := base64.StdEncoding.Strict().DecodeString(string(png64))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Data(http.StatusOK, "image/png", png)
	}
}

func PreviewStorage(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		idString := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(idString))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var storage models.Storage
		env.DB.First(&storage, id)

		j, err := json.Marshal(storage)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "--preview", "storage", string(j))
		png64, err := cmd.CombinedOutput()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		png, err := base64.StdEncoding.Strict().DecodeString(string(png64))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Data(http.StatusOK, "image/png", png)
	}
}

func PreviewCustom(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "--preview", "custom", "{\"name\":\"" + name + "\"}")
		png64, err := cmd.CombinedOutput()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		png, err := base64.StdEncoding.Strict().DecodeString(string(png64))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Data(http.StatusOK, "image/png", png)
	}
}

func PrintPart(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		idString := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(idString))
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

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "part", string(j))
		_, err = cmd.Output()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

func PrintStorage(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		idString := c.Param("id")

		id, err := uuid.FromBytes(base58.Decode(idString))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var storage models.Storage
		env.DB.First(&storage, id)

		j, err := json.Marshal(storage)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "storage", string(j))
		_, err = cmd.Output()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

func PrintCustom(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")

		cmd := exec.Command(env.PythonPath + "python", env.LabelPath + "label.py", "custom", "{\"name\":\"" + name + "\"}")
		_, err := cmd.Output()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}
