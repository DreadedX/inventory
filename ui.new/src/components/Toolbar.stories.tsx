import { Toolbar } from "./Toolbar";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";

export default {
	title: "Toolbar",
	component: Toolbar,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof Toolbar>;

const Template: ComponentStory<typeof Toolbar> = (args) => <Toolbar {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	functions: [
		{
			icon: "print",
			on: () => console.log("PRINT"),
		},
		{
			icon: "edit",
			on: () => console.log("EDIT"),
		},
		{
			icon: "trash",
			on: () => console.log("TRASH"),
		}
	],
	name: "Resistor",
	loading: LoadingStatus.defaultValue()
}

export const Loading = Template.bind({})
Loading.args = {
	functions: Normal.args.functions,
	name: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true}
}
