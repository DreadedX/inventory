package models

type Link struct {
	ID int64 `gorm:"primary_key"`
	Url string
	Part ID `gorm:"type:uuid"`
}
