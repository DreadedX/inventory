import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import { OpenModal } from "../lib/modal";
import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import * as Label from "../handlers/label/label.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { ModalDelete, ModalDiscard, ModalPrint, NotFound, StorageDetail, Toolbar } from "../components";
import { ToolbarFunction } from "../components/Toolbar";

interface Props {
	editing?: boolean
}

export const StorageView: FC<Props> = ({ editing }: Props) => {
	const { id } = useParams();

	const [ storage, setStorage ] = useState<models.Storage>();
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ modal, setModal ] = useState<OpenModal>(OpenModal.None)
	const [ labelPreview, setLabelPreview ] = useState<string>();

	const [ loading, setLoading ] = useState<LoadingStatus>(LoadingStatus.defaultValue())

	const navigate = useNavigate();

	useEffect(() => {
		setLoading({...loading, fetch: storage === undefined})
	}, [storage])

	useEffect(() => {
		if (id === undefined) {
			setNotFound(true)
			return
		}

		setStorage(undefined)
		setMessage(undefined)

		Storage.Fetch({id: id}).then(resp => {
			setStorage(resp)
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

	const toolbar: ToolbarFunction[] = [
		{
			icon: "plus",
			on: () => {
				console.log("Create a new part with the storage preselected")
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
				// setEditedPart(cloneDeep(part))
				// navigate("./edit")
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

				setLoading({...loading, delete: true})

				Storage.Delete(storage.id).then(() => {
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
				// setHasEdited(false);
				// setModal(OpenModal.None)
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

				setLoading({...loading, print: true})

				Label.Print({id: storage.id, type: Label.Type.STORAGE}).catch(handleError(setMessage)).finally(() => {
					setLoading({...loading, print: false})
					setModal(OpenModal.None)
				})
			}}
		/>
	</Fragment>

	return (<Fragment>
		<Modals />
		<Toolbar name={storage?.name} loading={loading} functions={toolbar} />
		{ editing
			? <p>EDIT</p>
			: <StorageDetail storage={storage} loading={loading} attached={message !== undefined}/>
		}
	</Fragment>);
}
