import { DropdownItemProps } from "semantic-ui-react";
import * as models from "../models/models.pb";

export const transformStorageToOption = (s: models.Storage): DropdownItemProps => {
	return {
		key: s.id.id,
		value: s.id.id,
		text: s.name
	}
}
