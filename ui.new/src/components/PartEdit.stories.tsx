import { PartEdit } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import * as PartDetailStories from "./PartDetail.stories";
import { LoadingStatus } from "../lib/loading";

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
	addStorage: (name, ) => {
		console.log(name)
	},
	updatePart: (part) => {
		console.log(part)
	}
}

export const Empty = Template.bind({})
Empty.args = {
	part: models.Part.defaultValue(),
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	addStorage: Normal.args.addStorage,
	updatePart: Normal.args.updatePart
}

export const Attached = Template.bind({})
Attached.args = {
	part: Normal.args.part,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	addStorage: Normal.args.addStorage,
	updatePart: Normal.args.updatePart,
	attached: true
}

export const LoadingPart = Template.bind({})
LoadingPart.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true, options: false},
	addStorage: Normal.args.addStorage,
	updatePart: Normal.args.updatePart
}

export const LoadingOptions = Template.bind({})
LoadingOptions.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: true},
	addStorage: Normal.args.addStorage,
	updatePart: Normal.args.updatePart
}

export const Saving = Template.bind({})
Saving.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false, save: true},
	addStorage: Normal.args.addStorage,
	updatePart: Normal.args.updatePart
}
