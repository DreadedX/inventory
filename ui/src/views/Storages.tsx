import { FC, useState, useEffect, MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Grid } from 'semantic-ui-react';
import { StorageList, LoadingBox, StatusBox } from '../components';
import { request } from '../request';

interface Props {
	ws: MutableRefObject<WebSocket | undefined>
}

export const Storages: FC<Props> = ({ ws }: Props) => {
	const [storage, setStorage] = useState<ApiStorage[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [status, setStatus] = useState<JSX.Element>();

	const update = () => {
		request<ApiStorage[]>("v1/storage/list")
			.then(response => {
				if (response.data) {
					setStatus(undefined);
					setStorage(response.data);
				} else if (response.message) {
					setStatus(<StatusBox icon="question" message={ response.message }/>);
				}

				setLoading(false);
			}).catch(error => {
				console.error(error)
				setLoading(false);
				setStatus(<StatusBox icon="times" message={ error.message }/>)
			});
	}

	useEffect(update, []);

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
				<Grid>
					<Grid.Column floated="right"><Button style={{height: '100%'}} basic icon="add" as={Link} to="/storage/create" floated="right" /></Grid.Column>
				</Grid>
				{ status || <LoadingBox loading={ loading }>
					<StorageList storage={ storage }/>
				</LoadingBox>}
			</Container>
	);
};
