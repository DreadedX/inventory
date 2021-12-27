import { ChangeEvent, FC, Fragment, SyntheticEvent, useState } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import * as models from "../models/models.pb";
import { Button, DropdownItemProps, DropdownProps, Form, Input, Segment } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";

import { ModalQrScanner, useHasCamera } from ".";
import { cloneDeep } from "lodash";

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
	addStorage: (name: string, callback: (id: models.ID) => void) => void
	updatePart: (part: models.Part) => void
	loading: LoadingStatus
	attached?: boolean
}

export const PartEdit: FC<Props> = ({ part, availableStorage, addStorage, updatePart, loading, attached }: Props) => {
	const hasCamera = useHasCamera();
	const [ scannerOpen, setScannerOpen ] = useState(false);

	const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (part === undefined) {
			return
		}

		const newState = cloneDeep(part)
		switch (event.target.name) {
			case "name":
			case "footprint":
			case "description":
			newState[event.target.name] = event.target.value;
				break;

			case "quantity":
			newState.quantity = parseInt(event.target.value);
				break;

			case "link":
			// @TODO Find a better solution to gettnig the indx then using the html id
				newState.links[Number(event.target.id)].url = event.target.value;
				break;

			default:
			console.error("UNKNOWN NAME", event.target.name, event)
		}

		updatePart(newState);
	}

	const onChangeStorage = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		if (part === undefined) {
			return
		}

		// @TODO if the storage is being created data.value will instead hold the text value...
		const newState = cloneDeep(part)
		newState.storageId = {...models.ID.defaultValue(), id: data.value as string}

		updatePart(newState)
	}

	const onRemoveUrl = (index: number) => {
		if (part === undefined) {
			return
		}

		const newState = cloneDeep(part)
		newState.links.splice(index, 1)

		updatePart(newState)
	}

	const onAddStorage = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		if (part === undefined) {
			return
		}

		addStorage(data.value as string, (id: models.ID) => {
			const newState = cloneDeep(part);
			newState.storageId = id;
			updatePart(newState);
		})
	}

	const onAddUrl = () => {
		if (part === undefined) {
			return
		}

		const newState = cloneDeep(part)
		newState.links.push(models.Link.defaultValue())

		updatePart(newState)
	}

	return (<Fragment>
		<ModalQrScanner open={scannerOpen} onCancel={() => setScannerOpen(false)} onScan={(result => {
			// @TODO Actually make this check work properly
			// Also give feedback to the user
			if (part === undefined) {
				return
			}

			if (!result.startsWith("s/")) {
				console.log("Not a valid storage id")
				return
			}

			const newState = cloneDeep(part);
			newState.storageId = { id: result.slice(2) };
			updatePart(newState);

			setScannerOpen(false);
		})} />
		<Segment color="grey" attached={(attached) ? true : "bottom"}>
			<Form loading={loading.fetch || loading.save}>
				<Form.Group>
					<Form.Input width={12} label="Name" name="name" placeholder="No name..." value={part?.name} onChange={onChange} />
					<Form.Input width={4} label="Footprint" name="footprint" placeholder="No footprint..." value={part?.footprint} onChange={onChange} />
				</Form.Group>

				<Form.Group>
					<Form.Field>
						<label>Storage</label>
						<Form.Dropdown name="storage" placeholder="No storage..." value={part?.storageId.id || ""} allowAdditions clearable search selection additionLabel="Create storage: " options={availableStorage} onAddItem={onAddStorage} onChange={onChangeStorage} loading={loading.options} />
					</Form.Field>

					{ hasCamera && <Form.Field>
						<label style={{visibility: 'hidden'}}>Scan</label>
						<Form.Button type="button" icon="qrcode" onClick={() => setScannerOpen(true)} />
					</Form.Field>}

					<Form.Input min={0} width={2} label="Quantity" type="number" name="quantity" value={part?.quantity} onChange={onChange} />
				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" placeholder="No description..." value={part?.description} onChange={onChange} />
				</Form.Field>

				<Form.Field width={8}>
					<label>Links</label>
					{part?.links.map((link, index) => (<Form.Field key={index}>
						<Input id={index} name="link" action={{color: 'red', icon: 'trash', onClick: () => onRemoveUrl(index)}} label="https://"  value={link.url} onChange={onChange} />
					</Form.Field>))}
					<Button onClick={onAddUrl}>Add URL</Button>
				</Form.Field>
			</Form>
		</Segment>
	</Fragment>)
}
