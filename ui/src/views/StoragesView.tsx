import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { ErrorMessage, handleError } from "../lib/error";

import * as models from "../models/models.pb";
import * as Storage from "../handlers/storage/storage.pb";
import { TwirpError } from "twirpscript/dist/runtime/error";
import { StorageList } from "../components";
import { LoadingStatus } from "../lib/loading";
import { ToolbarSearch, ToolbarFunction } from "../components/Toolbar";
import { Icon, Message, Pagination, PaginationProps } from "semantic-ui-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const StoragesView: FC = () => {
	const [ storage, setStorage ] = useState<models.Storage[]>([]);
	const [ message, setMessage ] = useState<ErrorMessage>();

	const [ loading, setLoading ] = useState<LoadingStatus>(LoadingStatus.defaultValue());

	const [ searchParams, setSearchParams ] = useSearchParams();

	const navigate = useNavigate();
	const search = searchParams.get("search") || ""
	const page = Number(searchParams.get("page")) || 1

	useEffect(() => {
		setStorage([])
		setMessage(undefined)
		setLoading({...loading, fetch: true})

		Storage.FetchAll({query: search}).then(resp => {
			setStorage(resp.storages)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				// Let the StorageList deal with having no storage
				return true;
			}
			return false;
		})).finally(() => {
			setLoading({...loading, fetch: false})
		})
	}, []);

	const toolbar: ToolbarFunction[] = [
		{
			icon: "plus",
			on: () => {
				navigate("create");
			},
		}
	]

	// @TODO Store the search as a query parameter
	const onSearch = (query: string) => {
		setMessage(undefined)

		setSearchParams({search: query}, {replace: true})
		setLoading({...loading, search: true})

		Storage.FetchAll({query}).then(resp => {
			setStorage(resp.storages)
		}).catch(handleError(setMessage, (e: TwirpError) => {
			if (e.code === "not_found") {
				setStorage([])
				return true;
			}
			return false;
		})).finally(() => {
			setLoading({...loading, search: false})
		})
	}

	const onPageChange = ({}, data: PaginationProps) => {
		setSearchParams({page: data.activePage?.toString() || "1", search: search}, {replace: true})
	}

	const totalPages = useMemo(() => Math.ceil(storage.length / 10), [storage])

	return (<Fragment>
		<ToolbarSearch onSearch={onSearch} hint="Search storage..." loading={{...LoadingStatus.defaultValue(), fetch: false}} functions={toolbar} value={search} />
		<div style={{height: "650px"}}>
		<StorageList storage={storage.slice((page-1)*10, page*10)} loading={loading.fetch} attached={message !== undefined}/>
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
