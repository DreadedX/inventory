import { FC } from "react";
import { Button, Modal } from "semantic-ui-react";

interface Props {
	open: boolean
	onConfirm: () => void
	onCancel: () => void
}

export const ModalDiscard: FC<Props> = ({ open, onConfirm, onCancel }: Props) => {
	return (<Modal
		open={open}
		onClose={onCancel}>
		<Modal.Header>
			Are you sure?
		</Modal.Header>
		<Modal.Content>
			This will discard all changes you have made
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={onCancel}/>
			<Button content="Discard changes" color="red" icon="cancel" labelPosition="left" onClick={onConfirm}/>
		</Modal.Actions>
	</Modal>)
}
