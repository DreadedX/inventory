package models

import (
	"encoding/json"

	"github.com/btcsuite/btcutil/base58"
	"github.com/google/uuid"
)

type ID struct {
	uuid.UUID
}

// @TODO How do we handle errors here
func (id ID) String() string {
	data, _ := id.MarshalBinary()
	return base58.Encode(data)
}

func (id ID) MarshalJSON() ([]byte, error) {
	data, err := id.MarshalBinary()
	if err != nil {
		return nil, err
	}
	return json.Marshal(base58.Encode(data))
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

