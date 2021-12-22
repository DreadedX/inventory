import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { Button, Modal } from "semantic-ui-react";

interface Props {
	onConfirm: () => void
	onCancel: () => void
}

export const ModalDelete: FC<Props> = ({ onConfirm, onCancel }: Props) => {

	return (<Modal
		open={true}
		onClose={onCancel}>
		<Modal.Header>
			THIS CANNOT BE UNDONE!
		</Modal.Header>
		<Modal.Content>
			Are you sure you want to remove this?
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={onCancel}/>
			<Button content="REMOVE" color="red" icon="trash" onClick={onConfirm}/>
		</Modal.Actions>
	</Modal>)
}
