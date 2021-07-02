import { FC, useState, useEffect, MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'semantic-ui-react';
import { PartList, LoadingBox, StatusBox } from '../components';
import { request } from '../request';

interface Props {
	ws: MutableRefObject<WebSocket | undefined>
}

export const Parts: FC<Props> = ( { ws }: Props ) => {
	const [parts, setParts] = useState<ApiPart[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [status, setStatus] = useState<JSX.Element>();

	const update = () => {
		request<ApiPart[]>("v1/part/list")
			.then(response => {
				if (response.data) {
					setStatus(undefined);
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
	}

	useEffect(() => {
		update()
	}, []);

	useEffect(() => {
		if (ws.current)  {
			ws.current.onmessage = update;
		}

		return () => {
			if (ws.current) {
				ws.current.onmessage = null;
			}
		}
	}, [ws]);

	return (
			<Container style={{ margin: "3em" }}>
				{ status || <LoadingBox loading={ loading }>
					<PartList parts={ parts } />
				</LoadingBox>}
				<Button basic icon="add" as={Link} to="/part/create" floated="right" />
			</Container>
	);
};
