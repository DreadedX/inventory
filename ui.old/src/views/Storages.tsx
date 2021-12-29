import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Grid } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { StorageList, LoadingBox, StatusBox } from '../components';
import { FetchAll } from '../handlers/storage/storage.pb';
import { Storage } from '../models/models.pb';

export const Storages: FC = () => {
	const [storage, setStorage] = useState<Storage[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
		FetchAll({}).then(resp => {
			setStorage(resp.storages);
			setStatus(undefined);
		}).catch(e => {
			if (isTwirpError(e)) {
				const icon = e.code === "not_found" ? "question" : "times"
				setStatus(<StatusBox icon={ icon } message={ e.msg }/>)
			} else {
				console.error(e)
				setStatus(<StatusBox icon="times" message="Unknown error occured"/>)
			}
		}).finally(() => {
			setLoading(false);
		})
	}, []);

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
