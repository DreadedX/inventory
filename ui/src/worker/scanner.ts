import jsQR, { QRCode } from "jsqr";
import * as Comlink from "comlink";

export interface Scanner {
	processImage: (imageData: ImageData) => QRCode | null
}

const worker: Scanner = {
	processImage(imageData: ImageData): QRCode | null {
		return jsQR(imageData.data, imageData.width, imageData.height);
	}
}

Comlink.expose(worker)
