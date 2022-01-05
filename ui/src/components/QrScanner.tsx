import { useRef, FC, useState, useEffect, Fragment } from "react";
import { QRCode } from "jsqr";

import styles from "./styles.module.css";

import Worker from "../worker";
import { Header, Icon, Placeholder, Segment } from "semantic-ui-react";

const instance = new Worker()

export const useHasCamera = () => {
	const [ hasCamera, setHasCamera ] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		if (navigator?.mediaDevices?.enumerateDevices) {
			navigator.mediaDevices.enumerateDevices().then(devices => {
				const count = devices.filter((device) => device.kind === "videoinput").length
				setHasCamera(count > 0)
			})
		}
	}, [])

	return hasCamera
}

const useUserMedia = (req: MediaStreamConstraints): [ boolean | undefined, MediaStream | undefined] => {
	const [ mediaStream, setMediaStream ] = useState<MediaStream>();
	const hasCamera = useHasCamera();

	useEffect(() => {
		if (!hasCamera) {
			return
		}

		if (!mediaStream) {
			navigator.mediaDevices.getUserMedia(req).then(stream => {
				setMediaStream(stream);
			}).catch(e => {
				console.error(e);
			})
		} else {
			return () => {
				mediaStream.getTracks().forEach(track => {
					track.stop();
				});
			}
		}
	}, [hasCamera, mediaStream, req])

	return [ hasCamera, mediaStream ];
}

const CAPTURE_OPTIONS: MediaStreamConstraints = {
	audio: false,
	video: { facingMode: "environment" }
}

interface Props {
	onScan: (content: string) => void
}

export const QrScanner: FC<Props> = ({ onScan }: Props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [ hasCamera, mediaStream ] = useUserMedia(CAPTURE_OPTIONS);

	useEffect(() => {
		requestAnimationFrame(scan)
	})

	const scan = () => {
		const canvas = canvasRef.current?.getContext("2d")

		if (canvasRef.current && canvas && videoRef.current && videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
			let width = videoRef.current.videoWidth;
			let height = videoRef.current.videoHeight;

			let xOffset = 0;
			let yOffset = 0;

			if (width > height) {
				xOffset = (width - height)/2
				width = height
			} else if (height > width) {
				yOffset = (height - width)/2
				height = width
			}

			canvasRef.current.height = videoRef.current.videoHeight
			canvasRef.current.width = videoRef.current.videoWidth

			canvas?.drawImage(videoRef.current, xOffset, yOffset, width, height, 0, 0, width, height)
			const imageData = canvas.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
			instance.processImage(imageData).then((content: QRCode | null) => {
				if (content) {
					onScan(content.data)
				}
				requestAnimationFrame(scan);
			})

		} else {
			requestAnimationFrame(scan);
		}
	}

	if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
		videoRef.current.srcObject = mediaStream;
	}

	if (!hasCamera && hasCamera !== undefined) {
		// Show a placeholder box
		return (<Segment placeholder className={styles.scanner}>
			<Header icon>
				<Icon name={"camera"} />
				Not camera detected
			</Header>
		</Segment>)
	}

	return (<Fragment>
		<Placeholder className={styles.scanner} hidden={videoRef.current?.srcObject}><Placeholder.Image /></Placeholder>
		<video className={styles.scanner} ref={videoRef} autoPlay playsInline muted hidden={!videoRef.current?.srcObject}/>
		<canvas ref={canvasRef} hidden />
	</Fragment>)
}
