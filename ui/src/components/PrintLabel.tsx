import { FC, useEffect, useState } from 'react';
import { Modal, Button, Message, Loader } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { Preview, Print, Type } from '../handlers/label/label.pb';
import { ID } from '../models/models.pb';

interface Props {
	id: ID
	type: Type
};

export const PrintLabel: FC<Props & Record<string, any>> = ({ id, type, ...props }: Props) => {
	const [ img, setImg ] = useState<string>();
	const [ open, setOpen ] = useState(false);
	const [ previewOpen, setPreviewOpen ] = useState(false);
	const [ status, setStatus ] = useState<JSX.Element>();
	const [ printing, setPrinting ] = useState<boolean>(false);

	const print = () => {
		setPrinting(true);
		setStatus(<Message>Printing...</Message>);
		Print({type, id}).then(() => {
			setOpen(false);
		}).catch(e => {
			setStatus(<Message error>Unable to print!</Message>);
			if (isTwirpError(e)) {
				console.error(e.msg)
			} else {
				console.error(e)
			}
		}).finally(() => {
			setPrinting(false);
		})
	}

	const openModal = () => {
		setOpen(true)

		// Once the user opens the modal we start loading the preview
		// This is done to make the preview more responsive
		Preview({type, id}).then(resp => {
			let blob = new Blob([resp.image], {type: "image/png"})
			let url = URL.createObjectURL(blob)
			setImg(url)
		})
	}
	useEffect(() => {
	}, [id, type])

	const trigger = <Button content="Preview" color="blue" />;

	return (<Modal
		onClose={() => {
			setOpen(false)
			setStatus(undefined)
		}}
		onOpen={openModal}
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
			<Button content="Cancel" color="black" onClick={() => {
				setOpen(false)
				setStatus(undefined)
			}} />
			{/* @todo Add closeIcon in the proper place*/}
			<Modal basic onClose={() => setPreviewOpen(false)} onOpen={() => setPreviewOpen(true)} open={previewOpen} trigger={trigger}>
				{ img && <img width="100%" src={img} alt="Preview of the label" /> || <Loader active inline="centered"/> }
			</Modal>
			<Button loading={printing} disabled={printing} content="Print" color="green" icon="print" onClick={print} />
		</Modal.Actions>
	</Modal>)
}

