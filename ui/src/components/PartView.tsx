import { FC, Fragment, useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Segment, Form, Message, Menu, Icon, Modal, Button } from 'semantic-ui-react';
import { PrintLabel } from './';
import { Part } from '../models/models.pb';
import { Delete } from '../handlers/part/part.pb';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { Type } from '../handlers/label/label.pb';

interface Props {
	part: Part
	edit: string
};

interface FieldProps {
	label: string
	value: any
};

const Field: FC<FieldProps & Record<string, any>> = ({ label, value, ...props }: FieldProps) => {
	return (<Form.Field {...props}>
		<label>{label}</label>
		<p style={{lineHeight: '1.21428571em', padding: '.67857143em 1em'}}>{value}</p>
	</Form.Field>);
};

export const PartView: FC<Props> = ({ part, edit }: Props) => {
	const [ open, setOpen ] = useState(false);
	const [ removing, setRemoving ] = useState(false);
	const [ status, setStatus ] = useState<JSX.Element>();

	const history = useHistory();

	const remove = () => {
		setRemoving(true);
		setOpen(false);

		Delete(part.id).then(() => {
			history.goBack()
		}).catch(e => {
			if (isTwirpError(e)) {
				setStatus(<Message error attached="bottom" header="Failed to remove" content={ e.msg } />)
			} else {
				console.error(e)
				setStatus(<Message error attached="bottom" header="Failed to remove" content="Unknown error occured" />)
			}
		}).finally(() => {
			setRemoving(false);
		})
	}

	useEffect(() => {
		if (part.quantity <= 0) {
			setStatus(<Message error attached="bottom" header="No stock left" />)
		}
	}, [part.quantity])

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{part.name}
			</Menu.Item>
			<PrintLabel id={part.id} type={Type.PART} trigger={<Menu.Item position="right"><Icon name="print" /></Menu.Item>} />
			<Menu.Item onClick={() => history.replace(edit)}>
				<Icon name="edit" />
			</Menu.Item>
			<Modal
				onClose={() => setOpen(false)}
				onOpen={() => setOpen(true)}
				open={open}
				trigger={<Menu.Item><Icon name="trash" /></Menu.Item>}
			>
				<Modal.Header>
					THIS CANNOT BE UNDONE!
				</Modal.Header>
				<Modal.Content>
					Are you sure you want to remove this part?
				</Modal.Content>
				<Modal.Actions>
					<Button content="Cancel" color="black" onClick={() => setOpen(false)} />
					<Button content="REMOVE" color="red" icon="trash" onClick={remove} />
				</Modal.Actions>
			</Modal>
		</Menu>
		<Segment color="purple" attached={status ? true : "bottom"} loading={removing}>
			<Form>
				<Form.Group>
					<Field width={12} label="Name" value={part.name}/>
					<Field width={4} label="Footprint" value={part.footprint}/>
				</Form.Group>

				<Form.Group>
					<Field as={part.storage.id.id ? Link : undefined} to={"/storage/" + part.storage?.id.id} width={5} label="Storage" value={part.storage?.name}/>
					<Field width={2} label="Quantity" value={part.quantity}/>
				</Form.Group>

				<Field width={16} label="Description" value={part.description}/>

				{ part.links?.length > 0 && <Form.Field>
					<label>Links</label>
					{ part.links?.map((link, index) => (<Form.Field key={index}>
						<a href={"https://" + link.url} >{link.url}</a>
					</Form.Field>))}
				</Form.Field>}
			</Form>
		</Segment>
		{ status }
	</Fragment>);
};

