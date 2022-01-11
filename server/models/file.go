package models

import "path/filepath"

func (f *File) Filepath() string {
	return filepath.Join("..", "storage", f.Hash[0:2], f.Hash[2:4], f.Hash[4:])
}
