import { ChangeEvent, FC, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { TwirpError } from 'twirpscript/dist/runtime/error';
import { NotFound, PartDetail, PartEdit } from "../components";
import { Toolbar, ToolbarFunction } from "../components/Toolbar";
import { handleError, transformStorageToOption } from "../lib/edit";
import { MessageInfo } from "../message";
import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { DropdownItemProps, DropdownProps, Message } from "semantic-ui-react";

export const PartView: FC = () => {
	const { id } = useParams();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const [ part, setPart ] = useState<models.Part>();
	const [ availableStorage, setAvailableStorage ] = useState<DropdownItemProps[]>([]);
	const [ editedPart, setEditedPart ] = useState<models.Part>();
	const [ message, setMessage ] = useState<MessageInfo>();
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ editing, setEditing ] = useState<boolean>(searchParams.has("edit"));
	const [ loading, setLoading ] = useState<boolean>(part === undefined)
	const [ loadingAvailableStorage, setLoadingAvailableStorage ] = useState<boolean>(false)

	useEffect(() => {
		setLoading(part === undefined)
		setEditedPart(part)
	}, [part])

	useEffect(() => {
		setEditing(searchParams.has("edit"))
	}, [searchParams])

	useEffect(() => {
		if (id === undefined) {
			setNotFound(true)
			return
		}

		setLoading(true)
		setMessage(undefined)

		Part.Fetch({id: id}).then(resp => {
			setPart(resp)
			setMessage(undefined)
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
			setLoadingAvailableStorage(true)
			Storage.FetchAll({}).then(resp => {
				const options = resp.storages.map(transformStorageToOption);

				setAvailableStorage(options)
			}).catch(handleError(setMessage, (e: TwirpError) => {
				return e.code === "not_found";
			})).finally(() => {
				setLoadingAvailableStorage(false)
			})
		}
	}, [editing])

	const functionsEdit: ToolbarFunction[] = [
		{
			icon: "cancel",
			on: () => {
				// @TODO Figure out a way to remove the edit page from the history,
				// but only if we came from PartDetail
				setSearchParams({})
				setEditedPart(part)
				setMessage(undefined);
			},
		},
		{
			icon: "save",
			on: () => {
				// We should not be able to press the button if there is no part loaded
				if (part === undefined || editedPart === undefined) {
					return
				}

				setLoading(true)
				setMessage(undefined)
				
				Part.Update(editedPart).then(resp => {
					setPart(resp)
					setMessage(undefined)
					setSearchParams({})
				}).catch(handleError(setMessage)).finally(() => {
					setLoading(false)
				})
			},
		}
	];

	const functionsDetail: ToolbarFunction[] = [
		{
			icon: "print",
			on: () => {
				console.log("PRINT");
			},
		},
		{
			icon: "edit",
			on: () => {
				setSearchParams({edit: ""})
				setMessage(undefined);
			},
		},
		{
			icon: "trash",
			on: () => {
				console.log("PRINT");
			},
		}
	];

	const onEdit = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (editedPart === undefined) {
			return
		}

		const newState = {...editedPart}
		// We can now safely cast, as dropdown will only be set to false if it is a change event
		const cevent = event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
		switch (cevent.target.name) {
			case "name":
			case "footprint":
			case "description":
			newState[cevent.target.name] = cevent.target.value;
				break;

			case "quantity":
			newState[cevent.target.name] = parseInt(cevent.target.value);
				break;

			default:
			console.error("UNKNOWN NAME", cevent.target.name)
		}

		setEditedPart(newState);
	}

	const onEditDropdown = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		if (editedPart === undefined) {
			return
		}

		console.log(data)

		// @TODO if the storage is being created data.value will instead hold the text value...
		const newState = {...editedPart}
		newState.storageId = {...models.ID.defaultValue(), id: data.value as string}

		setEditedPart(newState)
	}

	const onAddStorage = (_event: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
		if (editedPart === undefined) {
			return
		}

		setLoadingAvailableStorage(true);

		Storage.Create({...models.Storage.defaultValue(), name: data.value as string}).then(resp => {
			const options = [...availableStorage, transformStorageToOption(resp)];
			setAvailableStorage(options);

			const newState = {...editedPart};
			newState.storageId = resp.id;
			setEditedPart(newState);
		}).catch(handleError(setMessage)).finally(() => {
			setLoadingAvailableStorage(false)
		})
	}

	if (notFound) {
		return (<NotFound />);
	}

	return (<Fragment>
		<Toolbar name={part?.name} loading={loading} functions={editing ? functionsEdit : functionsDetail} />
		{ (editing
			&& <PartEdit part={editedPart} availableStorage={availableStorage} loadingAvailableStorage={loadingAvailableStorage} onEdit={onEdit} onEditDropdown={onEditDropdown} onAddStorage={onAddStorage} loading={loading} attached={message !== undefined} />)
			|| <PartDetail part={part} loading={loading} attached={message !== undefined} />
		}
		{ message && <Message attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
