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
	],
	argTypes: {
		onEdit: { action: "Input" },
		onEditDropdown: { action: "InputDropdown" },
		onAddStorage: { action: "AddStorage" }
	}
} as ComponentMeta<typeof PartEdit>;

const Template: ComponentStory<typeof PartEdit> = (args) => <PartEdit {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	part: PartDetailStories.Normal.args?.part,
	loading: LoadingStatus.defaultValue()
}

export const Empty = Template.bind({})
Empty.args = {
	part: models.Part.defaultValue(),
	loading: LoadingStatus.defaultValue()
}

export const Attached = Template.bind({})
Attached.args = {
	part: Normal.args.part,
	loading: LoadingStatus.defaultValue(),
	attached: true
}

export const LoadingPart = Template.bind({})
LoadingPart.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true}
}

export const LoadingOptions = Template.bind({})
LoadingOptions.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), options: true}
}

export const Saving = Template.bind({})
Saving.args = {
	part: undefined,
	loading: {...LoadingStatus.defaultValue(), save: true}
}
