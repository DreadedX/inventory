import { FC, Fragment, ChangeEvent, SyntheticEvent, KeyboardEvent, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Segment, Form, Message, DropdownProps, DropdownItemProps, Menu, Icon } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { request } from '../request';
import { Qr } from '../components/Qr';

interface Props {
	part: ApiPart
	setPart: (part: ApiPart) => void
	create?: boolean
}

export const PartEdit: FC<Props> = ( { part, setPart, create }: Props ) => {
	const [ partEdit, setPartEdit ] = useState<ApiPart>(part);
	const [ storage, setStorage ] = useState<DropdownItemProps[]>([]);

	const [ status, setStatus ] = useState<JSX.Element>();

	const [ loading, setLoading ] = useState<boolean>(true);
	const [ saving, setSaving ] = useState<boolean>(false);

	const history = useHistory();

	useEffect(() => {
		request<ApiStorage[]>("/v1/storage/list")
			.then(response => {
				if (response.data) {
					setStorage(response.data.map((storage) => {
						return {
						key: storage.id,
						value: storage.id,
						text: storage.name
					}}))
				}
				setLoading(false);
			}).catch(error => {
				console.error(error);
				setStatus(<Message attached="bottom" negative header="Failed to load storage options" content={error.message} />)
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		setPartEdit(part);
	}, [part])

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (event.target.name === "name") {
			setPartEdit({...partEdit, name: event.target.value})
		} else if (event.target.name === "description") {
			setPartEdit({...partEdit, description: event.target.value})
		} else if (event.target.name === "footprint") {
			setPartEdit({...partEdit, footprint: event.target.value})
		} else if (event.target.name === "quantity") {
			setPartEdit({...partEdit, quantity: Number(event.target.value)})
		}
	}

	const handleChangeDropdown = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		// We do not update the name of the storage
		// This is not needed since the dropdown only needs the key to display the correct value
		setPartEdit({...partEdit, storage: {id: (data.value || "") as string, name: data.text || ""}})
	}

	const addStorage = (_event: KeyboardEvent<HTMLElement>, data: DropdownProps) => {
		setLoading(true)

		request<Storage>("/v1/storage/create", {method: "POST", body: JSON.stringify({name: data.value})})
			.then(response => {
				if (response.data) {
					setStorage([...storage, {
						key: response.data.id,
						value: response.data.id,
						text: response.data.name
					}]);

					setPartEdit({...partEdit, storage: {id: response.data.id, name: response.data.name}})
				}

				setLoading(false);
			}).catch(error => {
				console.error(error);
				// @todo Show a popup message here
				// setStatus(<StatusBox icon="times" message={ error.message }/>)
				setLoading(false);
			});
	}

	const save = () => {
		setSaving(true);

		if (create) {
			request<ApiPart>("/v1/part/create", {method: "POST", body: JSON.stringify({...partEdit, storage: partEdit.storage?.id || ""})})
				.then(response => {
					if (response.data) {
						console.log(response.data)
						setPart(response.data)

						history.push("/part/" + response.data.id)
					} else {
						setStatus(<Message attached="bottom" negative header="Failed to create part" content={response.message} />)
						setSaving(false);
					}
				}).catch(error => {
					console.error(error);
					setStatus(<Message attached="bottom" negative header="Failed to create part" content={error.message} />)
					setSaving(false);
				});
		} else {
			request<ApiPart>("/v1/part/update/" + partEdit.id, {method: "PUT", body: JSON.stringify({...partEdit, storage: partEdit.storage?.id || ""})})
				.then(response => {
					if (response.data) {
						console.log(response.data)
						setPart(response.data)

						history.goBack()
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

	const onScan = (id: string, t: Type) => {
		if (t === "storage") {
			setPartEdit({...partEdit, storage: {id: id, name: partEdit.storage?.name || ""}});
		} else {
			console.error("Not a valid storage code");
			setStatus(<Message attached="bottom" negative header="QR code not valid" content="The QR code does not contain a valid storage ID" />)
		}
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{ partEdit.name || (create ? "Create part" : "Edit part") }
			</Menu.Item>
			{ !create && <Menu.Item position="right" onClick={() => history.goBack()}>
				<Icon name="cancel" />
			</Menu.Item> }
			<Menu.Item position={create ? "right" : undefined} onClick={save}>
				<Icon name="save"/>
			</Menu.Item>
		</Menu>
		<Segment color="purple" attached={status ? true : "bottom"} loading={saving}>
			<Form>
				<Form.Group>
					<Form.Input width={12} label="Name" name="name" value={partEdit.name} onChange={handleChange} />
					<Form.Input width={4} label="Footprint" name="footprint" value={partEdit.footprint} onChange={handleChange} />
				</Form.Group>

				<Form.Group>
					<Form.Field width={5}>
						<label>Storage</label>
						<Form.Group>
							<Form.Dropdown name="storage" value={partEdit.storage?.id || ""} allowAdditions loading={loading} clearable search selection additionLabel="Create storage: " options={storage} onAddItem={addStorage} onChange={handleChangeDropdown} />
							<Qr trigger={<Form.Button type="button" icon="qrcode"/>} onScan={onScan} />
						</Form.Group>
					</Form.Field>

					<Form.Input width={2} label="Quantity" type="number" name="quantity" value={partEdit.quantity} onChange={handleChange} />
				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" value={partEdit.description} onChange={handleChange} />
				</Form.Field>
			</Form>
		</Segment>
		{ status }
	</Fragment>);
};
