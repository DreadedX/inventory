import { FC, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { StorageEdit } from '../components';
import { Storage } from '../models/models.pb';

export const StorageCreate: FC = () => {
	const [storage, setStorage] = useState<Storage>(Storage.defaultValue());

	return (<Container style={{ margin: "3em" }}>
		<StorageEdit storage={storage} setStorage={setStorage} create />
	</Container>)
}
