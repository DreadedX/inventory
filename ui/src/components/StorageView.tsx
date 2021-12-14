import { FC, Fragment, useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Message, Menu, Icon, Modal, Button } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { Delete } from '../handlers/storage/storage.pb';
import { Storage } from '../models/models.pb';
import { PartList, PrintLabel} from './';

interface Props {
	storage: Storage
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

		Delete(storage.id).then(() => {
			history.goBack()
		}).catch(e => {
			if (isTwirpError(e)) {
				setStatus(<Message error attached="bottom" header="Failed to remove" content={ e.msg } />)
			} else {
				console.error(e)
				setStatus(<Message error attached="bottom" header="Failed to remove" content="Unknown error occured" />)
			}
		}).finally(() => {
			setRemoving(false)
		})
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{storage.name}
			</Menu.Item>
			<Menu.Item position="right" as={Link} to={"/part/create/" + storage.id.id}>
				<Icon name="add" />
			</Menu.Item>
			<PrintLabel id={storage.id.id} type="storage" trigger={<Menu.Item><Icon name="print" /></Menu.Item>} />
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

