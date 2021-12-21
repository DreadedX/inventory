import { FC } from "react";
import { Container } from "semantic-ui-react";
import { PartView } from "./views";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "semantic-ui-css/semantic.min.css"

const App: FC = () => {
	return (<BrowserRouter>
		<Container style={{ margin: "3em" }}>
			<Routes>
				<Route path="part" element={<p>PART LIST</p>} />
				<Route path="part/:id" element={<PartView />} />
				<Route path="*" element={<p>NOTHING HERE</p>}/>
			</Routes>
		</Container>
	</BrowserRouter>);
}

export default App;
