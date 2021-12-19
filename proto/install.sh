#!/bin/bash
export GOBIN=$PWD/bin
export PATH=$GOBIN:$PATH

go mod download

go install github.com/twitchtv/twirp/protoc-gen-twirp
go install google.golang.org/protobuf/cmd/protoc-gen-go
go install github.com/favadi/protoc-go-inject-tag
go install github.com/verloop/twirpy/protoc-gen-twirpy
