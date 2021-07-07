import { FC, Fragment, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Message, Menu, Icon, Modal, Button } from 'semantic-ui-react';
import { PartList, PrintLabel} from './';
import { request } from '../request';

interface Props {
	storage: ApiStorage
	edit: string
};

export const StorageView: FC<Props> = ({ storage, edit }: Props) => {
	const [ open, setOpen ] = useState(false);
	const [ removing, setRemoving ] = useState(false);
	const [ status, setStatus ] = useState<JSX.Element>();

	const history = useHistory();

	useEffect(() => {
		if (!storage.parts?.length) {
			setStatus(<Message warning attached="bottom" header="Storage is empty" />)
		} else {
			setStatus(undefined)
		}
	}, [storage]);

	const remove = () => {
		setRemoving(true);
		setOpen(false);
		request<ApiStorage>("/v1/storage/delete/" + storage.id, {method: "DELETE"})
			.then(response => {
				if (response.data) {
					history.goBack()
				} else {
					setStatus(<Message error attached={storage.parts?.length ? true : "bottom"} header="Failed to remove" content={response.message} />)
				}
				setRemoving(false);
			})
			.catch(error => {
				console.error(error);
				setStatus(<Message attached={storage.parts?.length ? true : "bottom"} negative header="Failed to remove" content={error.message} />)
				setRemoving(false);
			})
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{storage.name}
			</Menu.Item>
			<PrintLabel id={storage.id} type="storage" trigger={<Menu.Item position="right"><Icon name="print" /></Menu.Item>} />
			<Menu.Item onClick={() => history.replace(edit)}>
				<Icon name="edit" />
			</Menu.Item>
			<Modal
				onClose={() => setOpen(false)}
				onOpen={() => setOpen(true)}
				open={open}
				trigger={<Menu.Item><Icon loading={removing} name={removing ? "spinner" : "trash"} /></Menu.Item>}
			>
				<Modal.Header>
					THIS CANNOT BE UNDONE!
				</Modal.Header>
				<Modal.Content>
					Are you sure you want to remove this storage? This will not remove the parts contained in the storage.
				</Modal.Content>
				<Modal.Actions>
					<Button content="Cancel" color="black" onClick={() => setOpen(false)} />
					<Button content="REMOVE" color="red" icon="trash" onClick={remove} />
				</Modal.Actions>
			</Modal>
		</Menu>
		{ status || (storage.parts && <PartList parts={ storage.parts } storage />) }
	</Fragment>);
};

