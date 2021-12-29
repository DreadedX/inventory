import { FC } from "react"
import { Header, Icon, Segment } from "semantic-ui-react"

export const NotFound: FC = () => {
	return (<Segment placeholder>
		<Header icon>
			<Icon name={"question"} />
			Not Found
		</Header>
	</Segment>)
}
