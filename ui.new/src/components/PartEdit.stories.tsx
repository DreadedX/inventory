import { PartEdit } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import * as PartDetailStories from "./PartDetail.stories";
import { LoadingStatus } from "../lib/loading";
import { functions } from "lodash";

export default {
	title: "PartEdit",
	component: PartEdit,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof PartEdit>;

const Template: ComponentStory<typeof PartEdit> = (args) => <PartEdit {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	part: PartDetailStories.Normal.args?.part,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	functions: {
		onChange: () => {
			console.log("CHANGE");
		},
		onChangeStorage: () => {
			console.log("CHANGE_STORAGE");
		},
		onAddStorage: () => {
			console.log("ADD_STORAGE");
		},
		onAddUrl: () => {
			console.log("ADD_URL");
		},
		onRemoveUrl: () => {
			console.log("REMOVE_URL");
		},
	}
}

export const Empty = Template.bind({})
Empty.args = {
	part: models.Part.defaultValue(),
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	functions: Normal.args.functions
}

export const Attached = Template.bind({})
Attached.args = {
	part: Normal.args.part,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	functions: Normal.args.functions,
	attached: true
}

export const LoadingPart = Template.bind({})
LoadingPart.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true, options: false},
	functions: Normal.args.functions
}

export const LoadingOptions = Template.bind({})
LoadingOptions.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: true},
	functions: Normal.args.functions
}

export const Saving = Template.bind({})
Saving.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false, save: true},
	functions: Normal.args.functions
}
