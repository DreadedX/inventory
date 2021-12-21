import { Dispatch, SetStateAction } from "react";
import { DropdownItemProps } from "semantic-ui-react";
import { isTwirpError, TwirpError } from 'twirpscript/dist/runtime/error';
import { MessageInfo } from "../message";
import * as models from "../models/models.pb";

export const transformStorageToOption = (s: models.Storage): DropdownItemProps => {
	return {
		key: s.id.id,
		value: s.id.id,
		text: s.name
	}
}

export const handleError = (setMessage: Dispatch<SetStateAction<MessageInfo | undefined>>, callback?: (e: TwirpError) => boolean) => {
	return (e: Error) => {
		if (isTwirpError(e)) {
			if (callback && callback(e)) {
				return
			}

			setMessage({severity: "error", icon: "times", header: "Error", details: e.msg})
		} else {
			console.error(e)
			setMessage({severity: "error", icon: "times", header: "Error", details: "An unknown error has occured"})
		}
	}
}
