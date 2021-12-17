import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";

export type MessageInfo = {
	severity?: "success" | "error" | "warning" | "info"
	icon?: SemanticICONS
	header?: string
	details?: string
}

