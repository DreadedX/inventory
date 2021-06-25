import { FC, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { StorageEdit } from '../components';

export const StorageCreate: FC = () => {
	const [storage, setStorage] = useState<ApiStorage>({
		id: "",
		name: "",
	});

	return (<Container style={{ margin: "3em" }}>
		<StorageEdit storage={storage} setStorage={setStorage} create />
	</Container>)
}
