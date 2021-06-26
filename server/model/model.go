package model

import (
	"encoding/json"

	"gorm.io/gorm"
	"github.com/btcsuite/btcutil/base58"
	"github.com/google/uuid"
)

type ID struct {
	uuid.UUID
}

func (id ID) MarshalJSON() ([]byte, error) {
	Nil := ID{uuid.Nil}
	if id != Nil {
		data, err := id.MarshalBinary()
		if err != nil {
			return nil, err
		}
		return json.Marshal(base58.Encode(data))
	}

	return json.Marshal("")
}

func (id *ID) UnmarshalJSON(data []byte) error {
	var idString string
	json.Unmarshal(data, &idString)

	if len(idString) <= 0 {
		*id = ID{uuid.Nil}
		return nil
	}

	i, err := uuid.FromBytes(base58.Decode(idString))
	if err != nil {
		return err
	}

	*id = ID{i}

	return nil
}

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

type Storage struct {
	ID ID `json:"id" gorm:"type:uuid;primary_key"`
	Name string `json:"name"`
}

func (s *Storage) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = ID{uuid.New()}

	return
}

type Link struct {
	ID int64 `gorm:"primary_key"`
	Url string
	Part ID `gorm:"type:uuid"`
}
