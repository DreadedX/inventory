import { FC, useRef, useEffect } from 'react';
import { Header } from 'semantic-ui-react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Scan, Parts, Part, PartCreate, Storages, Storage, StorageCreate, NotFound } from './views'
import { Navigation } from './components'

import 'semantic-ui-css/semantic.min.css';

const App: FC = () => {
	const ws = useRef<WebSocket>()

	useEffect(() => {
		ws.current = new WebSocket("ws://localhost:8080/ws");
		ws.current.onopen = () => console.log("ws opened");
		ws.current.onclose = () => console.log("ws closed");

		ws.current.onmessage = () => {
		};

		return () => {
			ws.current?.close();
		}
	}, [])


	return (
		<BrowserRouter>
			<Navigation />
			<Switch>
				<Route path="/" exact>
					<Header as="h1" textAlign="center" style={{marginTop: '1.5em'}}>Welcome to my parts inventory!</Header>
				</Route>
				<Route path="/scan" component={Scan} />
				<Route path="/part" exact><Parts ws={ws} /></Route>
				<Route path={["/part/create", "/part/create/:id"]} exact component={PartCreate} />
				<Route path="/part/:id" ><Part ws={ws} /></Route>
				<Route path="/storage" exact><Storages ws={ws} /></Route>
				<Route path="/storage/create" exact component={StorageCreate} />
				<Route path="/storage/:id"><Storage ws={ws} /></Route>
				<Route component={NotFound} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;
