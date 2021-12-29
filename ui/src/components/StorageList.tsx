import { FC, Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Segment, Message } from 'semantic-ui-react';
import { Storage } from '../models/models.pb';

interface ItemProps {
	storage: Storage
}

const Item: FC<ItemProps> = ({ storage }: ItemProps) => {
	const navigate = useNavigate();

	return (<Table.Row style={{cursor: 'pointer'}} warning={!storage?.partCount} onClick={() => navigate(`/storage/${storage?.id.id}`)}>
		<Table.Cell>
			{storage.name}
		</Table.Cell>
		<Table.Cell textAlign="center">
			{storage?.partCount || 0}
		</Table.Cell>
	</Table.Row>);
}

interface Props {
	storage: Storage[]
	loading: boolean
	attached?: boolean
};

export const StorageList: FC<Props> = ({ storage, loading, attached }: Props) => {
	const [noStorage, setNoStorage] = useState<boolean>(false)

	useEffect(() => {
		setNoStorage(!loading && storage?.length === 0)
	}, [storage, loading])

	return (<Fragment>
		<Table unstackable selectable attached={(attached || noStorage || loading) ? true : "bottom"}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={11}>Name</Table.HeaderCell>
					<Table.HeaderCell width={1} textAlign="center">#Parts</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{storage.map((s) => <Item key={s.id.id} storage={s} />)}
			</Table.Body>
		</Table>
		{ loading && <Segment style={{ height: "5em" }} loading={true} attached={(attached || noStorage) ? true : "bottom"} /> }
		{ noStorage && <Message attached={attached ? true : "bottom"} info icon="exclamation circle" header="No storage found!" /> }
	</Fragment>);
};
