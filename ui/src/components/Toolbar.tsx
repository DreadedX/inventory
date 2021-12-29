import { ChangeEvent, FC, ReactNode } from "react";
import { Icon, Input, Menu, InputOnChangeData } from "semantic-ui-react";
import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";
import { LoadingStatus } from "../lib/loading";

export interface ToolbarFunction {
	icon: SemanticICONS
	on: () => void
}

interface BaseProps {
	functions: ToolbarFunction[]
	loading: LoadingStatus
	children?: ReactNode
}

const ToolbarBase: FC<BaseProps> = ({functions, loading, children}: BaseProps) => {
	return (<Menu attached="top" size="large" text>
		{children}

		{functions.map((fn, index) => {
			const Item = <Menu.Item key={index} position={(index === 0 && "right") || undefined} onClick={fn.on} disabled={loading.fetch || loading.save || loading.delete}>
				<Icon name={fn.icon} />
			</Menu.Item>

			return Item
		})}
	</Menu>)
}

interface Props {
	name: string | undefined
}

export const Toolbar: FC<Props & BaseProps> = ({ name, functions, loading}: Props & BaseProps) => {
	return (<ToolbarBase functions={functions} loading={loading} >
		<Menu.Item header style={{marginLeft: '0.5em'}}>
			{ (loading.fetch && "...") || name }
		</Menu.Item>
	</ToolbarBase>)
}

interface SearchProps {
	onSearch: (query: string) => void
}

export const ToolbarSearch: FC<SearchProps & BaseProps> = ({ onSearch, functions, loading }: SearchProps & BaseProps) => {

	const onChange = (_event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
		onSearch(data.value)
	}

	return (<ToolbarBase functions={functions} loading={loading} >
		<Menu.Menu style={{ marginLeft: "1rem", marginRight: "1rem", width: "100%" }} width={12}>
			<Input disabled={loading.fetch || loading.save || loading.delete} style={{width: "100%"}} transparent icon="search" iconPosition="left" placeholder="Seach parts..." onChange={onChange} />
		</Menu.Menu>
	</ToolbarBase>)
}
