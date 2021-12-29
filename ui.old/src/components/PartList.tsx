import { FC } from 'react';
import { useHistory } from "react-router-dom";
import { Table } from 'semantic-ui-react';
import TextTruncate from 'react-text-truncate';
import { Part } from '../models/models.pb';

interface Props {
	parts: Part[]
	storage?: boolean
};

interface ItemProps {
	part: Part
	storage: boolean
}

const Item: FC<ItemProps> = ({ part, storage }) => {
	const history = useHistory();

	const handleClick = () => {
		history.push("/part/" + part.id.id)
	};

	return (<Table.Row style={{cursor: 'pointer'}} negative={!part.quantity} onClick={handleClick}>
		<Table.Cell>
			{part.name}
		</Table.Cell>
		<Table.Cell>
			<TextTruncate text={part.description} />
		</Table.Cell>
		{!storage && <Table.Cell>
			{part.storage?.name}
		</Table.Cell>}
		<Table.Cell>
			{part.quantity}
		</Table.Cell>
		<Table.Cell>
			{part.footprint}
		</Table.Cell>
	</Table.Row>);
}

export const PartList: FC<Props> = ({ parts, storage=false }: Props) => {
	return (
		<Table unstackable selectable attached={storage ? "bottom" : undefined}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={4}>Name</Table.HeaderCell>
					<Table.HeaderCell>Description</Table.HeaderCell>
					{!storage && <Table.HeaderCell width={2}>Storage</Table.HeaderCell>}
					<Table.HeaderCell width={1}>Quantity</Table.HeaderCell>
					<Table.HeaderCell width={2}>Footprint</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{parts.map((part) => <Item key={part.id.id} part={part} storage={storage} />)}
			</Table.Body>
		</Table>
	);
};
