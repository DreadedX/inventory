import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { PartEdit } from '../components';

interface Params {
	id: string
}

export const PartCreate: FC = () => {
	const { id } = useParams<Params>();

	const [part, setPart] = useState<ApiPart>({
		id: "",
		name: "",
		description: "",
		footprint: "",
		quantity: 0,
		storage: {
			id: id || "",
			name: ""
		}
	});

	return (<Container style={{ margin: "3em" }}>
		<PartEdit part={part} setPart={setPart} create />
	</Container>)
}
