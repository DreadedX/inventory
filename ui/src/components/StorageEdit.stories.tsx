import { StorageEdit } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import * as StorageDetailStories from "./StorageDetail.stories";
import { LoadingStatus } from "../lib/loading";

export default {
	title: "StorageEdit",
	component: StorageEdit,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof StorageEdit>;

const Template: ComponentStory<typeof StorageEdit> = (args) => <StorageEdit {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	storage: StorageDetailStories.Normal.args?.storage,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	updateStorage: () => {
		console.log("Update storage")
	}
}

export const Empty = Template.bind({})
Empty.args = {
	storage: models.Storage.defaultValue(),
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	updateStorage: Normal.args.updateStorage
}

export const Attached = Template.bind({})
Attached.args = {
	storage: Normal.args.storage,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false},
	updateStorage: Normal.args.updateStorage,
	attached: true
}

export const LoadingPart = Template.bind({})
LoadingPart.args = {
	storage: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true, options: false},
	updateStorage: Normal.args.updateStorage
}

export const Saving = Template.bind({})
Saving.args = {
	storage: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: false, options: false, save: true},
	updateStorage: Normal.args.updateStorage
}
