import { FC, Fragment, useEffect, useState } from "react";
import { Form, Placeholder, Segment, Menu, Icon, Message } from "semantic-ui-react";
import { MessageInfo } from "../message";
import * as models from "../models/models.pb";

interface FieldProps {
	label: string
	value: any
	loading: boolean
}

const Field: FC<FieldProps & Record<string, any>> = ({ label, value, loading, ...props }: FieldProps) => {
	return (<Form.Field {...props}>
		<label>{label}</label>
		{ loading
			&& <Placeholder style={{margin: '0em 1em'}}><Placeholder.Line length="medium" /></Placeholder>
			|| <p style={{margin: '0em 1em'}}>{value}</p> 
		}
	</Form.Field>)
}

interface FieldLinkProps {
	link: models.Link
}

const FieldLink: FC<FieldLinkProps & Record<string, any>> = ({ link, ...props }: FieldLinkProps) => {
	return (<Form.Field style={{margin: '0em'}} {...props}>
		<a style={{margin: '1em'}} href={"https://" + link.url}>{link.url}</a>
	</Form.Field>)
}

interface Props {
	part: models.Part | undefined
	message?: MessageInfo
}

export const PartView: FC<Props> = ({ part, message }: Props) => {
	const [loading, setLoading] = useState<boolean>(true)
	const [outOfStock, setOutOfStock] = useState<boolean>(true)

	useEffect(() => {
		setLoading(part === undefined)
		setOutOfStock(part?.quantity === 0)
	}, [part])

	return (<Fragment>
		<Menu attached="top" size="large" text>
			<Menu.Item header style={{marginLeft: '0.5em'}}>
				{ part?.name }
			</Menu.Item>
			<Menu.Item position="right" onClick={() => console.log("PRINT")} disabled={loading}>
				<Icon name="print" />
			</Menu.Item>
			<Menu.Item onClick={() => console.log("EDIT")} disabled={loading}>
				<Icon name="edit" />
			</Menu.Item>
			<Menu.Item onClick={() => console.log("DELETE")} disabled={loading}>
				<Icon name="trash" />
			</Menu.Item>
		</Menu>
		<Segment color="purple" attached={(message || outOfStock) ? true : "bottom"}>
			<Form>
				<Form.Group>
					<Field width={12} label="Name" value={part?.name} loading={loading}/>
					<Field width={4} label="Footprint" value={part?.footprint} loading={loading}/>
				</Form.Group>

				<Form.Group>
					<Field width={5} label="Storage" value={part?.storage?.name} loading={loading}/>
					<Field width={2} label="Quantity" value={part?.quantity} loading={loading}/>
				</Form.Group>

				<Field width={16} label="Description" value={part?.description} loading={loading}/>

				<Form.Field>
					<label>Links</label>
					{ part?.links?.map((link, index) => (<FieldLink link={link} key={index} />)) }
				</Form.Field>
			</Form>
		</Segment>
		{ outOfStock && <Message attached={message ? true : "bottom"} warning content="No stock left"/> }
		{ message && <Message attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
