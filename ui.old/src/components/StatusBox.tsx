import { FC } from 'react';
import { Segment, Header, Icon, SemanticICONS } from 'semantic-ui-react';

interface Props {
	icon: SemanticICONS
	message: string
}

export const StatusBox: FC<Props> = ({ icon, message }: Props) => {
	return (
		<Segment placeholder>
			<Header icon>
				<Icon name={ icon } />
				{ message }
			</Header>
		</Segment>
	)
}
