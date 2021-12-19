package label

import (
	"context"
	"inventory/handlers/printer"
	"inventory/models"

	"github.com/twitchtv/twirp"
	"gorm.io/gorm"
)

type Server struct{
	DB *gorm.DB
	Printer printer.Printer
}

func generateImage(s *Server, req *Request) ([]byte, error) {
	switch req.Type {
	case Type_PART:
		id := req.GetId()
		if id == nil {
			return nil, twirp.NewError(twirp.InvalidArgument, "No id specified")
		}

		var part models.Part
		s.DB.First(&part, id)

		png, err := generateLabelPart(&part)
		if err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to generate image"), err)
		}

		return png, nil

	case Type_STORAGE:
		id := req.GetId()
		if id == nil {
			return nil, twirp.NewError(twirp.InvalidArgument, "No id specified")
		}

		var storage models.Storage
		s.DB.First(&storage, id)

		png, err := generateLabelStorage(&storage)
		if err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to generate image"), err)
		}

		return png, nil

	case Type_CUSTOM:
		text := req.GetText()
		if len(text) == 0 {
			return nil, twirp.NewError(twirp.InvalidArgument, "No text specified")
		}

		png, err := generateLabelCustom(text)
		if err != nil {
			return nil, twirp.WrapError(twirp.NewError(twirp.Internal, "Failed to generate image"), err)
		}

		return png, nil
	}

	return nil, twirp.NewError(twirp.Internal, "Unable to handle type")

}

func (s *Server) Preview(ctx context.Context, req *Request) (*PreviewResponse, error) {
	png, err := generateImage(s, req)
	if err != nil {
		return nil, err
	}

	return &PreviewResponse{Image: png}, nil
}

func (s *Server) Print(ctx context.Context, req *Request) (*PrintResponse, error) {
	png, err := generateImage(s, req)
	if err != nil {
		return nil, err
	}

	_, err = s.Printer.Print(context.Background(), &printer.Request{Image: png})
	if err != nil {
		return nil, err
	}


	return &PrintResponse{}, nil
}

