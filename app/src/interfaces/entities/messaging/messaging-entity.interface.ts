export interface IMessagingEntity {
  registerSchemas(): Promise<void>;
  initializeTopics(): Promise<void>;
}
