import { FC } from "react";
import { Button, Modal } from "semantic-ui-react";
import { QrScanner } from ".";

interface Props {
	open: boolean
	onScan: (content: string) => void
	onCancel: () => void
}

export const ModalQrScanner: FC<Props> = ({ open, onScan, onCancel }: Props) => {
	return (<Modal
		open={open}
		onClose={() => {
			onCancel()
		}}>
		<Modal.Header>
			Scan QR code
		</Modal.Header>
		<Modal.Content>
			<QrScanner onScan={onScan} />
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={onCancel} />
		</Modal.Actions>
	</Modal>)
}
