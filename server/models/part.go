package models

import (
	"github.com/btcsuite/btcutil/base58"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (p *Part) BeforeCreate(tx *gorm.DB) (err error) {
	id, _ := uuid.New().MarshalBinary()
	p.Id = &ID{Id: base58.Encode(id)}

	return
}
