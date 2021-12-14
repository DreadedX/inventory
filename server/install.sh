#!/bin/bash
export GOBIN=$PWD/bin
export PATH=$GOBIN:$PATH

go get github.com/twitchtv/twirp/protoc-gen-twirp
go get google.golang.org/protobuf/cmd/protoc-gen-go
go get github.com/favadi/protoc-go-inject-tag

go install github.com/twitchtv/twirp/protoc-gen-twirp
go install google.golang.org/protobuf/cmd/protoc-gen-go
go install github.com/favadi/protoc-go-inject-tag
