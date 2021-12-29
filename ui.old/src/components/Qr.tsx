import { FC, useState, ReactNode } from 'react';
import { Modal } from 'semantic-ui-react';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { Result } from '@zxing/library';
import { Type } from '../handlers/label/label.pb';

interface Props {
	trigger: ReactNode
	onScan: (id: string, t: Type) => void
}

export const Qr: FC<Props> = ({ trigger, onScan}: Props) => {
	const [open, setOpen] = useState(false)

	const onResult = (result: Result | null | undefined) => {
		if (result) {
			var t: Type | null = null;

			var text = result.getText();
			if (text.startsWith("s/")) {
				t = Type.STORAGE;
			} else if (text.startsWith("p/")) {
				t = Type.PART;
			}

			if (t) {
				onScan(text.substring(2), t)
				setOpen(false);
			}
		}
	}

	return (
		<Modal closeIcon basic onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open} trigger={trigger}>
			<QrReader constraints={{facingMode: 'environment'}} onResult={onResult}/>
		</Modal>
	)
}
