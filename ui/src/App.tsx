import { FC } from 'react';
import { Header } from 'semantic-ui-react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Scan, Parts, Part, PartCreate, Storages, Storage, StorageCreate, NotFound } from './views'
import { Navigation } from './components'

import 'semantic-ui-css/semantic.min.css';

const App: FC = () => {

	return (
		<BrowserRouter>
			<Navigation />
			<Switch>
				<Route path="/" exact>
					<Header as="h1" textAlign="center" style={{marginTop: '1.5em'}}>Welcome to my parts inventory!</Header>
				</Route>
				<Route path="/scan" component={Scan} />
				<Route path="/part" exact component={Parts} />
				<Route path={["/part/create", "/part/create/:id"]} exact component={PartCreate} />
				<Route path="/part/:id" component={Part} />
				<Route path="/storage" exact component={Storages} />
				<Route path="/storage/create" exact component={StorageCreate} />
				<Route path="/storage/:id" component={Storage} />
				<Route component={NotFound} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;
