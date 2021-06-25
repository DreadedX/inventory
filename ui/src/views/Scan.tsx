import { FC } from 'react';
import { useHistory } from 'react-router'
import { Header } from 'semantic-ui-react'
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { Result } from '@zxing/library';

interface Props {
	onScan: (id: string, t: Type) => void
}

export const Scan: FC<Props> = ({ onScan }: Props) => {
	const history = useHistory();

	const onResult = (result: Result | null | undefined) => {
		if (result) {
			var t: Type | null = null;

			var text = result.getText();
			if (text.startsWith("s/")) {
				t = "storage";
			} else if (text.startsWith("p/")) {
				t = "part";
			}

			if (t) {
				history.push(t + "/" + text.substring(2))
			}
		}
	}

	return (
		<div>
			<Header as="h1" textAlign="center" style={{marginTop: '0.5em'}}>Point camera at QR code</Header>
			<QrReader constraints={{facingMode: 'environment'}} onResult={onResult}/>
		</div>
	)
}
