package models

import (
	"gorm.io/gorm"
	"github.com/google/uuid"
)

type Storage struct {
	ID ID `json:"id" gorm:"type:uuid;primary_key"`
	Name string `json:"name"`
}

func (s *Storage) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = ID{uuid.New()}

	return
}

