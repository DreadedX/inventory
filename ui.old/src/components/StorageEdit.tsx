import { FC, Fragment, ChangeEvent, useState } from 'react';
import { useHistory } from 'react-router';
import { Segment, Form, Message, Menu, Icon } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { Create } from '../handlers/storage/storage.pb';
import { Storage } from '../models/models.pb';

interface Props {
	storage: Storage
	setStorage: (storage: Storage) => void
	create?: boolean
}

export const StorageEdit: FC<Props> = ( { storage, setStorage, create }: Props ) => {
	const [ name, setName ] = useState<string>(storage.name);
	const [ status, setStatus ] = useState<JSX.Element>();
	const [ saving, setSaving ] = useState<boolean>(false);

	const history = useHistory();

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (event.target.name === "name") {
			setName(event.target.value);
		}
	}

	const save = () => {
		setSaving(true);

		const newStorage = {
			...Storage.defaultValue(),
			name: name
		}

		if (create) {
			Create(newStorage).then(resp => {
				setStorage(resp)
				history.push("/storage/" + resp.id.id)
			}).catch(e => {
				if (isTwirpError(e)) {
					setStatus(<Message attached="bottom" negative header="Failed to create storage" content={e.msg} />)
				} else {
					setStatus(<Message attached="bottom" negative header="Failed to create storage" content="Unknown error occured" />)
				}
			}).finally(() => {
				setSaving(false)
			})
		} else {
			Create({...newStorage, id: storage.id}).then(resp => {
				setStorage(resp)
				history.push("/storage/" + resp.id.id)
			}).catch(e => {
				if (isTwirpError(e)) {
					setStatus(<Message attached="bottom" negative header="Failed to save changes" content={e.msg} />)
				} else {
					setStatus(<Message attached="bottom" negative header="Failed to save changes" content="Unknown error occured" />)
				}
			}).finally(() => {
				setSaving(false)
			})
		}
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{ name || (create ? "Create storage" : "Edit storage") }
			</Menu.Item>
			{ !create && <Menu.Item position="right" onClick={() => history.replace("/storage/" + storage.id.id)}>
				<Icon name="cancel" />
			</Menu.Item> }
			<Menu.Item position={create ? "right" : undefined} onClick={save}>
				<Icon name="save"/>
			</Menu.Item>
		</Menu>
		<Segment color="purple" attached={status ? true : "bottom"} loading={saving}>
			<Form>
				<Form.Input label="Name" name="name" value={name} onChange={handleChange} />
			</Form>
		</Segment>
		{ status }
	</Fragment>);
}
