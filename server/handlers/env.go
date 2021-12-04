package handlers

import (
	"gorm.io/gorm"
)

type Env struct {
	DB *gorm.DB
	PythonPath string
	PrintPath string
}
