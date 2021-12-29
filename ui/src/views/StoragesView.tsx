import { FC, Fragment, useEffect, useState } from "react";
import { ErrorMessage, handleError } from "../lib/error";

import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { StorageList } from "../components";
import { LoadingStatus } from "../lib/loading";
import { ToolbarSearch, ToolbarFunction } from "../components/Toolbar";
import { Message } from "semantic-ui-react";

export const StoragesView: FC = () => {
	const [ storage, setStorage ] = useState<models.Storage[]>([]);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ loading, setLoading ] = useState(false)

	useEffect(() => {
		setStorage([])
		setMessage(undefined)
		setLoading(true)

		Storage.FetchAll({}).then(resp => {
			setStorage(resp.storages)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setMessage({severity: "info", icon: "question", header: "No storage found!", details: "There are no known storage, try adding some"})
				return true;
			}
			return false;
		})).finally(() => {
			setLoading(false)
		})
	}, []);

	const toolbar: ToolbarFunction[] = [
		{
			icon: "plus",
			on: () => {
				console.log("Create a new part")
			},
		}
	]

	// @TODO Store the search as a query parameter
	const onSearch = (query: string) => {
		console.log(query)
	}

	return (<Fragment>
		<ToolbarSearch onSearch={onSearch} hint="Search storage..." loading={{...LoadingStatus.defaultValue(), fetch: false}} functions={toolbar} />
		<StorageList storage={storage} loading={loading} attached={message !== undefined}/>
		{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
