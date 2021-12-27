import { FC, useEffect, useState } from "react";
import { ErrorMessage, handleError } from "../lib/error";

import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { NotFound, PartList } from "../components";

export const PartsView: FC = () => {
	const [ parts, setParts ] = useState<models.Part[]>([]);
	const [ notFound, setNotFound ] = useState<boolean>(false);
	const [ message, setMessage ] = useState<ErrorMessage>();

	useEffect(() => {
		setParts([])
		setMessage(undefined)

		Part.FetchAll({}).then(resp => {
			setParts(resp.parts)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setNotFound(true);
				return true;
			}
			return false;
		}))
	}, []);

	if (notFound) {
		return (<NotFound />);
	}

	return (
		<PartList parts={parts} showStorage={true}/>
	)
}
