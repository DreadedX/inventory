package file

import (
	context "context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"inventory/models"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Server struct {
	DB *gorm.DB
}

func (s *Server) Download(c *gin.Context) {
	hash := c.Param("hash")

	var file models.File
	s.DB.First(&file, "hash = ?", hash)

	if file.Id == 0 {
		c.Status(404)
		return
	}

	// We do not have to check the length of the hash, since we know it is valid
	// @TODO Make this not hard coded

	// Set header to give the file the appropriate filename
	c.Writer.Header().Set("Content-Disposition", fmt.Sprintf("filename=\"%s\"", file.Filename))
	c.File(file.Filepath())
}

func (s *Server) Upload(ctx context.Context, req *UploadRequest) (*models.File, error) {
	hash := sha256.Sum256(req.Data)
	file := models.File{Filename: req.Filename, Hash: hex.EncodeToString(hash[:]), PartId: req.PartId}

	_, err := os.Stat(file.Filepath())
	log.Println(err)
	if errors.Is(err, os.ErrNotExist) {
		path := file.Filepath()
		err = os.MkdirAll(filepath.Dir(path), os.ModePerm)
		err = os.WriteFile(path, req.Data, 0666)
		log.Println(err)
	} else {
		log.Println("File already exists")
	}

	if err := s.DB.Create(&file).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to store file"), err)
	}

	log.Println(file)

	return &file, nil
}

func (s *Server) Delete(ctx context.Context, id *models.ID) (*models.File, error) {
	return nil, nil
}
