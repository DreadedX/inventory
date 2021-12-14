import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { PartEdit } from '../components';
import { Part, Storage } from '../models/models.pb';

interface Params {
	id: string
}

export const PartCreate: FC = () => {
	const { id } = useParams<Params>();

	const [part, setPart] = useState<Part>({
		...Part.defaultValue(),
		storageId: {
			id: id
		}
	});

	return (<Container style={{ margin: "3em" }}>
		<PartEdit part={part} setPart={setPart} create />
	</Container>)
}
