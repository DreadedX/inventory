import { ChangeEvent, FC, Fragment, SyntheticEvent, useRef, useState } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import * as models from "../models/models.pb";
import * as Label from "../handlers/label/label.pb";
import { Button, DropdownItemProps, DropdownProps, Form, Input, Segment } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";

import { ModalQrScanner, useHasCamera } from ".";
import { NewFile } from "../lib/upload";
import { DraftFunction } from "use-immer";

export interface PartEditFunctions {
	onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	onChangeStorage: (event: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	onAddStorage: (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => void
	onRemoveUrl: (index: number) => void
	onAddUrl: () => void
}

interface Props {
	part: models.Part
	availableStorage: DropdownItemProps[]
	addFile: (newFile: NewFile) => void
	addStorage: (name: string, callback: (id: models.ID) => void) => void
	updatePart: (df: DraftFunction<models.Part>) => void
	loading: LoadingStatus
	attached?: boolean
}

export const PartEdit: FC<Props> = ({ part, availableStorage, addStorage, addFile, updatePart, loading, attached }: Props) => {
	const hasCamera = useHasCamera();
	const [ scannerOpen, setScannerOpen ] = useState(false);
	const fileUploadRef = useRef<HTMLInputElement>(null)

	const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		updatePart(draft => {
			switch (event.target.name) {
				case "name":
				case "footprint":
				case "description":
				draft[event.target.name] = event.target.value;
					break;

				case "quantity":
				draft.quantity = parseInt(event.target.value);
					break;

				case "link":
				// @TODO Find a better solution to gettnig the indx then using the html id
					draft.links[Number(event.target.id)].url = event.target.value;
					break;

				default:
				console.error("UNKNOWN NAME", event.target.name, event)
			}
		})
	}

	const onChangeStorage = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		updatePart(draft => {
			draft.storageId.id = data.value as string
		})
	}

	const onAddStorage = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		addStorage(data.value as string, (id: models.ID) => {
			updatePart(draft => {
				draft.storageId = id
			})
		})
	}

	const onRemoveLink = (index: number) => {
		updatePart(draft => {
			draft.links.splice(index, 1)
		})
	}

	const onAddLink = () => {
		updatePart(draft => {
			draft.links.push(models.Link.defaultValue())
		})
	}

	const onRemoveFile = (index: number) => {
		updatePart(draft => {
			draft.files.splice(index, 1)
		})
	}

	const onFileUpload = (index: number) => {
		return (event: ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files
			if (files !== null && files.length > 0) {

				addFile({file: files[0], index})

				updatePart(draft => {
					draft.files.push({
						...models.File.defaultValue(),
						filename: files[0].name
					})
				})
			}
		}
	}

	return (<Fragment>
		<ModalQrScanner hint="Scan storage QR code" open={scannerOpen} onCancel={() => setScannerOpen(false)} onScan={(id, type) => {
			// @TODO Actually make this check work properly
			// Also give feedback to the user
			if (type !== Label.Type.STORAGE) {
				return
			}

			updatePart(draft => {
				draft.storageId = id;
			})

			setScannerOpen(false);
		}} />
		<Segment color="grey" attached={(attached) ? true : "bottom"}>
			<Form loading={loading.fetch || loading.save}>
				<Form.Group>
					<Form.Input width={5} label="Name" name="name" placeholder="Name..." value={part.name} onChange={onChange} />
					<Form.Input width={2} label="Footprint" name="footprint" placeholder="Footprint..." value={part.footprint} onChange={onChange} />
					<Form.Input min={0} width={2} label="Quantity" type="number" name="quantity" placeholder="0" value={part.quantity} onChange={onChange} />

					<Form.Field>
						<label>Storage</label>
						<Form.Dropdown name="storage" placeholder="No storage..." value={part.storageId.id || ""} allowAdditions clearable search selection additionLabel="Create storage: " options={availableStorage} onAddItem={onAddStorage} onChange={onChangeStorage} loading={loading.options} />
					</Form.Field>

					{ hasCamera && <Form.Field>
						<label style={{visibility: 'hidden'}}>Scan</label>
						<Form.Button type="button" icon="qrcode" onClick={() => setScannerOpen(true)} />
					</Form.Field>}

				</Form.Group>

				<Form.Field>
					<label>Description</label>
					<TextareaAutosize minRows={10} name="description" placeholder="Description..." value={part.description} onChange={onChange} />
				</Form.Field>

				<Form.Field width={8}>
					<label>Links</label>
					{part.links.map((link, index) => (<Form.Field key={index}>
						<Input id={index} name="link" action={{color: 'red', icon: 'trash', onClick: () => onRemoveLink(index)}} label="https://"  value={link.url} onChange={onChange} />
					</Form.Field>))}
					<Button onClick={onAddLink}>Add URL</Button>
				</Form.Field>

				<Form.Field width={4}>
					<label>Files</label>
					{part.files.map((file, index) => (<Form.Field key={index}>
						<Input id={index} name="file" icon="file" iconPosition="left" action={{color: 'red', icon: 'trash', onClick: () => onRemoveFile(index)}} readOnly value={file.filename} />
					</Form.Field>))}
					<input ref={fileUploadRef} type="file" style={{display: "none"}} onChange={onFileUpload(part.files.length || 0)} />
					<Button onClick={() => fileUploadRef.current?.click()}>Upload file</Button>
				</Form.Field>
			</Form>
		</Segment>
	</Fragment>)
}
