import { PartEdit } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import * as PartDetailStories from "./PartDetail.stories";

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
	loading: false
}

export const Empty = Template.bind({})
Empty.args = {
	part: models.Part.defaultValue(),
	loading: false
}

export const Attached = Template.bind({})
Attached.args = {
	part: Normal.args.part,
	loading: false,
	attached: true
}

export const Loading = Template.bind({})
Loading.args = {
	part: undefined,
	loading: true,
	loadingAvailableStorage: true
}
