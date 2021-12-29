import { StorageDetail } from ".";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Container } from "semantic-ui-react";
import { LoadingStatus } from "../lib/loading";
import * as models from "../models/models.pb";

export default {
	title: "StorageDetail",
	component: StorageDetail,
	decorators: [
		(Story) => (<Container>
			{Story()}
		</Container>)
	]
} as ComponentMeta<typeof StorageDetail>;

const Template: ComponentStory<typeof StorageDetail> = (args) => <StorageDetail {...args} />;

export const Normal = Template.bind({})
Normal.args = {
	storage: {
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
		partCount: 0
	},
	loading: {...LoadingStatus.defaultValue(), fetch: false}
}

export const Empty = Template.bind({})
Empty.args = {
	storage: models.Storage.defaultValue(),
	loading: {...LoadingStatus.defaultValue(), fetch: false}
}

export const NormalAttached = Template.bind({})
NormalAttached.args = {
	storage: Normal.args.storage,
	loading: {...LoadingStatus.defaultValue(), fetch: false},
	attached: true
}

export const Loading = Template.bind({})
Loading.args = {
	storage: undefined,
	loading: {...LoadingStatus.defaultValue(), fetch: true}
}

export const Delete = Template.bind({})
Delete.args = {
	storage: Normal.args.storage,
	loading: {...LoadingStatus.defaultValue(), delete: true}
}
