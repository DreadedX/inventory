import { ChangeEvent, FC, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TwirpError } from 'twirpscript/dist/runtime/error';
import { NotFound, PartDetail, PartEdit, Toolbar, ModalDelete, ModalDiscard, ModalPrint } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { transformStorageToOption } from "../lib/helpers";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import * as Storage from "../handlers/storage/storage.pb";
import * as Label from "../handlers/label/label.pb";
import { DropdownItemProps, DropdownProps, Message } from "semantic-ui-react";
import { PartEditFunctions } from "../components/PartEdit";
import { cloneDeep, cloneDeepWith } from "lodash";

interface Props {
	editing?: boolean
}

enum OpenModal {
	None,
	Remove,
	Discard,
	Print,
}

export const PartView: FC<Props> = ({ editing }: Props) => {
	const { id } = useParams();

	const [ part, setPart ] = useState<models.Part>();
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ editedPart, setEditedPart ] = useState<models.Part>();
	const [ availableStorage, setAvailableStorage ] = useState<DropdownItemProps[]>();

	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	// const [ modalOpen, setModalOpen ] = useState<boolean>(false);
	// const [ modal, setModal ] = useState<JSX.Element>();

	const [ labelPreview, setLabelPreview ] = useState<string>();

	const [ loading, setLoading ] = useState<LoadingStatus>(LoadingStatus.defaultValue())

	const navigate = useNavigate();

	useEffect(() => {
		setEditedPart(cloneDeep(part))
	}, [part])

	useEffect(() => {
		setLoading({...loading, fetch: part === undefined, options: availableStorage === undefined})
	}, [part, availableStorage])

	useEffect(() => {
		if (id === undefined) {
			setNotFound(true)
			return
		}

		setPart(undefined)
		setMessage(undefined)

		Part.Fetch({id: id}).then(resp => {
			setPart(resp)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setNotFound(true);
				return true;
			}
			return false;
		}))
	}, [id]);

	useEffect(() => {
		if (editing) {
			Storage.FetchAll({}).then(resp => {
				const options = resp.storages.map(transformStorageToOption);

				setAvailableStorage(options)
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
				setModal(OpenModal.Discard)
			},
		},
		{
			icon: "save",
			on: () => {
				// We should not be able to press the button if there is no part loaded
				if (part === undefined || editedPart === undefined) {
					return
				}

				setLoading({...loading, save: true})
				setMessage(undefined)
				
				Part.Update(editedPart).then(resp => {
					setPart(resp)
					navigate("..")
				}).catch(handleError(setMessage)).finally(() => {
					setLoading({...loading, save: false})
				})
			},
		}
	];

	const toolbarDetail: ToolbarFunction[] = [
		{
			icon: "print",
			on: () => {
				if (part === undefined) {
					return
				}

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

	const functionsEdit: PartEditFunctions = {
		onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			if (editedPart === undefined) {
				return
			}

			const newState = cloneDeepWith(editedPart)
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

			setEditedPart(newState);
		},
		onChangeStorage: (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
			if (editedPart === undefined) {
				return
			}

			// @TODO if the storage is being created data.value will instead hold the text value...
			const newState = cloneDeepWith(editedPart)
			newState.storageId = {...models.ID.defaultValue(), id: data.value as string}

			setEditedPart(newState)
		},
		onAddStorage: (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
			if (editedPart === undefined) {
				return
			}

			setLoading({...loading, options: true})

			Storage.Create({...models.Storage.defaultValue(), name: data.value as string}).then(resp => {
				let options = [transformStorageToOption(resp)];
				if (availableStorage !== undefined) {
					options = [...availableStorage, transformStorageToOption(resp)];
				}

				setAvailableStorage(options);

				const newState = cloneDeep(editedPart);
				newState.storageId = resp.id;
				setEditedPart(newState);
			}).catch(handleError(setMessage)).finally(() => {
				setLoading({...loading, options: false})
			})
		},
		onRemoveUrl: (index: number) => {
			if (editedPart === undefined) {
				return
			}

			const newState = cloneDeepWith(editedPart)
			newState.links.splice(index, 1)

			setEditedPart(newState)
		},
		onAddUrl: () => {
			if (editedPart === undefined) {
				return
			}

			const newState = cloneDeepWith(editedPart)
			newState.links.push(models.Link.defaultValue())

			setEditedPart(newState)
		}
	}

	if (notFound) {
		return (<NotFound />);
	}

	const Modals = () => <Fragment>
		<ModalDelete
			open={modal === OpenModal.Remove}
			deleting={loading.delete}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				// We should not be able to press the button if there is no part loaded
				if (part === undefined) {
					return
				}

				setLoading({...loading, delete: true})

				Part.Delete(part.id).then(() => {
					navigate("../..", {replace: true})
				}).catch(e => {
					handleError(setMessage)(e)
					// We put this in catch instead of finally,
					// as succes lead to a page change
					setLoading({...loading, delete: false})
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
				setModal(OpenModal.None)
			}}
		/>

		<ModalPrint
			open={modal === OpenModal.Print}
			printing={loading.print}
			preview={labelPreview}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				if (part === undefined) {
					return
				}

				setLoading({...loading, print: true})

				Label.Print({id: part.id, type: Label.Type.PART}).catch(handleError(setMessage)).finally(() => {
					setLoading({...loading, print: false})
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
			&& <PartEdit part={editedPart} availableStorage={availableStorage} functions={functionsEdit} loading={loading} attached={message !== undefined} />)
			|| <PartDetail part={part} loading={loading} attached={message !== undefined} />
		}
	{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
