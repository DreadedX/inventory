package label

import (
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

		png, err := generateLabelPart(&part)
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

		png, err := generateLabelStorage(&storage)
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

		png, err := generateLabelCustom(name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Data(http.StatusOK, "image/png", png)
	}
}

func printPNG(env *handlers.Env, png []byte) error {
	cmd := exec.Command(env.PythonPath + "python", env.PrintPath + "print.py")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}

	// @TODO Make sure we handle any error here properly
	go func() {
		defer stdin.Close()
		if _, err := stdin.Write(png); err != nil {
			return
		}
	}()

	if err := cmd.Run(); err != nil {
		return err
	}

	return nil
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

		png, err := generateLabelPart(&part)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := printPNG(env, png); err != nil {
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

		png, err := generateLabelStorage(&storage)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := printPNG(env, png); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

func PrintCustom(env *handlers.Env) gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")

		png, err := generateLabelCustom(name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := printPNG(env, png); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}
