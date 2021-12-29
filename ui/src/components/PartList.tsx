import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Message, Segment, Table } from "semantic-ui-react";
import TextTruncate from "react-text-truncate";
import * as models from "../models/models.pb";

interface ItemProps {
	part: models.Part
	showStorage: boolean
}

const Item: FC<ItemProps> = ({ part, showStorage }: ItemProps) => {
	const navigate = useNavigate();

	return (<Table.Row style={{cursor: 'pointer'}} warning={!part.quantity} onClick={() => navigate(`/part/${part?.id.id}`)}>
		<Table.Cell>{part.name}</Table.Cell>
		<Table.Cell><TextTruncate line={2} text={part.description}></TextTruncate></Table.Cell>
		<Table.Cell>{part.footprint}</Table.Cell>
		<Table.Cell textAlign="right">{part.quantity}</Table.Cell>
		{showStorage && <Table.Cell textAlign="right">{part.storage?.name}</Table.Cell>}
	</Table.Row>)
}

interface Props {
	parts: models.Part[]
	loading: boolean
	showStorage?: boolean
	attached?: boolean
}

export const PartList: FC<Props> = ({ parts, loading, showStorage, attached }) => {
	const [noParts, setNoParts] = useState<boolean>(false)

	useEffect(() => {
		setNoParts(!loading && parts?.length === 0)
	}, [parts, loading])

	return (<Fragment>
		<Table unstackable selectable attached={(attached || noParts || loading) ? true : "bottom"}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={4}>Name</Table.HeaderCell>
					<Table.HeaderCell>Description</Table.HeaderCell>
					<Table.HeaderCell width={2}>Footprint</Table.HeaderCell>
					<Table.HeaderCell width={1}>Quantity</Table.HeaderCell>
					{showStorage && <Table.HeaderCell width={2}>Storage</Table.HeaderCell>}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{ parts.map((part, index) => <Item key={index} part={part} showStorage={showStorage || false} />) }
			</Table.Body>
		</Table>
		{ loading && <Segment style={{ height: "5em" }} loading={true} attached={(attached || noParts) ? true : "bottom"} /> }
		{ noParts && <Message attached={attached ? true : "bottom"} info icon="exclamation circle" header="No parts found!" /> }
	</Fragment>)
}
