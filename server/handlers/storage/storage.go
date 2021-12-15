package storage

import (
	"context"
	"inventory/models"

	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Server struct{
	DB *gorm.DB
}

func (s *Server) FetchAll(ctx context.Context, req *FetchAllRequest) (*FetchAllResponse, error) {
	var storages []*models.Storage
	s.DB.Order("name ASC").Find(&storages)

	if len(storages) == 0 {
		return nil, twirp.NewError(twirp.NotFound, "No storage found!")
	}

	for i, storage := range storages {
		storages[i].PartCount = int32(s.DB.Model(&storage).Association("Parts").Count())
	}


	return &FetchAllResponse{Storages: storages}, nil
}

func (s *Server) Fetch(ctx context.Context, id *models.ID) (*models.Storage, error) {
	uuid, err := id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	var storage models.Storage
	s.DB.Preload("Parts", func(db *gorm.DB) *gorm.DB {
		return db.Order("parts.name ASC")
	}).First(&storage, uuid)

	if storage.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No storage found!")
	}

	return &storage, nil
}

func (s *Server) Create(ctx context.Context, storage *models.Storage) (*models.Storage, error) {
	if err := s.DB.Save(storage).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to create part"), err)
	}

	return storage, nil
}

func (s *Server) Delete(ctx context.Context, id *models.ID) (*models.Storage, error) {
	uuid, err := id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	var storage models.Storage
	s.DB.Preload("Parts").First(&storage, uuid)
	if storage.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No storage found!")
	}

	// Remove reference to storage from parts
	for _, part := range storage.Parts {
		if err := s.DB.Model(&part).Update("storage_id", nil).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete part"), err)
		}
	}

	if err := s.DB.Delete(&storage).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete part"), err)
	}

	return &storage, nil
}

func (s *Server) Update(ctx context.Context, storage *models.Storage) (*models.Storage, error) {
	uuid, err := storage.Id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	// Make sure the entry exist
	var count int64
	s.DB.Model(&models.Storage{}).Where("id = ?", uuid).Count(&count)
	if count <= 0 {
		return nil, twirp.NewError(twirp.NotFound, "No storage found!")
	}

	// Update storage
	if err := s.DB.Select("*").Omit("Parts", "ID").Updates(&storage).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Failed to update storage"), err)
	}

	// Load the updated entry, since we omitted the parts
	if err := s.DB.Preload("Parts").First(&storage, uuid).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to update storage"), err)
	}

	return storage, nil
}
