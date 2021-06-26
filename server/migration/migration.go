package migration

import (
	"gorm.io/gorm"

	"inventory/model"
)

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&model.Part{})
	db.AutoMigrate(&model.Storage{})
	db.AutoMigrate(&model.Link{})
}
