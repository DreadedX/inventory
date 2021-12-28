import { FC } from "react";
import { Container } from "semantic-ui-react";
import { PartView, PartsView } from "./views";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import "semantic-ui-css/semantic.min.css"
import { Navigation } from "./components";

const App: FC = () => {
	return (<BrowserRouter>
		<Navigation />
		<Container style={{ margin: "3em" }}>
			<Routes>
				<Route path="part" element={<Outlet />} >
					<Route path="" element={<PartsView />} />
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
