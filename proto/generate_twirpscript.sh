#!/bin/bash
protoc --plugin=protoc-gen-twirpscript=../ui/node_modules/twirpscript/dist/compiler.js --twirpscript_out=../ui/src --twirpscript_opt="typescript" --proto_path=../proto models/models.proto  --experimental_allow_proto3_optional
protoc --plugin=protoc-gen-twirpscript=../ui/node_modules/twirpscript/dist/compiler.js --twirpscript_out=../ui/src --twirpscript_opt="typescript" --proto_path=../proto handlers/part/part.proto
protoc --plugin=protoc-gen-twirpscript=../ui/node_modules/twirpscript/dist/compiler.js --twirpscript_out=../ui/src --twirpscript_opt="typescript" --proto_path=../proto handlers/storage/storage.proto
protoc --plugin=protoc-gen-twirpscript=../ui/node_modules/twirpscript/dist/compiler.js --twirpscript_out=../ui/src --twirpscript_opt="typescript" --proto_path=../proto handlers/label/label.proto
