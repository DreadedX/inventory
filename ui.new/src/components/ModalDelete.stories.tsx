import { ModalDelete } from "./ModalDelete";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";

export default {
	title: "Modal",
	component: ModalDelete,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof ModalDelete>;

const Template: ComponentStory<typeof ModalDelete> = (args) => <ModalDelete {...args} />;

export const DeleteLoading = Template.bind({})
DeleteLoading.args = {
	open: true,
	deleting: true,
	onConfirm: () => {
		console.log("CONFIRM")
	},
	onCancel: () => {
		console.log("CANCEL")
	}
}

export const Delete = Template.bind({})
Delete.args = {
	open: true,
	deleting: false,
	onConfirm: DeleteLoading.args.onConfirm,
	onCancel: DeleteLoading.args.onCancel,
}
