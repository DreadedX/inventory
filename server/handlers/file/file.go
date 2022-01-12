package file

import (
	"bytes"
	context "context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"inventory/models"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Storage struct {
	Client     *minio.Client
	BucketName string
}

type Server struct {
	DB *gorm.DB
	Storage *Storage
}

func (s *Server) Download(c *gin.Context) {
	partId := models.ID{Id: c.Param("partId")}
	hash := c.Param("hash")

	var file models.File
	if err := s.DB.First(&file, "hash = ? AND part_id = ?", hash, &partId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.Status(404)
			return
		}

		log.Println("First err:", err)
		c.Status(500)
		return
	}

	// Get the object
	object, err := s.Storage.Client.GetObject(context.Background(), s.Storage.BucketName, file.Hash, minio.GetObjectOptions{})
	if err != nil {
		log.Println("GetObject err:", err)
		c.Status(500)
		return
	}

	// Get ObjectInfo
	// @TODO If the object does not exist in the storage, this will give and error
	// It would be nice to handle that error somehow
	stat, err := object.Stat()
	if err != nil {
		log.Println("Stat err:", err)
		c.Status(500)
		return
	}

	// Read the data
	data := make([]byte, stat.Size + 1)
	_, err = object.Read(data)
	if err != nil && err != io.EOF {
		log.Println("Read err", err)
		c.Status(500)
		return
	}

	// Set header to give the file the appropriate filename
	c.Writer.Header().Set("Content-Disposition", fmt.Sprintf("filename=\"%s\"", file.Filename))

	// Determine the mime-type of the file
	mimeType := http.DetectContentType(data)

	c.Data(200, mimeType, data)
}

func (s *Server) Upload(ctx context.Context, req *UploadRequest) (*models.File, error) {
	hash := sha256.Sum256(req.Data)
	file := models.File{Filename: req.Filename, Hash: hex.EncodeToString(hash[:]), PartId: req.PartId}

	// @TODO Check if the file already exists
	_, err := s.Storage.Client.PutObject(ctx, s.Storage.BucketName, file.Hash, bytes.NewReader(req.Data), int64(len(req.Data)), minio.PutObjectOptions{})
	if err != nil {
		log.Println(err)
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to store file"), err)
	}

	if err := s.DB.Create(&file).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to store file"), err)
	}

	return &file, nil
}

func (s *Server) Delete(ctx context.Context, req *DeleteRequest) (*models.File, error) {
	var file models.File
	if err := s.DB.First(&file, "hash = ? AND part_id = ?", req.Hash, req.PartId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, twirp.NewError(twirp.NotFound, "File not found!")
		}

		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file"), err)
	}

	if err := s.DB.Delete(&file).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file associated with part from database"), err)
	}

	// Check how many entries with the same hash exist, if there are none left, delete the actual file
	var count int64
	s.DB.Model(&models.File{}).Where("hash = ?", file.Hash).Count(&count)
	if count == 0 {
		err := s.Storage.Client.RemoveObject(ctx, s.Storage.BucketName, file.Hash, minio.RemoveObjectOptions{})
		if err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file associated with part from storage"), err)
		}
	}

	return &file, nil
}
