import { FC, Fragment, useState } from "react"
import {ModalDiscard, StorageEdit, Toolbar } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import { OpenModal } from "../lib/modal";
import { useNavigate } from "react-router-dom";

import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { useImmer } from "use-immer";

export const StorageCreateView: FC = () => {
	const [ storage, setStorage ] = useImmer<models.Storage>(models.Storage.defaultValue());
	const [ message, setMessage ] = useState<ErrorMessage>();
	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	const [ loading, setLoading ] = useImmer<LoadingStatus>({...LoadingStatus.defaultValue(), fetch: false})

	const navigate = useNavigate();

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
				if (storage === undefined) {
					return
				}

				setLoading(draft => {draft.save = true})
				
				Storage.Create(storage).then(resp => {
					setStorage(resp)
					navigate(`../${resp.id.id}`)
					setMessage(undefined)
				}).catch(handleError(setMessage)).finally(() => {
					setLoading(draft => {draft.save = false})
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
		<Toolbar name={storage?.name || "New storage"} loading={loading} functions={toolbarEdit} />
		<StorageEdit storage={storage} loading={loading} attached={message !== undefined} updateStorage={setStorage}  />
	</Fragment>)
}
