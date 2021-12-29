import { ModalDiscard } from "./ModalDiscard";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";

export default {
	title: "Modal",
	component: ModalDiscard,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof ModalDiscard>;

const Template: ComponentStory<typeof ModalDiscard> = (args) => <ModalDiscard {...args} />;

export const Discard = Template.bind({})
Discard.args = {
	onConfirm: () => {
		console.log("CONFIRM")
	},
	onCancel: () => {
		console.log("CANCEL")
	}
}
