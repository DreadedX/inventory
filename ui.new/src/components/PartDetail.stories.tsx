import { PartDetail } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import * as ToolbarStories from "./Toolbar.stories";

export default {
	title: "PartDetail",
	component: PartDetail,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof PartDetail>;

const Template: ComponentStory<typeof PartDetail> = (args) => <PartDetail {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	part: {
		...models.Part.defaultValue(),
		name: "Resistor",
		description: " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse pretium, ex id pulvinar volutpat, urna magna pretium diam, eget consectetur eros ipsum at nisi. Suspendisse eleifend elit sit amet ipsum gravida congue. Duis sed maximus diam. Aenean hendrerit ante quis elementum fermentum. Vestibulum gravida nunc est. Nullam id mauris tempus, lacinia arcu a, elementum dui. Proin sodales rutrum justo. Curabitur viverra libero suscipit arcu congue porttitor. Nunc nec ullamcorper sapien. Suspendisse potenti. Donec aliquet, mauris ac dapibus pretium, nibh nibh mattis justo, vitae mollis erat tortor eu justo. Praesent quis lacinia risus, quis maximus ipsum. Maecenas vel dui vitae mauris pulvinar feugiat a quis risus. ",
		footprint: "THT",
		quantity: 10,
		storage: {
			...models.Storage.defaultValue(),
			name: "b01-a4"
		},
		links: [
			{
				...models.Link.defaultValue(),
				url: "google.com"
			},
			{
				...models.Link.defaultValue(),
				url: "tweakers.net"
			},
			{
				...models.Link.defaultValue(),
				url: "huizinga.dev"
			}
		]
	},
	loading: false
}

export const Empty = Template.bind({})
Empty.args = {
	part: models.Part.defaultValue(),
	loading: false,
}

export const NormalAttached = Template.bind({})
NormalAttached.args = {
	part: Normal.args.part,
	loading: false,
	attached: true
}

export const Loading = Template.bind({})
Loading.args = {
	part: undefined,
	loading: true
}

export const LoadingAttached = Template.bind({})
LoadingAttached.args = {
	part: undefined,
	loading: true,
	attached: true
}
