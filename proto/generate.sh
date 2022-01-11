#!/bin/bash
export GOBIN=$PWD/bin
export PATH=$GOBIN:$PATH

protoc --twirp_out=../server --go_out=../server --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto models/models.proto
protoc-go-inject-tag -input="../server/models/*.pb.go"

protoc --twirp_out=../server --go_out=../server --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto handlers/part/part.proto
protoc --twirp_out=../server --go_out=../server --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto handlers/storage/storage.proto
protoc --twirp_out=../server --go_out=../server --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto handlers/label/label.proto
protoc --twirp_out=../server --go_out=../server --python_out=../printer --twirpy_out=../printer --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto handlers/printer/printer.proto
protoc --twirp_out=../server --go_out=../server --twirp_opt=paths=source_relative --go_opt=paths=source_relative --proto_path=../proto handlers/file/file.proto
