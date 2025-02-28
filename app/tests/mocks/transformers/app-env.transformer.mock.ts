export function mockAppEnvTransformer(env: Record<string, string>) {
  const transformedEnv: Record<string, any> = { ...env };

  return transformedEnv;
}
