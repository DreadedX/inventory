import { FC } from "react";
import { Button, Modal, Image, Placeholder } from "semantic-ui-react";

import styles from "./styles.module.css";

interface Props {
	open: boolean
	printing: boolean
	preview?: string
	onConfirm: () => void
	onCancel: () => void
}

export const ModalPrint: FC<Props> = ({ open, printing, preview, onConfirm, onCancel }: Props) => {
	return (<Modal
		open={open}
		onClose={() => {
			if (!printing) {
				onCancel()
			}
		}}>
		<Modal.Header>
			Print label
		</Modal.Header>
		<Modal.Content>
			{ preview
				? <Image className={styles.preview} src={preview} />
				: <Placeholder className={styles.preview} ><Placeholder.Image /></Placeholder>
			}
		</Modal.Content>
		<Modal.Actions>
			<Button disabled={printing} content="Cancel" color="black" onClick={onCancel} />
			<Button disabled={printing} loading={printing} content="Print label" color="green" icon="print" labelPosition="left" onClick={onConfirm} />
		</Modal.Actions>
	</Modal>)
}
