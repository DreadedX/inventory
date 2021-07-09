import { FC, useState, useEffect } from 'react';
import { useParams, Switch, Route, useRouteMatch } from 'react-router-dom';
import { request } from '../request';
import { Container } from 'semantic-ui-react';
import { LoadingBox, StorageView, StorageEdit, StatusBox } from '../components';

interface Params {
	id: string
}

export const Storage: FC = () => {
	const { id } = useParams<Params>();
	const { path, url } = useRouteMatch();

	const [storage, setStorage] = useState<ApiStorage>();
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
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
	}, [id]);

	return (<Container style={{ margin: "3em" }}>
		{ status || <LoadingBox loading={ !storage }>
			<Switch>
				<Route exact path={path}>
					<StorageView storage={ storage as ApiStorage } edit={url + "/edit"} />
				</Route>
				<Route exact path={path + "/edit"}>
					<StorageEdit storage={ storage as ApiStorage } setStorage={setStorage}/>
				</Route>
			</Switch>
		</LoadingBox>}
	</Container>)
}
