import { NotFound } from "./NotFound";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";

export default {
	title: "NotFound",
	component: NotFound,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof NotFound>;

export const Normal: ComponentStory<typeof NotFound> = () => <NotFound />;
