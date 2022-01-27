import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import { OpenModal } from "../lib/modal";
import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import * as Label from "../handlers/label/label.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { ModalDelete, ModalDiscard, ModalPrint, NotFound, StorageDetail, StorageEdit, Toolbar } from "../components";
import { ToolbarFunction } from "../components/Toolbar";
import { cloneDeep } from "lodash";
import { Message } from "semantic-ui-react";
import { useImmer } from "use-immer";

interface Props {
	editing?: boolean
}

export const StorageView: FC<Props> = ({ editing }: Props) => {
	const { id } = useParams();

	const [ storage, setStorage ] = useState<models.Storage>(models.Storage.defaultValue());
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ editedStorage, setEditedStorage ] = useImmer<models.Storage>(models.Storage.defaultValue());
	const [ hasEdited, setHasEdited ] = useState(false);

	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	const [ labelPreview, setLabelPreview ] = useState<string>();

	const [ loading, setLoading ] = useImmer<LoadingStatus>(LoadingStatus.defaultValue())

	const navigate = useNavigate();

	useEffect(() => {
		setEditedStorage(cloneDeep(storage))
	}, [storage])

	useEffect(() => {
		if (id === undefined) {
			setNotFound(true)
			return
		}

		setLoading(draft => {draft.fetch = true})
		setMessage(undefined)

		Storage.Fetch({id: id}).then(resp => {
			setStorage(resp)
			setLoading(draft => {draft.fetch = false})
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setNotFound(true);
				return true;
			}
			return false;
		}))
	}, [id]);

	if (notFound) {
		return (<NotFound />)
	}

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
			on: () => {
				// We should not be able to press the button if there is no part loaded
				if (storage === undefined || editedStorage === undefined) {
					return
				}

				setLoading(draft => {draft.save = true})
				
				Storage.Update(editedStorage).then(resp => {
					setStorage(resp)
					navigate("..")
					setMessage(undefined)
					setHasEdited(false);
				}).catch(handleError(setMessage)).finally(() => {
					setLoading(draft => {draft.save = false})
				})
			},
		}
	];

	const toolbarDetails: ToolbarFunction[] = [
		{
			icon: "plus",
			on: () => {
				navigate(`/part/create?storage=${storage?.id.id}`);
			}
		},
		{
			icon: "print",
			on: () => {
				if (storage === undefined) {
					return
				}

				setLabelPreview(undefined)

				Label.Preview({id: storage.id, type: Label.Type.STORAGE}).then(resp => {
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
				console.log("EDIT STORAGE")
				setEditedStorage(cloneDeep(storage))
				navigate("./edit")
			},
		},
		{
			icon: "trash",
			on: () => {
				setModal(OpenModal.Remove)
			},
		}
	]

	// @TODO A large part of this is just copy-pasted from PartView
	// Maybe split it in to something seperate
	const Modals = () => <Fragment>
		<ModalDelete
			open={modal === OpenModal.Remove}
			deleting={loading.delete}
			onCancel={() => setModal(OpenModal.None)}
			onConfirm={() => {
				// We should not be able to press the button if there is no part loaded
				if (storage === undefined) {
					return
				}

				setLoading(draft => {draft.delete = true})

				Storage.Delete(storage.id).then(() => {
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
				if (storage === undefined) {
					return
				}

				setLoading(draft => {draft.print = true})

				Label.Print({id: storage.id, type: Label.Type.STORAGE}).catch(handleError(setMessage)).finally(() => {
					setLoading(draft => {draft.print = false})
					setModal(OpenModal.None)
				})
			}}
		/>
	</Fragment>

	return (<Fragment>
		<Modals />
		<Toolbar name={storage?.name} loading={loading} functions={editing ? toolbarEdit : toolbarDetails} />
		{ editing
			? <StorageEdit storage={editedStorage} loading={loading} attached={message !== undefined} updateStorage={(storage) => {setHasEdited(true); setEditedStorage(storage)}}  />
			: <StorageDetail storage={storage} loading={loading} attached={message !== undefined}/>
		}
		{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>);
}
