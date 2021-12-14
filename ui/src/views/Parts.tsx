import { FC, useState, useEffect, ChangeEvent } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Container, Button, Input, Grid, Pagination, PaginationProps } from 'semantic-ui-react';
import { isTwirpError } from 'twirpscript/dist/runtime/error';
import { PartList, LoadingBox, StatusBox } from '../components';
import { FetchAll } from '../handlers/part/part.pb';
import { Part } from '../models/models.pb';

const useQuery = () => {
	return new URLSearchParams(useLocation().search)
}

const listLength = 10;

export const Parts: FC = () => {
	const query = useQuery();
	const history = useHistory();

	const [ parts, setParts ] = useState<Part[]>([]);
	const [ search, setSearch ] = useState(query.get("search") || "");
	const [ loading, setLoading ] = useState<boolean>(true);
	const [ searching, setSearching ] = useState<boolean>(false);
	const [ page, setPage ] = useState<number>(Number(query.get("page")) || 1);
	const [ status, setStatus ] = useState<JSX.Element>();

	useEffect(() => {
		FetchAll({}).then(resp => {
			setParts(resp.parts)
			setStatus(undefined)
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
			setSearching(false);
		})
	}, [search]);

	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearching(true);
		setSearch(event.target.value);
		history.replace({search: event.target.value ? "?search="+event.target.value : ""})
	}

	const handlePageChange = ({}, data: PaginationProps) => {
		setPage(Math.ceil(Number(data.activePage)) || 1)
		console.log(data.activePage)
	}

	return (
			<Container style={{ margin: "3em" }} textAlign="center">
				<Grid>
					<Grid.Column stretched computer={5} mobile={14}><Input icon="search" loading={searching} type="search" value={search} placeholder="Search..." onChange={handleSearch}/></Grid.Column>
					<Grid.Column floated="right"><Button style={{height: '100%'}} basic icon="add" as={Link} to="/part/create" floated="right" /></Grid.Column>
				</Grid>
				{ status || <LoadingBox loading={ loading }>
					<PartList parts={ parts.slice(listLength*(page-1), listLength*page) } />
					{ parts.length > listLength && <Pagination style={{ alignItems: 'center' }} activePage={page} totalPages={Math.ceil(parts.length / listLength)} onPageChange={handlePageChange} />}
				</LoadingBox>}
			</Container>
	);
};
