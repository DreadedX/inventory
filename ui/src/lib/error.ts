import { isTwirpError, TwirpError } from 'twirpscript/dist/runtime/error';

import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";

export type ErrorMessage = {
	severity?: "success" | "error" | "warning" | "info"
	icon?: SemanticICONS
	header?: string
	details?: string
}

export const handleError = (onMessage: (message: ErrorMessage) => void, callback?: (e: TwirpError) => boolean) => {
	return (e: Error) => {
		if (isTwirpError(e)) {
			if (callback && callback(e)) {
				return
			}

			onMessage({severity: "error", icon: "times", header: "Error", details: e.msg})
		} else {
			console.error(e)
			onMessage({severity: "error", icon: "times", header: "Error", details: "An unknown error has occured"})
		}
	}
}
