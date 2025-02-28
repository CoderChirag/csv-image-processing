import { Agent } from "elastic-apm-node";
import { Logger } from "@app/utility-types";
import { ClientOptions } from "@elastic/elasticsearch";
import { SUPPORTED_DBS } from "../constants";

export interface IElasticsearchConfigOptions {
	type: typeof SUPPORTED_DBS.ELASTICSEARCH;
	clientOptions: ClientOptions;
	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}
