import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ModalDiscard, Toolbar, PartEdit } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { LoadingStatus } from "../lib/loading";
import { OpenModal } from "../lib/modal";
import { ErrorMessage, handleError } from "../lib/error";
import { DropdownItemProps, Message } from "semantic-ui-react";
import { transformStorageToOption } from "../lib/helpers";
import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { TwirpError } from "twirpscript/dist";
import { cloneDeep } from "lodash";

export const PartCreateView: FC = () => {
	const [ part, setPart ] = useState<models.Part>(models.Part.defaultValue());
	const [ loading, setLoading ] = useState<LoadingStatus>({...LoadingStatus.defaultValue(), fetch: false})
	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	const [ message, setMessage ] = useState<ErrorMessage>();
	const [ availableStorage, setAvailableStorage ] = useState<DropdownItemProps[]>();
	const [ searchParams ] = useSearchParams();

	const navigate = useNavigate();
	const storageId  = searchParams.get("storage")

	useEffect(() => {
		if (storageId) {
			const newState = cloneDeep(part)
			newState.storageId = { id: storageId }
			setPart(newState);
		}
	}, [storageId]);

	useEffect(() => {
		setLoading({...loading, options: availableStorage === undefined})
	}, [part, availableStorage])

	useEffect(() => {
		Storage.FetchAll({}).then(resp => {
			const options = resp.storages.map(transformStorageToOption);

			setAvailableStorage(options)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			return e.code === "not_found";
		}))
	}, [])

	const addStorage = (name: string, callback: (id: models.ID) => void) => {
		setLoading({...loading, options: true})

		Storage.Create({...models.Storage.defaultValue(), name}).then(resp => {
			let options = [transformStorageToOption(resp)];
			if (availableStorage !== undefined) {
				options = [...availableStorage, transformStorageToOption(resp)];
			}

			setAvailableStorage(options);

			callback(resp.id)
		}).catch(handleError(setMessage)).finally(() => {
			setLoading({...loading, options: false})
		})
	}

	// @TODO Move this into a seperate lib, as it is currently duplicated here and in PartView
	const toolbarEdit: ToolbarFunction[] = [
		{
			icon: "cancel",
			on: () => {
				// @TODO Figure out a way to remove the edit page from the history,
				// but only if we came from PartDetail
				// @TODO Ask the user if they are sure
				// @TODO We should also ask this if we are about no navigate away
				setModal(OpenModal.Discard)
			},
		},
		{
			icon: "save",
			on: () => {
				// We should not be able to press the button if there is no part loaded
				if (part === undefined) {
					return
				}

				setLoading({...loading, save: true})
				
				Part.Create(part).then(resp => {
					setPart(resp)
					navigate(`../${resp.id.id}`)
					setMessage(undefined)
				}).catch(handleError(setMessage)).finally(() => {
					setLoading({...loading, save: false})
				})
			},
		}
	];

	return (<Fragment>
		<ModalDiscard
			open={modal === OpenModal.Discard}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				navigate("..")
				setMessage(undefined)
				setModal(OpenModal.None)
			}}
		/>
		<Toolbar name={part?.name || "New part"} loading={loading} functions={toolbarEdit} />
		<PartEdit part={part} availableStorage={availableStorage} addStorage={addStorage} updatePart={setPart} loading={loading} attached={message !== undefined} />
		{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}