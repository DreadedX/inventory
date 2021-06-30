package handlers

import (
	"gorm.io/gorm"
	"inventory/socket"
)

type Env struct {
	DB *gorm.DB
	Hub *socket.Hub
}
