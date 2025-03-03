export function appEnvTransformer(env: Record<string, string>) {
  const transformedEnv: Record<string, any> = { ...env };

  if (env.IMAGE_PROCESSING_TOPIC_PARTITIONS) {
    transformedEnv.IMAGE_PROCESSING_TOPIC_PARTITIONS = Number(
      env.IMAGE_PROCESSING_TOPIC_PARTITIONS,
    );
  }

  if (env.IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS) {
    transformedEnv.IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS = Number(
      env.IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS,
    );
  }

  return transformedEnv;
}
