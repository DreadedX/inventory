import { QRCode } from "jsqr";

declare module "comlink-loader!*" {
	class WebpackWorker extends Worker {
		constructor();

		processImage(imageData: ImageData): Promise<QRCode | null>;
	}

	export = WebpackWorker;
}
