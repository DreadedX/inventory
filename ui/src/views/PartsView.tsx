import { FC, Fragment, useEffect, useState } from "react";
import { ErrorMessage, handleError } from "../lib/error";

import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { PartList } from "../components";
import { LoadingStatus } from "../lib/loading";
import { ToolbarSearch, ToolbarFunction } from "../components/Toolbar";
import { Message } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

export const PartsView: FC = () => {
	const [ parts, setParts ] = useState<models.Part[]>([]);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ loading, setLoading ] = useState(false)

	const navigate = useNavigate();

	useEffect(() => {
		setParts([])
		setMessage(undefined)
		setLoading(true)

		Part.FetchAll({}).then(resp => {
			setParts(resp.parts)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				// Let the PartList deal with having no parts
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
				navigate("create");
			},
		}
	]

	// @TODO Store the search as a query parameter
	const onSearch = (query: string) => {
		setMessage(undefined)

		Part.Search({query}).then(resp => {
			setParts(resp.parts)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setParts([])
				return true;
			}
			return false;
		})).finally(() => {
			// setLoading(false)
		})
	}

	return (<Fragment>
		<ToolbarSearch onSearch={onSearch} hint="Search part..." loading={{...LoadingStatus.defaultValue(), fetch: false}} functions={toolbar} />
		<PartList parts={parts} loading={loading} showStorage attached={message !== undefined}/>
		{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
	</Fragment>)
}
