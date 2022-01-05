import { FC } from "react";
import { Container } from "semantic-ui-react";
import { PartView, PartsView, StorageView, StoragesView, PartCreateView } from "./views";
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
					<Route path="create" element={<PartCreateView />} />
					<Route path=":id" element={<Outlet />}>
						<Route path="" element={<PartView />} />
						<Route path="edit" element={<PartView editing/>} />
					</Route>
				</Route>

				<Route path="storage" element={<Outlet />} >
					<Route path="" element={<StoragesView />} />
					<Route path=":id" element={<Outlet />}>
						<Route path="" element={<StorageView />} />
						<Route path="edit" element={<StorageView editing/>} />
					</Route>
				</Route>

				<Route path="*" element={<p>NOTHING HERE</p>}/>
			</Routes>
		</Container>
	</BrowserRouter>);
}

export default App;
