import { FC, Fragment, ChangeEvent, SyntheticEvent, KeyboardEvent, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Segment, Form, Message, DropdownProps, DropdownItemProps, Menu, Icon, Input, Button } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { request } from '../request';
import { Qr } from '../components/Qr';

interface Props {
	part: ApiPart
	setPart: (part: ApiPart) => void
	create?: boolean
}

export const PartEdit: FC<Props> = ( { part, setPart, create }: Props ) => {
	const [ name, setName ] = useState<string>(part.name);
	const [ description, setDescription ] = useState<string>(part.description);
	const [ footprint, setFootprint ] = useState<string>(part.footprint);
	const [ quantity, setQuantity ] = useState<number>(part.quantity);
	const [ storageID, setStorageID ] = useState<string>(part.storageID || "");
	const [ links, setLinks ] = useState<ApiLink[]>(part.links || []);

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

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (event.target.name === "name") {
			setName(event.target.value);
		} else if (event.target.name === "description") {
			setDescription(event.target.value);
		} else if (event.target.name === "footprint") {
			setFootprint(event.target.value);
		} else if (event.target.name === "quantity") {
			setQuantity(Number(event.target.value));
		}
	}

	const handleChangeDropdown = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		setStorageID(String(data.value));
	}

	const handleChangeUrl = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		var ls: ApiLink[] = [...links];
		ls[index].url = event.target.value.replace(/^\/\/|^.*?:(\/\/)?/, '');
		setLinks(ls)
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

					setStorageID(response.data.id);
				}

				setLoading(false);
			}).catch(error => {
				console.error(error);
				// @todo Show a popup message here
				// setStatus(<StatusBox icon="times" message={ error.message }/>)
				setLoading(false);
			});
	}

	const addUrl = () => {
		var ls: ApiLink[] = [...links];
		ls.push({id: 0, url: "", partID: ""});
		setLinks(ls)
	}

	const removeUrl = (index: number) => {
		var ls = [...links];
		ls.splice(index, 1);
		setLinks(ls);
	}

	const save = () => {
		setSaving(true);

		console.log(JSON.stringify({name: name, description: description, footprint: footprint, quantity: quantity, storageID: storageID, links: links}));

		if (create) {
			request<ApiPart>("/v1/part/create", {method: "POST", body: JSON.stringify({name: name, description: description, footprint: footprint, quantity: quantity, storageID: storageID, links: links})})
				.then(response => {
					if (response.data) {
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
			request<ApiPart>("/v1/part/update/" + part.id, {method: "PUT", body: JSON.stringify({name: name, description: description, footprint: footprint, quantity: quantity, storageID: storageID, links: links})})
				.then(response => {
					if (response.data) {
						setPart(response.data)

						history.replace("/part/" + part.id)
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
			setStorageID(id);
		} else {
			console.error("Not a valid storage code");
			setStatus(<Message attached="bottom" negative header="QR code not valid" content="The QR code does not contain a valid storage ID" />)
		}
	}

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{ name || (create ? "Create part" : "Edit part") }
			</Menu.Item>
			{ !create && <Menu.Item position="right" onClick={() => history.replace("/part/" + part.id)}>
				<Icon name="cancel" />
			</Menu.Item> }
			<Menu.Item position={create ? "right" : undefined} onClick={save}>
				<Icon name="save"/>
			</Menu.Item>
		</Menu>
		<Segment color="purple" attached={status ? true : "bottom"} loading={saving}>
			<Form>
				<Form.Group>
					<Form.Input width={12} label="Name" name="name" value={name} onChange={handleChange} />
					<Form.Input width={4} label="Footprint" name="footprint" value={footprint} onChange={handleChange} />
				</Form.Group>

				<Form.Group>
					<Form.Field width={5}>
						<label>Storage</label>
						<Form.Group>
							<Form.Dropdown name="storage" value={storageID || ""} allowAdditions loading={loading} clearable search selection additionLabel="Create storage: " options={storage} onAddItem={addStorage} onChange={handleChangeDropdown} />
							<Qr trigger={<Form.Button type="button" icon="qrcode"/>} onScan={onScan} />
						</Form.Group>
					</Form.Field>

					<Form.Input width={2} label="Quantity" type="number" name="quantity" value={quantity} onChange={handleChange} />
				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" value={description} onChange={handleChange} />
				</Form.Field>

				<Form.Field width={8}>
					<label>Links</label>
					{ links.map((link, index) => (<Form.Field key={index}>
						<Input action={{color: 'red', icon: 'trash', onClick: () => removeUrl(index)}} label="https://"  value={link.url} onChange={(event) => handleChangeUrl(event, index)} />
					</Form.Field>))}
					<Button onClick={addUrl}>Add URL</Button>
				</Form.Field>
			</Form>
		</Segment>
		{ status }
	</Fragment>);
};
