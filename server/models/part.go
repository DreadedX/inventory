package models

import (
	"gorm.io/gorm"
	"github.com/google/uuid"
)

type Part struct {
	ID ID `json:"id" gorm:"type:uuid;primary_key"`
	Name string `json:"name"`
	Description string `json:"description"`
	Footprint string `json:"footprint"`
	Quantity int `json:"quantity"`
	StorageID *ID `json:"storageID,omitempty" gorm:"type:uuid"`
	Storage *Storage `json:"storage,omitempty"`
	Links []Link `json:"links,omitempty"`
}

func (p *Part) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = ID{uuid.New()}

	return
}

