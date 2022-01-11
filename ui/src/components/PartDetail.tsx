import { FC, Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form, Placeholder, Segment, Message } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";

interface FieldProps {
	label: string
	value: any
	loading: boolean
	placeholder?: string
}

const Field: FC<FieldProps & Record<string, any>> = ({ label, value, loading, placeholder, ...props }: FieldProps) => {
	return (<Form.Field {...props}>
		<label>{label}</label>
		{ (loading
			&& <Placeholder style={{margin: '0em 0.6em'}}><Placeholder.Line length="medium" /></Placeholder>)
			|| <p style={{margin: '0em 0.6em'}}>{value || placeholder || "-"}</p> 
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

interface FieldFileProps {
	file: models.File
}

const FieldFile: FC<FieldFileProps & Record<string, any>> = ({ file, ...props }: FieldFileProps) => {
	return (<Form.Field style={{margin: '0em'}} {...props}>
		<a style={{margin: '1em'}} href={`/file/${file.hash}`}>{file.filename}</a>
	</Form.Field>)
}

interface Props {
	part: models.Part | undefined
	loading: LoadingStatus
	attached?: boolean
}

export const PartDetail: FC<Props> = ({ part, loading, attached }: Props) => {
	const [outOfStock, setOutOfStock] = useState<boolean>(false)

	useEffect(() => {
		setOutOfStock(part?.quantity === 0)
	}, [part])

	return (<Fragment>
		<Segment color="grey" attached={(attached || outOfStock) ? true : "bottom"}>
			<Form>
				<Form.Group>
					<Field width={5} label="Name" value={part?.name} loading={loading.fetch}/>
					<Field width={2} label="Footprint" value={part?.footprint} loading={loading.fetch}/>
					<Field width={2} label="Quantity" value={part?.quantity} loading={loading.fetch} placeholder={"0"} />

					<Field as={part?.storage?.id.id ? Link : undefined} to={`/storage/${part?.storage?.id.id}`} width={5} label="Storage" value={part?.storage?.name} loading={loading.fetch}/>

				</Form.Group>

				<Field width={16} label="Description" value={part?.description} loading={loading.fetch}/>

				<Form.Group>
					{ part?.links && part?.links.length > 0 && <Form.Field width={8}>
						<label>Links</label>
						{ part?.links?.map((link, index) => (<FieldLink link={link} key={index} />)) }
					</Form.Field> }

					{ part?.files && part?.files.length > 0 && <Form.Field width={8}>
						<label>Files</label>
							{ part?.files?.map((file, index) => (<FieldFile file={file} key={index} />)) }
					</Form.Field> }
				</Form.Group>
			</Form>
		</Segment>
		{ outOfStock && <Message attached={attached ? true : "bottom"} warning icon="exclamation circle" header="No stock left"/> }
	</Fragment>)
}
