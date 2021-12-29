import { FC, Fragment, useState } from 'react';
import { NavLink } from "react-router-dom";
import { Menu, Icon } from 'semantic-ui-react';
import { ModalQrScanner, useHasCamera } from '.';

export const Navigation: FC = () => {
	const [ scannerOpen, setScannerOpen ] = useState(false);
	const hasCamera = useHasCamera();

	return (<Fragment>
		<ModalQrScanner open={scannerOpen} onCancel={() => setScannerOpen(false)} onScan={result => {
			console.log(result)
		}} />
		<Menu size="large">
			<Menu.Item as={NavLink} to="" exact={true}>
				<Icon name="home" />
			</Menu.Item>
			<Menu.Item as={NavLink} to="/part">
				Parts
			</Menu.Item>
			<Menu.Item as={NavLink} to="/storage">
				Storage
			</Menu.Item>
			{ hasCamera && <Menu.Item onClick={() => setScannerOpen(true)} position="right">
				<Icon name="qrcode" />
			</Menu.Item> }
		</Menu>
	</Fragment>);
};
