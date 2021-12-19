// +build tools

package tools

import (
	_ "google.golang.org/protobuf/cmd/protoc-gen-go"
	_ "github.com/twitchtv/twirp/protoc-gen-twirp"
	_ "github.com/favadi/protoc-go-inject-tag"
	_ "github.com/verloop/twirpy/protoc-gen-twirpy"
)
