import { FC } from "react";
import { Button, Modal } from "semantic-ui-react";
import { QrScanner } from ".";

interface Props {
	open: boolean
	onScan: (content: string) => void
	onCancel: () => void
	hint?: string
}

export const ModalQrScanner: FC<Props> = ({ open, onScan, onCancel, hint="Scan QR code" }: Props) => {
	return (<Modal
		open={open}
		onClose={() => {
			onCancel()
		}}>
		<Modal.Header>
			{hint}
		</Modal.Header>
		<Modal.Content>
			<QrScanner onScan={onScan} />
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={onCancel} />
		</Modal.Actions>
	</Modal>)
}
