import { FC, useState, useEffect, MutableRefObject } from 'react';
import { useParams, Switch, Route, useRouteMatch } from 'react-router';
import { request } from '../request';
import { Container } from 'semantic-ui-react';
import { LoadingBox, PartView, PartEdit, StatusBox } from '../components';

interface Params {
	id: string
}

interface Props {
	ws: MutableRefObject<WebSocket | undefined>
}

export const Part: FC<Props> = ({ ws }: Props) => {
	const { id } = useParams<Params>();
	const { path, url } = useRouteMatch();

	const [part, setPart] = useState<ApiPart>();
	const [status, setStatus] = useState<JSX.Element>();

	const update = (id: string) => {
		request<ApiPart>("/v1/part/get/" + id)
			.then(response => {
				if (response.data) {
					setStatus(undefined)
					setPart(response.data);
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
		{ status || <LoadingBox loading={ !part }>
			<Switch>
				<Route exact path={path}>
					<PartView part={ part as ApiPart } edit={url + "/edit"} />
				</Route>
				<Route exact path={path + "/edit"}>
					<PartEdit part={ part as ApiPart } setPart={setPart}/>
				</Route>
			</Switch>
		</LoadingBox>}
	</Container>)
}
