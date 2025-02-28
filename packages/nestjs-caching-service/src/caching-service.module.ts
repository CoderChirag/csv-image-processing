import { DynamicModule, Module } from "@nestjs/common";
import { CACHE_TYPES, ICachingServiceConfig } from "@app/caching-service";
import { CachingServiceProvider } from "./caching-service.provider";

export interface CachingServiceConfig<T extends CACHE_TYPES> {
	type: T;
	providerName: string;
	global?: boolean;
	withTransactionLogger?: boolean;
	loggerToken?: string;
	config: ICachingServiceConfig<T>;
}

@Module({})
export class CachingServiceModule {
	static forRoot<T extends CACHE_TYPES>(cachingConfig: CachingServiceConfig<T>): DynamicModule {
		return {
			module: CachingServiceModule,
			providers: [
				CachingServiceProvider(
					cachingConfig.providerName,
					cachingConfig.type,
					cachingConfig.config,
					cachingConfig.withTransactionLogger,
					cachingConfig.loggerToken,
				),
			],
			exports: [cachingConfig.providerName],
			global: cachingConfig.global ?? true,
		};
	}
}
