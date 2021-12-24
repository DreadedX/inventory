import { useRef, FC, useState, useEffect } from "react";
import QrScanner from "qr-scanner";

import styles from "./styles.module.css";

// eslint-disable-next-line import/no-webpack-loader-syntax
import qrScannerWorkerSource from "!!file-loader!./../../node_modules/qr-scanner/qr-scanner-worker.min.js";
QrScanner.WORKER_PATH = qrScannerWorkerSource;

console.log(qrScannerWorkerSource)

export const QRScanner: FC = () => {
	const target = useRef<HTMLVideoElement>(null);
	const [ scanner, setScanner ] = useState<QrScanner>();
	const [ hasCamera, setHasCamera ] = useState<boolean>(false);

	const [ code, setCode ] = useState<string>();

	const onScan = (result: string) => {
		console.log(result)
		setCode(result)
	}

	useEffect(() => {
		console.log("Has Camera has updated")

		if (hasCamera) {
			console.log("Creating scanner")
			console.assert(target.current !== null)

			if (target.current === null) {
				console.error("Unavle to access video tag")
				return
			}

			setScanner(new QrScanner(target.current, onScan, undefined, (video) => {
				if (video.width > video.height) {
					return {
						x: (video.width - video.height)/2,
						y: 0,
						width: video.height,
						height: video.height,
					}
				}

				return {
					x: 0,
					y: (video.height - video.width)/2,
					width: video.width,
					height: video.width,
				}

			}, "environment"))

			return () => {
				console.log("Destroying scanner")
				scanner?.destroy();
				setScanner(undefined);
			}
		}
	}, [hasCamera]);

	useEffect(() => {
		console.log("Checking for camera");
		QrScanner.hasCamera().then(setHasCamera);
	}, [])

	useEffect(() => {
		if (scanner !== undefined) {
			scanner.start().then(() => {
				console.log("Camera started")
			}).catch(e => {
				console.error(e)
			});

			return () => {
				scanner.stop()
			}
		}
	}, [scanner])

	return (<div>
		{ hasCamera ? <video className={styles.scanner} ref={target}></video> : <p>No camera!</p> }
		<p>Scanner: {code}</p>
		<p>Has camera: {hasCamera ? "Yes" : "No"}</p>
	</div>)
}
