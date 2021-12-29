import { FC } from "react";
import { Button, Modal } from "semantic-ui-react";
import { QrScanner } from ".";

import * as models from "../models/models.pb";
import * as Label from "../handlers/label/label.pb";

interface Props {
	open: boolean
	onScan: (id: models.ID, type: Label.Type) => void
	onCancel: () => void
	hint?: string
}

export const ModalQrScanner: FC<Props> = ({ open, onScan, onCancel, hint="Scan QR code" }: Props) => {

	// @TODO We need to do a better job verifying the id
	const processResult = (result: string) => {
		if (result.length <= 2) {
			return
		}

		const start = result.slice(0, 2)
		const id = { id: result.slice(2) }

		switch (start) {
			case "p/":
				onScan(id, Label.Type.PART);
				break;

			case "s/":
				onScan(id, Label.Type.STORAGE);
				break;

			default:
				console.error("Not a valid id string", result);
				break;
		}
	}

	return (<Modal
		open={open}
		onClose={() => {
			onCancel()
		}}>
		<Modal.Header>
			{hint}
		</Modal.Header>
		<Modal.Content>
			<QrScanner onScan={processResult} />
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={onCancel} />
		</Modal.Actions>
	</Modal>)
}
