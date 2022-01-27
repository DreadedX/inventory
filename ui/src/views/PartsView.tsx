import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { ErrorMessage, handleError } from "../lib/error";

import * as models from "../models/models.pb";
import * as Part from "../handlers/part/part.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { PartList } from "../components";
import { LoadingStatus } from "../lib/loading";
import { ToolbarSearch, ToolbarFunction } from "../components/Toolbar";
import { Icon, Message, Pagination, PaginationProps } from "semantic-ui-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useImmer } from "use-immer";

export const PartsView: FC = () => {
	const [ parts, setParts ] = useState<models.Part[]>([]);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ loading, setLoading ] = useImmer<LoadingStatus>(LoadingStatus.defaultValue());

	const [ searchParams, setSearchParams ] = useSearchParams();

	const navigate = useNavigate();
	const search = searchParams.get("search") || ""
	const page = Number(searchParams.get("page")) || 1

	useEffect(() => {
		setParts([])
		setMessage(undefined)
		setLoading(draft => {draft.fetch = true})

		Part.FetchAll({query: search}).then(resp => {
			setParts(resp.parts)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				// Let the PartList deal with having no parts
				return true;
			}
			return false;
		})).finally(() => {
			setLoading(draft => { draft.fetch = false })
		})
	}, [search]);

	const toolbar: ToolbarFunction[] = [
		{
			icon: "plus",
			on: () => {
				navigate("create");
			},
		}
	]

	// @TODO What if the responses are out of order?
	// Also the loading icon dispears after the first request comes back, even if we are still loading stuff
	const onSearch = (query: string) => {
		setMessage(undefined)

		// Reset the page when we search
		setSearchParams({search: query}, {replace: true})
		setLoading(draft => {draft.search = true})

		Part.FetchAll({query}).then(resp => {
			setParts(resp.parts)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setParts([])
				return true;
			}
			return false;
		})).finally(() => {
			setLoading(draft => {draft.search = false})
		})
	}

	const onPageChange = ({}, data: PaginationProps) => {
		setSearchParams({page: data.activePage?.toString() || "1", search: search}, {replace: true})
	}

	const totalPages = useMemo(() => Math.ceil(parts.length / 10), [parts])

	return (<Fragment>
		<ToolbarSearch onSearch={onSearch} hint="Search part..." loading={{...loading, fetch: false}} functions={toolbar} value={search} />
		<div style={{height: "720px"}}>
			<PartList parts={parts.slice((page-1)*10, page*10)} loading={loading.fetch} showStorage attached={message !== undefined}/>
			{ message && <Message onDismiss={() => setMessage(undefined)} attached="bottom" info={message.severity === "info"} warning={message.severity === "warning"} error={message.severity === "error"} success={message.severity === "success"} header={message.header} content={message.details} icon={message.icon} /> }
		</div>
		{ totalPages > 1 &&
			<div style={{textAlign: "center", position: "relative" }}>
				<Pagination
					siblingRange={1}
					activePage={page}
					totalPages={totalPages}
					firstItem={{ content: <Icon name="backward" />, icon: true }}
					lastItem={{ content: <Icon name="forward" />, icon: true }}
					prevItem={{ content: <Icon name="triangle left" />, icon: true }}
					nextItem={{ content: <Icon name="triangle right" />, icon: true }}
					secondary pointing
					onPageChange={onPageChange}
				/>
			</div>
		}
	</Fragment>)
}
