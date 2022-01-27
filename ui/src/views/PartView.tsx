import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TwirpError } from 'twirpscript/dist/runtime/error';
import { NotFound, PartDetail, PartEdit, Toolbar, ModalDelete, ModalDiscard, ModalPrint } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { transformStorageToOption } from "../lib/helpers";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import { OpenModal } from "../lib/modal";
import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import * as Storage from "../handlers/storage/storage.pb";
import * as Label from "../handlers/label/label.pb";
import * as FileHandler from "../handlers/file/file.pb";
import { DropdownItemProps, Message } from "semantic-ui-react";
import { cloneDeep } from "lodash";
import { NewFile } from "../lib/upload";
import { useImmer } from "use-immer";

interface Props {
	editing?: boolean
}

// @TODO This needs a little bit of cleanup
export const PartView: FC<Props> = ({ editing }: Props) => {
	const { id } = useParams();

	const [ part, setPart ] = useState<models.Part>(models.Part.defaultValue());
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ editedPart, setEditedPart ] = useImmer<models.Part>(models.Part.defaultValue());
	const [ hasEdited, setHasEdited ] = useState(false);
	const [ availableStorage, setAvailableStorage ] = useImmer<DropdownItemProps[]>([]);
	const [ files, setFiles ] = useImmer<NewFile[]>([])

	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	const [ labelPreview, setLabelPreview ] = useState<string>();

	const [ loading, setLoading ] = useImmer<LoadingStatus>(LoadingStatus.defaultValue())

	const navigate = useNavigate();

	useEffect(() => {
		// @TODO Can we do this better
		setEditedPart(cloneDeep(part))
	}, [part])

	useEffect(() => {
		setLoading(draft => {
			draft.fetch = part === undefined
			draft.options = availableStorage === undefined
		})
	}, [part, availableStorage])

	useEffect(() => {
		if (id === undefined) {
			setNotFound(true)
			return
		}

		setLoading(draft => {draft.fetch = true})
		setMessage(undefined)

		Part.Fetch({id: id}).then(resp => {
			setPart(resp)
			setLoading(draft => {draft.fetch = false})
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setNotFound(true);
				return true;
			}
			return false;
		}))
	}, [id]);

	useEffect(() => {
		setLoading(draft => {draft.options = true})
		if (editing) {
			Storage.FetchAll({query: ""}).then(resp => {
				const options = resp.storages.map(transformStorageToOption);

				setAvailableStorage(options)
				setLoading(draft => {draft.options = false})
			}).catch(handleError(setMessage, (e: TwirpError) => {
				return e.code === "not_found";
			}))
		}
	}, [editing])

	const toolbarEdit: ToolbarFunction[] = [
		{
			icon: "cancel",
			on: () => {
				// @TODO Figure out a way to remove the edit page from the history,
				// but only if we came from PartDetail
				// @TODO Ask the user if they are sure
				// @TODO We should also ask this if we are about no navigate away
				if (hasEdited) {
					setModal(OpenModal.Discard)
				} else {
					navigate("..")
					setMessage(undefined)
				}
			},
		},
		{
			icon: "save",
			on: async () => {
				setLoading(draft => {draft.save = true})

				try {
					const finalPart = cloneDeep(editedPart)

					for (const {file, index} of files) {
						const buffer = await file.arrayBuffer()
						const data = new Uint8Array(buffer);
						const f = await FileHandler.Upload({
							data,
							filename: file.name,
							partId: part.id
						})

						finalPart.files[index] = f
						// @TODO We need to remove from the files array,
						// that way if one of the upload fails, we do not get duplicate uploads
					}
					setFiles([])

					const resp = await Part.Update(finalPart)
					setPart(resp)

					setMessage(undefined)
					setHasEdited(false);

					navigate("..")
				} catch(e: any) {
					handleError(setMessage)(e)
					return
				}

				setLoading(draft => {draft.save = false})
			},
		}
	];

	const toolbarDetail: ToolbarFunction[] = [
		{
			icon: "print",
			on: () => {
				setLabelPreview(undefined)

				Label.Preview({id: part.id, type: Label.Type.PART}).then(resp => {
					const blob = new Blob([resp.image], {type: "image/png"})
					const url = URL.createObjectURL(blob)
					setLabelPreview(url)
					console.log(url)
				})

				setModal(OpenModal.Print)
			},
		},
		{
			icon: "edit",
			on: () => {
				setMessage(undefined)
				setEditedPart(cloneDeep(part))
				navigate("./edit")
			},
		},
		{
			icon: "trash",
			on: () => {
				setModal(OpenModal.Remove)
			},
		}
	];

	const addStorage = (name: string, callback: (id: models.ID) => void) => {
		setLoading(draft => {draft.options = true})

		Storage.Create({...models.Storage.defaultValue(), name}).then(resp => {
			let options = [transformStorageToOption(resp)];
			if (availableStorage !== undefined) {
				options = [...availableStorage, transformStorageToOption(resp)];
			}

			setAvailableStorage(options);

			callback(resp.id)
		}).catch(handleError(setMessage)).finally(() => {
			setLoading(draft => {draft.options = false})
		})
	}

	const addFile = (newFile: NewFile) => {
		setFiles(draft => {draft.push(newFile)})
	}

	// @TODO Redirect people to the 404 page
	if (notFound) {
		return (<NotFound />);
	}

	const Modals = () => <Fragment>
		<ModalDelete
			open={modal === OpenModal.Remove}
			deleting={loading.delete}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				setLoading(draft => {draft.delete = true})

				Part.Delete(part.id).then(() => {
					navigate("../..", {replace: true})
				}).catch(e => {
					handleError(setMessage)(e)
					// We put this in catch instead of finally,
					// as succes lead to a page change
					setLoading(draft => {draft.delete = false})
					setModal(OpenModal.None)
				})
			}}
		/>

		<ModalDiscard
			open={modal === OpenModal.Discard}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				navigate("..")
				setMessage(undefined)
				setHasEdited(false);
				setModal(OpenModal.None)
			}}
		/>

		<ModalPrint
			open={modal === OpenModal.Print}
			printing={loading.print}
			preview={labelPreview}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				setLoading(draft => {draft.print = true})

				Label.Print({id: part.id, type: Label.Type.PART}).catch(handleError(setMessage)).finally(() => {
					setLoading(draft => {draft.print = false})
					setModal(OpenModal.None)
				})
			}}
		/>
	</Fragment>

	// @TODO The modal seems to shift over everything else, we should propably store the modal at a higher level?
	return (<Fragment>
		<Modals />
		<Toolbar name={part?.name} loading={loading} functions={editing ? toolbarEdit : toolbarDetail} />
		{ (editing
			&& <PartEdit part={editedPart} availableStorage={availableStorage} addStorage={addStorage} addFile={addFile} updatePart={(part) => {setHasEdited(true); setEditedPart(part)}} loading={loading} attached={message !== undefined} />)
			|| <PartDetail part={part} loading={loading} attached={message !== undefined} />
		}
	{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
