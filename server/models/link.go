package models

type Link struct {
	ID int64 `json:"id" gorm:"primary_key"`
	Url string `json:"url"`
	PartID ID `json:"partID" gorm:"type:uuid"`
}
