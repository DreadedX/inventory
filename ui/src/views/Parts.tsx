import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'semantic-ui-react';
import { PartList, LoadingBox, StatusBox } from '../components';
import { request } from '../request';

export const Parts: FC = () => {
	const [parts, setParts] = useState<ApiPart[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
		request<ApiPart[]>("v1/part/list")
			.then(response => {
				if (response.data) {
					setParts(response.data)
				} else if (response.message) {
					setStatus(<StatusBox icon="question" message={ response.message }/>)
				}

				setLoading(false);
			}).catch(error => {
				console.error(error)
				setStatus(<StatusBox icon="times" message={ error.message }/>)
				setLoading(false);
			});
	}, []);

	return (
			<Container style={{ margin: "3em" }}>
				{ status || <LoadingBox loading={ loading }>
					<PartList parts={ parts } />
					<Button basic icon="add" as={Link} to="/part/create" floated="right" />
				</LoadingBox>}
			</Container>
	);
};
