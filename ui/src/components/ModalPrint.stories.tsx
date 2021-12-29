import { ModalPrint } from "./ModalPrint";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";

export default {
	title: "Modal",
	component: ModalPrint,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof ModalPrint>;

const Template: ComponentStory<typeof ModalPrint> = (args) => <ModalPrint {...args} />;

export const PrintLoadingPreview = Template.bind({})
PrintLoadingPreview.args = {
	open: true,
	onConfirm: () => {
		console.log("CONFIRM")
	},
	onCancel: () => {
		console.log("CANCEL")
	},
}

export const PrintLoading = Template.bind({})
PrintLoading.args = {
	open: true,
	preview: "http://www.gravatar.com/avatar/098f6b4d73dfb003e498e0bf878c6634",
	printing: true,
	onConfirm: PrintLoadingPreview.args.onConfirm,
	onCancel: PrintLoadingPreview.args.onCancel
}

export const Print = Template.bind({})
Print.args = {
	open: true,
	preview: PrintLoading.args.preview,
	onConfirm: PrintLoadingPreview.args.onConfirm,
	onCancel: PrintLoadingPreview.args.onCancel
}
