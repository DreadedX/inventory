import { cloneDeep } from "lodash";
import { ChangeEvent, FC } from "react";
import { Form, Segment } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";

interface Props {
	storage: models.Storage | undefined
	updateStorage: (storage: models.Storage) => void
	attached: boolean
	loading: LoadingStatus
}

export const StorageEdit: FC<Props> = ({ storage, updateStorage, attached, loading }: Props) => {

	const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (storage === undefined) {
			return
		}

		const newState = cloneDeep(storage)
		switch (event.target.name) {
			case "name":
			newState[event.target.name] = event.target.value;
				break;

			default:
			console.error("UNKNOWN NAME", event.target.name, event)
		}

		updateStorage(newState);
	}

	return (<Segment color="grey" attached={(attached) ? true : "bottom"}>
		<Form loading={loading.fetch || loading.save}>
			<Form.Input width={5} label="Name" name="name" placeholder="Name..." value={storage?.name} onChange={onChange} />
		</Form>
	</Segment>);
}
