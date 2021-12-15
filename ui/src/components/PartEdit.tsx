import { FC, Fragment, ChangeEvent, SyntheticEvent, KeyboardEvent, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Segment, Form, Message, DropdownProps, DropdownItemProps, Menu, Icon, Input, Button } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Qr } from '../components/Qr';
import { ID, Link, Part, Storage } from '../models/models.pb';
import { Create as CreateStorage, FetchAll } from '../handlers/storage/storage.pb';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { Create, Update } from '../handlers/part/part.pb';

interface Props {
	part: Part
	setPart: (part: Part) => void
	create?: boolean
}

export const PartEdit: FC<Props> = ( { part, setPart, create }: Props ) => {
	const [ name, setName ] = useState<string>(part.name);
	const [ description, setDescription ] = useState<string>(part.description);
	const [ footprint, setFootprint ] = useState<string>(part.footprint);
	const [ quantity, setQuantity ] = useState<number>(part.quantity);
	const [ storageID, setStorageID ] = useState<ID>(part.storageId || "");
	const [ links, setLinks ] = useState<Link[]>(part.links || []);

	const [ storage, setStorage ] = useState<DropdownItemProps[]>([]);

	const [ status, setStatus ] = useState<JSX.Element>();

	const [ loading, setLoading ] = useState<boolean>(true);
	const [ saving, setSaving ] = useState<boolean>(false);

	const history = useHistory();

	useEffect(() => {
		FetchAll({}).then(resp => {
			setStorage(resp.storages.map((storage) => {
				return {
					key: storage.id.id,
					value: storage.id.id,
					text: storage.name
				}}))
		}).catch(e => {
			if (isTwirpError(e)) {
				if (e.code !== "not_found") {
					setStatus(<Message attached="bottom" negative header="Failed to load storage options" content={ e.msg } />)
				}
			} else {
				console.error(e)
				setStatus(<Message attached="bottom" negative header="Failed to load storage options" content="Unknown error occured" />)
			}
		}).finally(() => {
			setLoading(false);
		})
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
		setStorageID({id: String(data.value)});
	}

	const handleChangeUrl = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		var ls: Link[] = [...links];
		ls[index].url = event.target.value.replace(/^\/\/|^.*?:(\/\/)?/, '');
		setLinks(ls)
	}

	const addStorage = (_event: KeyboardEvent<HTMLElement>, data: DropdownProps) => {
		setLoading(true)

		CreateStorage({...Storage.defaultValue(), name: String(data.value)}).then(resp => {
			setStorage([...storage, {
				key: resp.id.id,
				value: resp.id.id,
				text: resp.name
			}]);

			setStorageID({id: resp.id.id});
		}).catch(e => {
			console.error(e);
			// @todo Show a popup message here
			// setStatus(<StatusBox icon="times" message={ error.message }/>)
		}).finally(() => {
			setLoading(false);
		})
	}

	const addUrl = () => {
		var ls: Link[] = [...links];
		ls.push(Link.defaultValue());
		setLinks(ls)
	}

	const removeUrl = (index: number) => {
		var ls = [...links];
		ls.splice(index, 1);
		setLinks(ls);
	}

	const save = () => {
		setSaving(true);

		const newPart = {
			...Part.defaultValue(),
			name: name,
			description: description,
			footprint: footprint,
			quantity: quantity,
			storageId: storageID,
			links: links
		}

		console.log(newPart)

		if (create) {
			Create(newPart).then(resp => {
				setPart(resp)
				history.push("/part/" + resp.id.id)
			}).catch(e => {
				if (isTwirpError(e)) {
					setStatus(<Message attached="bottom" negative header="Failed to create part" content={e.msg} />)
				} else {
					setStatus(<Message attached="bottom" negative header="Failed to create part" content="Unknown error occured" />)
				}
			}).finally(() => {
				setSaving(false);
			})
		} else {
			Update({...newPart, id: part.id}).then(resp => {
				setPart(resp)
				history.replace("/part/" + resp.id.id)
			}).catch(e => {
				if (isTwirpError(e)) {
					setStatus(<Message attached="bottom" negative header="Failed to save changes" content={e.msg} />)
				} else {
					setStatus(<Message attached="bottom" negative header="Failed to save changes" content="Unknown error occured" />)
				}
			}).finally(() => {
				setSaving(false);
			})
		}
	}

	const onScan = (id: string, t: Type) => {
		if (t === "storage") {
			setStorageID({ id: id });
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
			{ !create && <Menu.Item position="right" onClick={() => history.replace("/part/" + part.id.id)}>
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
							<Form.Dropdown name="storage" value={storageID.id || ""} allowAdditions loading={loading} clearable search selection additionLabel="Create storage: " options={storage} onAddItem={addStorage} onChange={handleChangeDropdown} />
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
