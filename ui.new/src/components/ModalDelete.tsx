import { FC } from "react";
import { Button, Modal } from "semantic-ui-react";

interface Props {
	open: boolean
	deleting: boolean
	onConfirm: () => void
	onCancel: () => void
}

export const ModalDelete: FC<Props> = ({ open, deleting, onConfirm, onCancel }: Props) => {
	return (<Modal
		open={open}
		onClose={() => {
			if (!deleting) {
				onCancel()
			}
		}}>
		<Modal.Header>
			Are you sure?
		</Modal.Header>
		<Modal.Content>
			This action can NOT be undone!
		</Modal.Content>
		<Modal.Actions>
			<Button disabled={deleting} content="Cancel" color="black" onClick={onCancel}/>
			<Button disabled={deleting} loading={deleting} content="REMOVE" color="red" icon="trash" labelPosition="left" onClick={onConfirm}/>
		</Modal.Actions>
	</Modal>)
}
