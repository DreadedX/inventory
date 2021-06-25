package config

import (
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
)

var DB *gorm.DB

func Init() *gorm.DB {
	dsn := "host=localhost port=5432 user=root dbname=testdb password=root sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err.Error())
	}

	DB = db
	return DB
}

func GetDB() *gorm.DB {
	return DB
}
