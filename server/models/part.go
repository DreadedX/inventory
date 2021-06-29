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
	Storage ID `json:"storage" gorm:"type:uuid"`
}

func (p *Part) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = ID{uuid.New()}

	return
}

