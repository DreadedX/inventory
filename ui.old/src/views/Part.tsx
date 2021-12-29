import { FC, useState, useEffect } from 'react';
import { useParams, Switch, Route, useRouteMatch } from 'react-router';
import { Container } from 'semantic-ui-react';
import { LoadingBox, PartView, PartEdit, StatusBox } from '../components';
import { Part as ModelPart } from '../models/models.pb';
import { Fetch } from '../handlers/part/part.pb';
import { isTwirpError } from 'twirpscript/dist/runtime/error';

interface Params {
	id: string
}

export const Part: FC = () => {
	const { id } = useParams<Params>();
	const { path, url } = useRouteMatch();

	const [part, setPart] = useState<ModelPart>();
	const [status, setStatus] = useState<JSX.Element>();

	useEffect(() => {
		Fetch({id: id}).then(resp => {
			setPart(resp)
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
		{ status || <LoadingBox loading={ !part }>
			<Switch>
				<Route exact path={path}>
					<PartView part={ part as ModelPart } edit={url + "/edit"} />
				</Route>
				<Route exact path={path + "/edit"}>
					<PartEdit part={ part as ModelPart} setPart={setPart}/>
				</Route>
			</Switch>
		</LoadingBox>}
	</Container>)
}
