import { FC, useState, useEffect, MutableRefObject } from 'react';
import { useParams, Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { request } from '../request';
import { Container, Button } from 'semantic-ui-react';
import { LoadingBox, StorageView, StorageEdit, StatusBox } from '../components';

interface Params {
	id: string
}

interface Props {
	ws: MutableRefObject<WebSocket | undefined>
}

export const Storage: FC<Props> = ({ ws }: Props) => {
	const { id } = useParams<Params>();
	const { path, url } = useRouteMatch();

	const [storage, setStorage] = useState<ApiStorage>();
	const [status, setStatus] = useState<JSX.Element>();

	const update = (id: string) => {
		request<ApiStorage>("/v1/storage/get/" + id)
			.then(response => {
				if (response.data) {
					setStatus(undefined)
					setStorage(response.data);
				} else if (response.message) {
					setStatus(<StatusBox icon="question" message={ response.message }/>)
				}
			}).catch(error => {
				console.error(error)
				setStatus(<StatusBox icon="times" message={ error.message }/>)
			});
	};

	useEffect(() => {
		update(id);
	}, [id]);

	useEffect(() => {
		if (ws.current)  {
			ws.current.onmessage = () => {
				// @todo If the user is in edit mode, show a warning if the part has changed
				update(id)
			};
		}

		return () => {
			if (ws.current) {
				ws.current.onmessage = null;
			}
		}
	}, [ws, id]);

	return (<Container style={{ margin: "3em" }}>
		{ status || <LoadingBox loading={ !storage }>
			<Switch>
				<Route exact path={path}>
					<StorageView storage={ storage as ApiStorage } edit={url + "/edit"} />
					<Button basic icon="add" as={Link} to={"/part/create/" + id} floated="right" />
				</Route>
				<Route exact path={path + "/edit"}>
					<StorageEdit storage={ storage as ApiStorage } setStorage={setStorage}/>
				</Route>
			</Switch>
		</LoadingBox>}
	</Container>)
}
