import { FC, useState, useEffect, MutableRefObject, ChangeEvent } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Container, Button, Input, Grid } from 'semantic-ui-react';
import { PartList, LoadingBox, StatusBox } from '../components';
import { request } from '../request';

interface Props {
	ws: MutableRefObject<WebSocket | undefined>
}

const useQuery = () => {
	return new URLSearchParams(useLocation().search)
}

export const Parts: FC<Props> = ( { ws }: Props ) => {
	const query = useQuery();
	const history = useHistory();

	const [parts, setParts] = useState<ApiPart[]>([]);
	const [ search, setSearch ] = useState(query.get("search") || "");
	const [ loading, setLoading ] = useState<boolean>(true);
	const [ searching, setSearching ] = useState<boolean>(false);
	const [status, setStatus] = useState<JSX.Element>();

	const update = (search: string) => {
		request<ApiPart[]>("v1/part/list/" + search)
			.then(response => {
				if (response.data) {
					setStatus(undefined);
					setParts(response.data);
				} else if (response.message) {
					setStatus(<StatusBox icon="question" message={ response.message }/>)
				}

				setLoading(false);
				setSearching(false);
			}).catch(error => {
				console.error(error)
				setStatus(<StatusBox icon="times" message={ error.message }/>)
				setLoading(false);
				setSearching(false);
			});
	}

	useEffect(() => {
		update(search)
	}, [search]);

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearching(true);
		setSearch(event.target.value);
		history.replace({search: event.target.value ? "?search="+event.target.value : ""})
	}

	useEffect(() => {
		if (ws.current)  {
			ws.current.onmessage = () => {
				update(search);
			}
		}

		return () => {
			if (ws.current) {
				ws.current.onmessage = null;
			}
		}
	}, [ws, search]);

	return (
			<Container style={{ margin: "3em" }}>
				<Grid>
					<Grid.Column width={14}><Input style={{ width: '100%' }} icon="search" loading={searching} type="search" value={search} placeholder="Search..." onChange={handleSearch}/></Grid.Column>
					<Grid.Column width={2}><Button style={{ height: '100%' }} basic icon="add" as={Link} to="/part/create" floated="right" /></Grid.Column>
				</Grid>
				{ status || <LoadingBox loading={ loading }>
					<PartList parts={ parts } />
				</LoadingBox>}
			</Container>
	);
};
