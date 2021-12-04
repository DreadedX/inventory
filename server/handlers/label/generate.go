package label

import (
	"bytes"
	"fmt"
	"image/color"
	"image/png"
	"inventory/models"
	"path/filepath"

	"github.com/fogleman/gg"
	"github.com/skip2/go-qrcode"
)

func baseLabel(id string) (*gg.Context, error) {
	dc := gg.NewContext(6200, 2000)

	dc.DrawRectangle(0, 0, float64(dc.Width()), float64(dc.Height()))
	dc.Fill()

	if len(id) > 0 {
		q, err := qrcode.New(id, qrcode.Low)
		if err != nil {
			return nil, err
		}
		q.DisableBorder = true
		qr := q.Image(dc.Height())
		dc.DrawImage(qr, 0, 0)
	}

	return dc, nil
}

func loadFont(dc *gg.Context, points float64, bold bool) error {
	style := "Regular"
	if bold {
		style = "Bold"
	}
	fontName := fmt.Sprintf("%s.ttf", style)
	fontPath := filepath.Join("fonts", fontName)
	if err := dc.LoadFontFace(fontPath, points); err != nil {
		return err
	}

	return nil
}

func convertToPNG(dc *gg.Context) ([]byte, error) {
	var buf bytes.Buffer
	if err := png.Encode(&buf, dc.Image()); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func generateLabelPart(part *models.Part) ([]byte, error) {
	id := fmt.Sprintf("p/%s", part.ID)
	dc, err := baseLabel(id)
	if err != nil {
		return nil, err
	}

	dc.SetColor(color.Black)
	if err := loadFont(dc, 350, true); err != nil {
		return nil, err
	}

	offset := 150.0
	y := 0.0
	lines := dc.WordWrap(part.Name, float64(dc.Width())-float64(dc.Height())-offset)
	for _, line := range lines {
		dc.DrawStringAnchored(line, float64(dc.Height()) + offset, y, 0, 1)

		_, height := dc.MeasureString(line)
		y += 1.3*height
	}

	if err := loadFont(dc, 280, false); err != nil {
		return nil, err
	}

	lines = dc.WordWrap(part.Description, float64(dc.Width())-float64(dc.Height())-offset)
	for _, line := range lines {
		dc.DrawStringAnchored(line, float64(dc.Height()) + offset, y, 0, 1)

		_, height := dc.MeasureString(line)
		y += 1.3*height
	}

	if err := loadFont(dc, 160, false); err != nil {
		return nil, err
	}
	dc.DrawStringAnchored(part.Footprint, float64(dc.Height()) + offset, y, 0 ,1)
	dc.DrawStringAnchored(id, float64(dc.Height()) + offset, float64(dc.Height()), 0, -0.3)

	return convertToPNG(dc)
}

func generateLabelStorage(storage *models.Storage) ([]byte, error) {
	id := fmt.Sprintf("p/%s", storage.ID)
	dc, err := baseLabel(id)
	if err != nil {
		return nil, err
	}

	dc.SetColor(color.Black)
	offset := 150.0
	if err := loadFont(dc, 1100, true); err != nil {
		return nil, err
	}
	dc.DrawStringAnchored(storage.Name, float64(dc.Height()) + offset, float64(dc.Height())/2, 0, 0.4)

	if err := loadFont(dc, 160, false); err != nil {
		return nil, err
	}
	dc.DrawStringAnchored(id, float64(dc.Height()) + offset, float64(dc.Height()), 0, -0.3)

	return convertToPNG(dc)
}

func generateLabelCustom(text string) ([]byte, error) {
	dc, err := baseLabel("")
	if err != nil {
		return nil, err
	}

	dc.SetColor(color.Black)
	if err := loadFont(dc, 1500, true); err != nil {
		return nil, err
	}
	dc.DrawStringAnchored(text, float64(dc.Width())/2, float64(dc.Height())/2, 0.5, 0.5)

	return convertToPNG(dc)
}
