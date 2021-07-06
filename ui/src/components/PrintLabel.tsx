import { FC, useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import { requestStatus } from '../request';

interface Props {
	id: string
	type: "part" | "storage"
};

export const PrintLabel: FC<Props & Record<string, any>> = ({ id, type, ...props }: Props) => {
	const [ open, setOpen ] = useState(false);
	const [ previewOpen, setPreviewOpen ] = useState(false);

	const print = () => {
		requestStatus("/v1/label/" + type + "/" + id, {method: "GET"})
			.then(response => {
				console.log(response)
			})
			.catch(error => {
				console.log(error)
			})
	}

	const trigger = <Button content="Preview" color="blue" />;

	return (<Modal
		onClose={() => setOpen(false)}
		onOpen={() => setOpen(true)}
		open={open}
		{...props}
	>
		<Modal.Header>
			Print
		</Modal.Header>
		<Modal.Content>
			Do you want to print out a label?
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={() => setOpen(false)} />
			<Modal basic onClose={() => setPreviewOpen(false)} onOpen={() => setPreviewOpen(true)} open={previewOpen} trigger={trigger}>
				{/* @todo Center the image and resize properly on mobile */}
				<img src={"/v1/label/" + type + "/" + id + "/preview"} alt="Preview of the label" />
			</Modal>
			<Button content="Print" color="green" icon="print" onClick={print} />
		</Modal.Actions>
	</Modal>)
}

