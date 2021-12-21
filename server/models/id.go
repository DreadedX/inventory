package models

import (
	"database/sql/driver"
	"fmt"

	"github.com/btcsuite/btcutil/base58"
	"github.com/google/uuid"
)

func (id *ID) Scan(src interface{}) error {
	switch src := src.(type) {
	case nil:
		return nil

	case string:
		// if an empty UUID comes from a table, we return a null UUID
		if src == "" {
			return nil
		}

		// see Parse for required string format
		u, err := uuid.Parse(src)
		if err != nil {
			return fmt.Errorf("Scan: %v", err)
		}

		b, err := u.MarshalBinary()
		if err != nil {
			return fmt.Errorf("Scan: %v", err)
		}

		id.Id = base58.Encode(b)

// 	case []byte:
// 		// if an empty UUID comes from a table, we return a null UUID
// 		if len(src) == 0 {
// 			return nil
// 		}

// 		// assumes a simple slice of bytes if 16 bytes
// 		// otherwise attempts to parse
// 		if len(src) != 16 {
// 			return uuid.Scan(string(src))
// 		}
// 		copy((*uuid)[:], src)

	default:
		return fmt.Errorf("Scan: unable to scan type %T into UUID", src)
	}

	return nil
}


func (id ID) Value() (driver.Value, error) {
	if id.Id == "" {
		return nil, nil
	}
	uuid, err := uuid.FromBytes(base58.Decode(id.Id))
	if err != nil {
		return nil, err
	}
	return uuid.String(), nil
}

func (id ID) AsUUID() (uuid.UUID, error) {
	return uuid.FromBytes(base58.Decode(id.Id))
}
