import { FC } from 'react';
import { NavLink } from "react-router-dom";
import { Container, Menu, Icon } from 'semantic-ui-react';

export const Navigation: FC = () => {
	return (<Menu>
		<Container>
			<Menu.Item as={NavLink} to="" exact={true}>
				<Icon name="home" />
			</Menu.Item>
			<Menu.Item as={NavLink} to="/scan">
				Scan
			</Menu.Item>
			<Menu.Item as={NavLink} to="/part">
				Parts
			</Menu.Item>
			<Menu.Item as={NavLink} to="/storage">
				Storage
			</Menu.Item>
		</Container>
	</Menu>);
};
