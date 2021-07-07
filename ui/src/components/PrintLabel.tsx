import { FC, useState } from 'react';
import { Modal, Button, Message } from 'semantic-ui-react';
import { requestStatus } from '../request';

interface Props {
	id: string
	type: "part" | "storage"
};

export const PrintLabel: FC<Props & Record<string, any>> = ({ id, type, ...props }: Props) => {
	const [ open, setOpen ] = useState(false);
	const [ previewOpen, setPreviewOpen ] = useState(false);
	const [ status, setStatus ] = useState<JSX.Element>();
	const [ printing, setPrinting ] = useState<boolean>(false);

	const print = () => {
		setPrinting(true);
		requestStatus("/v1/label/" + type + "/" + id, {method: "GET"})
			.then(response => {
				console.log(response);
				setOpen(false);
				setPrinting(false);
			})
			.catch(error => {
				console.log(error);
				setStatus(<Message error>Unable to print!</Message>);
				setPrinting(false);
			})
	}

	const trigger = <Button content="Preview" color="blue" />;

	return (<Modal
		onClose={() => {
			setOpen(false)
			setStatus(undefined)
		}}
		onOpen={() => setOpen(true)}
		open={open}
		{...props}
	>
		<Modal.Header>
			Print
		</Modal.Header>
		<Modal.Content>
			{ status || "Do you want to print out a label?" }
		</Modal.Content>
		<Modal.Actions>
			<Button content="Cancel" color="black" onClick={() => setOpen(false)} />
			{/* @todo Add closeIcon in the proper place*/}
			<Modal basic onClose={() => setPreviewOpen(false)} onOpen={() => setPreviewOpen(true)} open={previewOpen} trigger={trigger}>
				<img width="100%" src={"/v1/label/" + type + "/" + id + "/preview"} alt="Preview of the label" />
			</Modal>
			<Button loading={printing} disabled={status ? true : false} content="Print" color="green" icon="print" onClick={print} />
		</Modal.Actions>
	</Modal>)
}

