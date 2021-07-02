import { FC, Fragment, ChangeEvent, useState } from 'react';
import { useHistory } from 'react-router';
import { Segment, Form, Message, Menu, Icon } from 'semantic-ui-react';
import { request } from '../request';

interface Props {
	storage: ApiStorage
	setStorage: (storage: ApiStorage) => void
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

		var body = JSON.stringify({name: name});

		if (create) {
			request<ApiPart>("/v1/storage/create", {method: "POST", body: body})
				.then(response => {
					if (response.data) {
						console.log(response.data)
						setStorage(response.data)

						history.push("/storage/" + response.data.id)
					} else {
						setStatus(<Message attached="bottom" negative header="Failed to create storage" content={response.message} />)
						setSaving(false);
					}
				}).catch(error => {
					console.error(error);
					setStatus(<Message attached="bottom" negative header="Failed to create storage" content={error.message} />)
					setSaving(false);
				});
		} else {
			request<ApiPart>("/v1/storage/update/" + storage.id, {method: "PUT", body: body})
				.then(response => {
					if (response.data) {
						console.log(response.data)
						setStorage(response.data)

						history.replace("/storage/" + response.data.id)
					} else {
						setStatus(<Message attached="bottom" negative header="Failed to save changes" content={response.message} />)
						setSaving(false);
					}
				}).catch(error => {
					console.error(error);
					setStatus(<Message attached="bottom" negative header="Failed to save changes" content={error.message} />)
					setSaving(false);
				});
			}
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{ name || (create ? "Create storage" : "Edit storage") }
			</Menu.Item>
			{ !create && <Menu.Item position="right" onClick={() => history.replace("/storage/" + storage.id)}>
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
