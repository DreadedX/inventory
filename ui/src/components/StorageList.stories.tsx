import { StorageList } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import * as models from "../models/models.pb";

import { LoadingStatus } from "../lib/loading";

export default {
	title: "StorageList",
	component: StorageList,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof StorageList>;

const Template: ComponentStory<typeof StorageList> = (args) => <StorageList {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	storage: [{
		id: {
			id: "EJKS4JhLEvk8oHH2Cge9Tm"
		},
		name: "bla",
		parts: [
			{
				id: {
					id: "TvQUdCrfjUj6hKepmAvacT"
				},
				name: "Capacitor",
				description: "30 pF",
				footprint: "0603",
				quantity: 9,
				storageId: {
					id: "EJKS4JhLEvk8oHH2Cge9Tm"
				},
				links: []
			},
			{
				id: {
					id: "T7NLzUJyJkmAd9JfWwKdz6"
				},
				name: "Hex Inverter",
				description: "SN74HC04N",
				footprint: "PDIP-14",
				quantity: 10,
				storageId: {
					id: "EJKS4JhLEvk8oHH2Cge9Tm"
				},
				links: []
			}
		],
		partCount: 2
	}],
	loading: false
}

export const Empty = Template.bind({})
Empty.args = {
	storage: [],
	loading: false
}

export const Loading = Template.bind({})
Loading.args = {
	storage: [],
	loading: true
}
