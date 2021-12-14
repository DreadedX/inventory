package part

import (
	"context"
	"log"

	"inventory/models"

	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Server struct{
	DB *gorm.DB
}

func (s *Server) FetchAll(ctx context.Context, req *FetchAllRequest) (*FetchAllResponse, error) {
	var parts []*models.Part
	s.DB.Order("name ASC").Joins("Storage").Find(&parts)

	if len(parts) == 0 {
		return nil, twirp.NewError(twirp.NotFound, "No parts found!")
	}

	return &FetchAllResponse{Parts: parts}, nil
}

func (s *Server) Fetch(ctx context.Context, id *models.ID) (*models.Part, error) {
	uuid, err := id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	var part models.Part
	s.DB.Joins("Storage").Preload("Links").First(&part, uuid)

	if part.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	return &part, nil
}

func (s *Server) Create(ctx context.Context, part *models.Part) (*models.Part, error) {
	if err := s.DB.Omit("Storage").Create(part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to create part"), err)
	}

	if err := s.DB.Joins("Storage").Preload("Links").First(&part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to create part"), err)
	}

	return part, nil
}

func (s *Server) Delete(ctx context.Context, id *models.ID) (*models.Part, error) {
	uuid, err := id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	var part models.Part
	s.DB.Joins("Storage").Preload("Links").First(&part, uuid)
	if part.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	if err := s.DB.Select("Links").Delete(&part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete part"), err)
	}


	return &part, nil
}

func (s *Server) Update(ctx context.Context, part *models.Part) (*models.Part, error) {
	uuid, err := part.Id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	// Make sure the entry exist
	var count int64
	s.DB.Model(&models.Part{}).Where("id = ?", uuid).Count(&count)
	if count <= 0 {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	// Update part
	// @todo We can not change value to an empty value
	if err := s.DB.Omit("Storage", "Links").Updates(&part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Failed to update part"), err)
	}

	// @todo Figure out a better way to update the links
	// Remove all existing links
	if err := s.DB.Where("part_id = ?", uuid).Delete(&models.Link{}).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to update part"), err)
	}

	// Add all the links
	for i, link := range part.Links {
		if (len(link.Url) > 0) {
			part.Links[i].PartId = part.Id
			log.Println(part.Links[i])
			if err := s.DB.Create(&part.Links[i]).Error; err != nil {
				log.Println("ERROR", part.Links[i])
				return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Failed to update part"), err)
			}
		}
	}

	// Load the updated entry, since we omitted the links
	if err := s.DB.Joins("Storage").Preload("Links").First(&part, uuid).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to update part"), err)
	}

	return part, nil
}
