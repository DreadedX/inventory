package part

import (
	"context"
	"os"
	"sort"

	"inventory/models"

	"github.com/lithammer/fuzzysearch/fuzzy"
	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Server struct {
	DB *gorm.DB
}

func (s *Server) FetchAll(ctx context.Context, req *FetchAllRequest) (*FetchAllResponse, error) {
	var parts []*models.Part
	s.DB.Order("name ASC").Joins("Storage").Find(&parts)

	if len(req.Query) > 0 {
		// @TODO Improve the search system
		// Currently we just create one large string containing all the properties and then perform a fuzzy search
		// Instead I want each word of the query to only match within one property, this should prevent weird results from showing up
		// Currently not so sure on how to do it
		var values []string
		for _, part := range parts {
			v := part.Name + " " + part.Description + " " + part.Footprint
			if part.Storage != nil {
				v += part.Storage.Name
			}
			values = append(values, v)
		}
		ranks := fuzzy.RankFindNormalizedFold(req.Query, values)

		sort.Sort(ranks)

		var temp []*models.Part
		for _, rank := range ranks {
			temp = append(temp, parts[rank.OriginalIndex])
		}
		parts = temp
	}

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
	s.DB.Joins("Storage").Preload("Links").Preload("Files").First(&part, uuid)

	if part.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	return &part, nil
}

func (s *Server) Create(ctx context.Context, part *models.Part) (*models.Part, error) {
	if err := s.DB.Omit("Storage", "Files").Create(part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to create part"), err)
	}

	if err := s.DB.Joins("Storage").Preload("Links").Preload("Files").First(&part).Error; err != nil {
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
	s.DB.Joins("Storage").Preload("Links").Preload("Files").First(&part, uuid)
	if part.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	for _, link := range part.Links {
		if err := s.DB.Delete(&link).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete link associated with part"), err)
		}
	}

	for _, file := range part.Files {
		if err := s.DB.Delete(&file).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file associated with part"), err)
		}

		// Only delete the file on disk if there are no references to it anymore
		var count int64
		s.DB.Model(&models.Part{}).Where("hash = ?", file.Hash).Count(&count)
		if count == 0 {
			if err := os.Remove(file.Filepath()); err != nil {
				return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file associated with part"), err)
			}
		}
	}

	if err := s.DB.Select("Links").Select("Files").Delete(&part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete part"), err)
	}

	return &part, nil
}

func (s *Server) Update(ctx context.Context, part *models.Part) (*models.Part, error) {
	uuid, err := part.Id.AsUUID()
	if err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Invalid ID"), err)
	}

	// Get the original part
	var originalPart models.Part
	s.DB.Joins("Storage").Preload("Links").Preload("Files").First(&originalPart, uuid)
	if part.Id == nil {
		return nil, twirp.NewError(twirp.NotFound, "No part found!")
	}

	// Update part (this will also create any new links)
	if err := s.DB.Select("*").Omit("Storage" ,"Files").Updates(&part).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Failed to update part"), err)
	}

	// Remove any links that appeared before but now no longer appear
	removeLinks:
	for _, l1 := range originalPart.Links {
		for _, l2 := range part.Links {
			if l1.Id == l2.Id {
				continue removeLinks
			}
		}

		// Link is removed
		if err := s.DB.Delete(&l1).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to remove old link from part"), err)
		}
	}

	// Update the remaining links
	for _, l2 := range part.Links {
		// Update existing link
		if err := s.DB.Select("*").Updates(&l2).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.InvalidArgument, "Failed to update link from part"), err)
		}
	}

	removeFiles:
	for _, l1 := range originalPart.Files {
		for _, l2 := range part.Files {
			if l1.Id == l2.Id {
				continue removeFiles
			}
		}

		// File is removed
		if err := s.DB.Delete(&l1).Error; err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to remove old file from part"), err)
		}

		var count int64
		s.DB.Model(&models.File{}).Where("hash = ?", l1.Hash).Count(&count)
		if count == 0 {
			if err := os.Remove(l1.Filepath()); err != nil {
				return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to delete file associated with part"), err)
			}
		}
	}

	// We do no have to update files, as we can only add or remove files

	// Load the updated entry
	if err := s.DB.Joins("Storage").Preload("Links").Preload("Files").First(&part, uuid).Error; err != nil {
		return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to update part"), err)
	}

	return part, nil
}
