import { ChangeEvent, FC, Fragment, SyntheticEvent, useEffect } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import * as models from "../models/models.pb";
import { DropdownItemProps, DropdownProps, Form, Segment } from "semantic-ui-react";

interface Props {
	part: models.Part | undefined
	availableStorage: DropdownItemProps[]
	onEdit: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	onEditDropdown: (event: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	onAddStorage: (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	loading?: boolean
	loadingAvailableStorage?: boolean
	attached?: boolean
}

export const PartEdit: FC<Props> = ({ part, availableStorage, onEdit, onEditDropdown, onAddStorage, loading, loadingAvailableStorage, attached }: Props) => {

	return (<Fragment>
		<Segment color="purple" attached={(attached) ? true : "bottom"}>
			<Form loading={loading}>
				<Form.Group>
					<Form.Input width={12} label="Name" name="name" placeholder="No name..." value={part?.name} onChange={onEdit} />
					<Form.Input width={4} label="Footprint" name="footprint" placeholder="No footprint..." value={part?.footprint} onChange={onEdit} />
				</Form.Group>

				<Form.Group>
					<Form.Field>
						<label>Storage</label>
						<Form.Dropdown name="storage" placeholder="No storage..." value={part?.storageId.id || ""} allowAdditions clearable search selection additionLabel="Create storage: " options={availableStorage} onAddItem={onAddStorage} onChange={onEditDropdown} loading={!loading && loadingAvailableStorage} />
					</Form.Field>

					<Form.Field>
						<label style={{visibility: 'hidden'}}>Scan</label>
						<Form.Button type="button" icon="qrcode" />
					</Form.Field>

					<Form.Input min={0} width={2} label="Quantity" type="number" name="quantity" value={part?.quantity} onChange={onEdit} />
				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" placeholder="No description..." value={part?.description} onChange={onEdit} />
				</Form.Field>
			</Form>
		</Segment>
	</Fragment>)
}
