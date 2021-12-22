import { ModalDelete } from "./ModalDelete";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";

export default {
	title: "ModalDelete",
	component: ModalDelete,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof ModalDelete>;

const Template: ComponentStory<typeof ModalDelete> = (args) => <ModalDelete {...args} />;

export const Open = Template.bind({})
Open.args = {
	onConfirm: () => {
		console.log("CONFIRM")
	},
	onCancel: () => {
		console.log("CANCEL")
	}
}
