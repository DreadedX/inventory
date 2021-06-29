package models

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

