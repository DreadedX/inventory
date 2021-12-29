import { FC, Fragment } from "react";
import { LoadingStatus } from "../lib/loading";
import { PartList } from ".";
import * as models from "../models/models.pb";

interface Props {
	storage: models.Storage | undefined
	loading: LoadingStatus
	attached?: boolean
}

export const StorageDetail: FC<Props> = ({ storage, loading, attached }) => {
	return (<Fragment>
		<PartList parts={storage?.parts || []} loading={loading.fetch} attached={attached} />
	</Fragment>);
}
