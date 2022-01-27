import { FC, Fragment, useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Icon } from 'semantic-ui-react';
import { ModalQrScanner, useHasCamera } from '.';
import * as Label from "../handlers/label/label.pb";

export const Navigation: FC = () => {
	const [ scannerOpen, setScannerOpen ] = useState(false);
	const hasCamera = useHasCamera();

	const navigate = useNavigate();

	return (<Fragment>
		<ModalQrScanner open={scannerOpen} onCancel={() => setScannerOpen(false)} onScan={(id, type) => {
			switch (type) {
				case Label.Type.PART:
					navigate(`/part/${id.id}`)
					break

				case Label.Type.STORAGE:
					navigate(`/storage/${id.id}`)
					break

				default:
					return
			}

			setScannerOpen(false);
		}} />
		<Menu size="large">
			<Menu.Item as={NavLink} to="" exact="true">
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
