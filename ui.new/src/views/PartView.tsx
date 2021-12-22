import { ChangeEvent, FC, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TwirpError } from 'twirpscript/dist/runtime/error';
import { NotFound, PartDetail, PartEdit, Toolbar, ModalDelete } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { transformStorageToOption } from "../lib/helpers";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { DropdownItemProps, DropdownProps, Message } from "semantic-ui-react";
import { PartEditFunctions } from "../components/PartEdit";
import { cloneDeep, cloneDeepWith } from "lodash";

export const PartView: FC = () => {
	const { id } = useParams();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const [ part, setPart ] = useState<models.Part>();
	const [ availableStorage, setAvailableStorage ] = useState<DropdownItemProps[]>();
	const [ editedPart, setEditedPart ] = useState<models.Part>();
	const [ message, setMessage ] = useState<ErrorMessage>();
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ editing, setEditing ] = useState<boolean>(searchParams.has("edit"));

	const [ modal, setModal ] = useState<JSX.Element>();
	const [ modalOpen, setModalOpen ] = useState<boolean>(false);

	const [ loading, setLoading ] = useState<LoadingStatus>(LoadingStatus.defaultValue())

	const navigate = useNavigate();

	useEffect(() => {
		setEditedPart(cloneDeep(part))
	}, [part])

	useEffect(() => {
		setLoading({...loading, fetch: part === undefined, options: availableStorage === undefined})
	}, [part, availableStorage])

	useEffect(() => {
		setEditing(searchParams.has("edit"))
	}, [searchParams])

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
				setSearchParams({})
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
					setMessage(undefined)
					setSearchParams({})
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
				console.log("PRINT")
			},
		},
		{
			icon: "edit",
			on: () => {
				setEditedPart(cloneDeep(part))
				setSearchParams({edit: ""})
			},
		},
		{
			icon: "trash",
			on: () => {
				setModal(<ModalDelete onCancel={() => setModalOpen(false)} onConfirm={() => {
					// We should not be able to press the button if there is no part loaded
					if (part === undefined) {
						return
					}

					setLoading({...loading, delete: true})

					Part.Delete(part.id).then(() => {
						navigate("/part")
					}).catch(e => {
						handleError(setMessage)(e)
						// We put this in catch instead of finally,
						// as succes lead to a page change
						setLoading({...loading, delete: false})
					})
				}}/>)
				setModalOpen(true)
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

	// @TODO The modal seems to shift over everything else, we should propably store the modal at a higher level?
	return (<Fragment>
		{ modalOpen && modal }
		<Toolbar name={part?.name} loading={loading} functions={editing ? toolbarEdit : toolbarDetail} />
		{ (editing
			&& <PartEdit part={editedPart} availableStorage={availableStorage} functions={functionsEdit} loading={loading} attached={message !== undefined} />)
			|| <PartDetail part={part} loading={loading} attached={message !== undefined} />
		}
		{ message && <Message attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
