import { FC, ReactNode, Fragment } from 'react';
import { Segment } from 'semantic-ui-react';

interface Props {
	loading: boolean
	children?: ReactNode
};

export const LoadingBox: FC<Props> = ({ loading, children }: Props) => {
	if (loading) {
		return (
			<Segment placeholder loading />
		);
	} else {
		return (<Fragment>
			{ children }
		</Fragment>);
	}
};
