import { FC, Fragment, useEffect, useState } from "react";
import { LoadingStatus } from "../lib/loading";
import { PartList, Toolbar } from ".";
import * as models from "../models/models.pb";
import { Message } from "semantic-ui-react";

interface Props {
	storage: models.Storage | undefined
	loading: LoadingStatus
	attached?: boolean
}

export const StorageDetail: FC<Props> = ({ storage, loading, attached }) => {
	const [ empty, setEmpty ] = useState<boolean>(false);

	useEffect(() => {
		setEmpty(storage?.parts.length === 0)
	}, [storage]);

	return (<Fragment>
		<Toolbar name={storage?.name} loading={loading} functions={[]} />
		<PartList parts={storage?.parts || []} loading={loading.fetch} attached={attached || empty} />
		{ empty && <Message attached={attached ? true : "bottom"} warning icon="exclamation circle" header="No parts in storage"/> }
	</Fragment>);
}
