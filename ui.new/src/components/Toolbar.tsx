import { FC } from "react";
import { Icon, Menu } from "semantic-ui-react";
import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";
import { LoadingStatus } from "../lib/loading";

export interface ToolbarFunction {
	icon: SemanticICONS
	on: () => void
}

interface Props {
	name: string | undefined
	functions: ToolbarFunction[]
	loading: LoadingStatus
}

export const Toolbar: FC<Props> = ({ name, functions, loading }: Props) => {
	return (<Menu attached="top" size="large" text>
		<Menu.Item header style={{marginLeft: '0.5em'}}>
			{ (loading.fetch && "...") || name }
		</Menu.Item>
		{functions.map((fn, index) => {
			return (<Menu.Item position={(index === 0 && "right") || undefined} onClick={fn.on} disabled={loading.fetch || loading.save || loading.delete} key={index}>
				<Icon name={fn.icon} />
			</Menu.Item>)
		})}
	</Menu>)
}
