import { PartView } from ".//PartView";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

export default {
	title: "PartView",
	component: PartView,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof PartView>;

const Template: ComponentStory<typeof PartView> = (args) => <PartView {...args} />;

export const Loading = Template.bind({})
Loading.args = {
	part: undefined
}

export const LoadingMessage = Template.bind({})
LoadingMessage.args = {
	part: undefined,
	message: {
		severity: "error",
		icon: "times",
		header: "Failed to delete part",
		details: "Connection to server timed out"
	}
}

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
	}
}

export const NormalMessage = Template.bind({})
NormalMessage.args = {
	part: Normal.args.part,
	message: LoadingMessage.args.message
}
