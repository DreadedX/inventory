package models

import (
	"gorm.io/gorm"
	"github.com/google/uuid"
)

type Storage struct {
	ID ID `json:"id" gorm:"type:uuid;primary_key"`
	Name string `json:"name"`
	Parts []Part `json:"parts,omitempty"`
	PartCount int64 `json:"partCount,omitempty" gorm:"-"`
}

func (s *Storage) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = ID{uuid.New()}

	return
}

