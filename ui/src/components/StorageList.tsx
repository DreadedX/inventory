import { FC } from 'react';
import { useHistory } from "react-router-dom";
import { Table } from 'semantic-ui-react';

interface Props {
	storage: ApiStorage[]
};

interface ItemProps {
	storage: ApiStorage
}

const Item: FC<ItemProps> = ({ storage }: ItemProps) => {
	const history = useHistory();

	const handleClick = () => {
		history.push("/storage/" + storage.id)
	};

	return (<Table.Row style={{cursor: 'pointer'}} warning={!storage?.partCount} onClick={handleClick}>
		<Table.Cell>
			{storage.name}
		</Table.Cell>
		<Table.Cell textAlign="center">
			{storage?.partCount || 0}
		</Table.Cell>
	</Table.Row>);
}

export const StorageList: FC<Props> = ({ storage }: Props) => {
	return (
		<Table unstackable selectable width={2}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={11}>Name</Table.HeaderCell>
					<Table.HeaderCell width={1} textAlign="center">#Parts</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{storage.map((s) => <Item key={s.id} storage={s} />)}
			</Table.Body>
		</Table>
	);
};
