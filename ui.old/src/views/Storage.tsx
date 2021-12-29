import { FC, useState, useEffect } from 'react';
import { useParams, Switch, Route, useRouteMatch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { LoadingBox, StorageView, StorageEdit, StatusBox } from '../components';
import { Fetch } from '../handlers/storage/storage.pb';
import { Storage as ModelStorage } from '../models/models.pb';

interface Params {
	id: string
}

export const Storage: FC = () => {
	const { id } = useParams<Params>();
	const { path, url } = useRouteMatch();

	const [storage, setStorage] = useState<ModelStorage>();
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
		Fetch({id: id}).then(resp => {
			setStorage(resp);
			setStatus(undefined)
		}).catch(e => {
			if (isTwirpError(e)) {
				const icon = e.code === "not_found" ? "question" : "times"
				setStatus(<StatusBox icon={ icon } message={ e.msg }/>)
			} else {
				console.error(e)
				setStatus(<StatusBox icon="times" message="Unknown error occured"/>)
			}
		})
	}, [id]);

	return (<Container style={{ margin: "3em" }}>
		{ status || <LoadingBox loading={ !storage }>
			<Switch>
				<Route exact path={path}>
					<StorageView storage={ storage as ModelStorage } edit={url + "/edit"} />
				</Route>
				<Route exact path={path + "/edit"}>
					<StorageEdit storage={ storage as ModelStorage } setStorage={setStorage}/>
				</Route>
			</Switch>
		</LoadingBox>}
	</Container>)
}
