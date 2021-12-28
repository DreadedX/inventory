import { FC, Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorMessage, handleError } from "../lib/error";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { StorageDetail } from "../components";

interface Props {
	editing?: boolean
}

export const StorageView: FC<Props> = ({ editing }: Props) => {
	const { id } = useParams();

	const [ storage, setStorage ] = useState<models.Storage>();
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ loading, setLoading ] = useState<LoadingStatus>(LoadingStatus.defaultValue())

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

	return (<Fragment>
		{ editing
			? <p>EDIT</p>
			: <StorageDetail storage={storage} loading={loading} attached={message !== undefined}/>
		}
	</Fragment>);
}
