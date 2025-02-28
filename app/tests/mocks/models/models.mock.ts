import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const MockModels = {};

// Dynamically Load Models
for (const model of readdirSync(resolve(__dirname))) {
  if (model === 'models.mock.ts') continue;
  const modelName = model
    .split('_')
    .map((m) => `${m.charAt(0).toUpperCase()}${m.slice(1)}`)
    .join('');
  const mockModelName = `Mock${modelName}Model`;
  MockModels[modelName] = require(
    resolve(__dirname, model, readdirSync(resolve(__dirname, model))[0]),
  )[mockModelName];
}
