import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'semantic-ui-react';
import { StorageList, LoadingBox, StatusBox } from '../components';
import { request } from '../request';

export const Storages: FC = () => {
	const [storage, setStorage] = useState<ApiStorage[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
		request<ApiStorage[]>("v1/storage/list")
			.then(response => {
				if (response.data) {
					setStorage(response.data)
				} else if (response.message) {
					setStatus(<StatusBox icon="question" message={ response.message }/>)
				}

				setLoading(false);
			}).catch(error => {
				console.error(error)
				setLoading(false);
				setStatus(<StatusBox icon="times" message={ error.message }/>)
			});
	}, []);

	return (
			<Container style={{ margin: "3em" }}>
				{ status || <LoadingBox loading={ loading }>
					<StorageList storage={ storage }/>
					<Button basic icon="add" as={Link} to="/storage/create" floated="right" />
				</LoadingBox>}
			</Container>
	);
};
