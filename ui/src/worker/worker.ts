import jsQR, { QRCode } from "jsqr";

export function processImage(imageData: ImageData): QRCode | null {
	return jsQR(imageData.data, imageData.width, imageData.height)
}
