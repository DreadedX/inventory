import { ChangeEvent, FC, Fragment, SyntheticEvent } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import * as models from "../models/models.pb";
import { Button, DropdownItemProps, DropdownProps, Form, Input, Segment } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";

import { useHasCamera } from ".";

export interface PartEditFunctions {
	onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	onChangeStorage: (event: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	onAddStorage: (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	onRemoveUrl: (index: number) => void
	onAddUrl: () => void
}

interface Props {
	part: models.Part | undefined
	availableStorage: DropdownItemProps[] | undefined
	loading: LoadingStatus
	functions: PartEditFunctions
	attached?: boolean
}

export const PartEdit: FC<Props> = ({ part, availableStorage, functions, loading, attached }: Props) => {
	const hasCamera = useHasCamera();

	return (<Fragment>
		<Segment color="grey" attached={(attached) ? true : "bottom"}>
			<Form loading={loading.fetch || loading.save}>
				<Form.Group>
					<Form.Input width={12} label="Name" name="name" placeholder="No name..." value={part?.name} onChange={functions.onChange} />
					<Form.Input width={4} label="Footprint" name="footprint" placeholder="No footprint..." value={part?.footprint} onChange={functions.onChange} />
				</Form.Group>

				<Form.Group>
					<Form.Field>
						<label>Storage</label>
						<Form.Dropdown name="storage" placeholder="No storage..." value={part?.storageId.id || ""} allowAdditions clearable search selection additionLabel="Create storage: " options={availableStorage} onAddItem={functions.onAddStorage} onChange={functions.onChangeStorage} loading={loading.options} />
					</Form.Field>

					{ hasCamera && <Form.Field>
						<label style={{visibility: 'hidden'}}>Scan</label>
						<Form.Button type="button" icon="qrcode" />
					</Form.Field>}

					<Form.Input min={0} width={2} label="Quantity" type="number" name="quantity" value={part?.quantity} onChange={functions.onChange} />
				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" placeholder="No description..." value={part?.description} onChange={functions.onChange} />
				</Form.Field>

				<Form.Field width={8}>
					<label>Links</label>
					{part?.links.map((link, index) => (<Form.Field key={index}>
						<Input id={index} name="link" action={{color: 'red', icon: 'trash', onClick: () => functions.onRemoveUrl(index)}} label="https://"  value={link.url} onChange={functions.onChange} />
					</Form.Field>))}
					<Button onClick={functions.onAddUrl}>Add URL</Button>
				</Form.Field>
			</Form>
		</Segment>
	</Fragment>)
}
