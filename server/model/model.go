package model

import (
	"encoding/json"

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
	ID ID `json:"id" gorm:"primary_key"`
	Name string `json:"name"`
	Description string `json:"description"`
	Footprint string `json:"footprint"`
	Quantity int `json:"quantity"`
	Storage ID `json:"storage"`
}

type Storage struct {
	ID ID `json:"id" gorm:"primary_key"`
	Name string `json:"name"`
}

// func (s Storage) MarshalJSON() ([]byte, error) {
// 	stringID := ""
// 	if s.ID != uuid.Nil {
// 		data, err := s.ID.MarshalBinary()
// 		if err != nil {
// 			return nil, err
// 		}
// 		stringID = base58.Encode(data)
// 	}
//
// 	return json.Marshal(storageMirror{
// 		ID: stringID,
// 		Name: s.Name,
// 	})
// }
//
// func (s *Storage) UnmarshalJSON(data []byte) error {
// 	var sm storageMirror
// 	if err := json.Unmarshal(data, &sm); err != nil {
// 		return err
// 	}
//
// 	s.Name = sm.Name
//
// 	if len(sm.ID) > 0 {
// 		id, err := uuid.FromBytes(base58.Decode(sm.ID))
// 		if err != nil {
// 			return err
// 		}
//
// 		s.ID = id
// 	} else {
// 		s.ID = uuid.Nil
// 	}
//
// 	return nil
// }
