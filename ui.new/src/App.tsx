import { FC } from "react";
import { Container } from "semantic-ui-react";
import { PartView } from "./views";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import "semantic-ui-css/semantic.min.css"
import { QRScanner } from "./components";

const App: FC = () => {
	return (<BrowserRouter>
		<Container style={{ margin: "3em" }}>
			<Routes>
				<Route path="qr" element={<QRScanner />} />
				<Route path="part" element={<Outlet />} >
					<Route path="" element={<p>PART LIST</p>} />
					<Route path=":id" element={<Outlet />}>
						<Route path="" element={<PartView />} />
						<Route path="edit" element={<PartView editing/>} />
					</Route>
				</Route>

				<Route path="*" element={<p>NOTHING HERE</p>}/>
			</Routes>
		</Container>
	</BrowserRouter>);
}

export default App;
